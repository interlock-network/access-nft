//
// INTERLOCK NETWORK & ALEPH ZERO
// PSP34 UNIVERSAL ACCESS NFT - SERVER MAIN
//

// 
// This is the parent script for the access NFT authentication process.
// It runs persistently, and spawns a verifyWalletChild process each time somebody
// wishes to authenticate the fact that they possess an access NFT,
// to establish access credentials of some sort. This script is meant to
// be simple, limited to listening for requests to authenticate, and spawing
// script to gather credentials in the case of authentication success.
//

import { fork } from 'child_process';

// child process paths
import * as path from 'path';
const verifyWallet = path.resolve('serverVerifyWallet.js');
const setCredentials = path.resolve('serverSetCredential.js');
const setAuthenticated = path.resolve('serverSetAuthenticated.js');
const mint = path.resolve('serverMint.js');

// environment constants
import * as dotenv from 'dotenv';
dotenv.config();

// utility functions
import {
  setupSession,
  contractGetter
} from "./utils";

// specify color formatting
import * as color from 'cli-color';
const red = color.red.bold;
const green = color.green.bold;
const blue = color.blue.bold;
const cyan = color.cyan;
const yellow = color.yellow.bold;
const magenta = color.magenta;

// server
import * as express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);

// constants
const OWNER_ADDRESS = process.env.OWNER_ADDRESS;
const AMOUNT = 1;
const NFTPRICE = 10000000000000; // pico TZERO = 10 TZERO

// map to keep track of waiting wallet transfers
// mapping is [wallet -> socketID]
var walletInfo = new Map();
var mintQueue = new Map();

async function authenticateWallet(socket) {

  // establish connection with blockchain
  const [ api, contract ] = await setupSession('authenticateWallet');
  
  // successful authenticateWallet initialization
  console.log(green(`ACCESSNFT:`) +
    color.bold(` core access authentication service initialized`));
  console.log('');
  console.log(color.bold(`           ! please initialize or connect NFT access application`));
  console.log('');
  let notAuthenticatedId;

  // subscribe to system events via storage
  api.query.system.events((events) => {

    // loop through the Vec<EventRecord>
    events.forEach((record) => {

      // get data from the event record
      const { event, phase } = record;

      // listen for Transfer events
      if (event.method == 'Transfer') {

        const sendingWallet = event.data[0];
        const receivingWallet = event.data[1];
        const transferAmount = event.data[2];

        //console.log(event)
        // check for verification transfers
        //
        // from Interlock
        if ( sendingWallet == OWNER_ADDRESS &&
          transferAmount == AMOUNT) {

          console.log(green(`ACCESSNFT:`) +
            color.bold(` authentication transfer complete to wallet `) + magenta(`${event.data[1]}`));
          console.log(yellow(`ACCESSNFT:`) +
            ` waiting on returning verification transfer to wallet ` + magenta(`${event.data[1]}`));
        //
        // from wallet holder
        } else if (receivingWallet == OWNER_ADDRESS &&
          transferAmount == AMOUNT) {
                
          const clientWallet = sendingWallet.toHuman();
          const clientSocketId = walletInfo.get(clientWallet)[0];
          const userhash = walletInfo.get(clientWallet)[1];
          const passhash = walletInfo.get(clientWallet)[2];
          const nftId = walletInfo.get(clientWallet)[3];

          console.log(green(`ACCESSNFT:`) +
            color.bold(` verification transfer complete from wallet `) + magenta(`${clientWallet}`));
          console.log(green(`ACCESSNFT:`) +
            ` wallet ` +  magenta(`${clientWallet}`) + ` is verified`);

          // notify the client that their transfer was recorded
          io.to(clientSocketId).emit('payment-received', [nftId]);
        
          // change contract state to indicate nft is authenticated
          const setAuthenticatedChild = fork(setAuthenticated);
          setAuthenticatedChild.send(clientWallet);

          // listen for results of setAuthenticated process child
          setAuthenticatedChild.on('message', message => {

            // communicate to client application that isauthenticated is set true
            io.to(clientSocketId).emit('setAuthenticated-complete', [nftId]);

            // fork process to set credentials provided at authenticate-wallet call
            const setCredentialsChild = fork(setCredentials);
            setCredentialsChild.send({
              wallet: clientWallet,
              id: nftId,
              userhash: userhash,
              passhash: passhash
            });
            
            // listen for results of 
            setCredentialsChild.on('message', () => {

              io.to(clientSocketId).emit('credential-set', [nftId, userhash, passhash]);
              walletInfo.delete(clientWallet);
            });
          });
        } else if (receivingWallet == OWNER_ADDRESS &&
          mintQueue.has(sendingWallet.toHuman()) &&
          transferAmount.toNumber() == mintQueue.get(sendingWallet.toHuman())[1]) {

          const recipient = sendingWallet.toHuman();
          const clientSocketId = mintQueue.get(recipient)[0];

          console.log(green(`ACCESSNFT:`) +
            color.bold(` NFT payment transfer complete from wallet `) + magenta(`${recipient}`));
          console.log(green(`ACCESSNFT:`) +
            ` minting NFT for wallet ` +  magenta(`${recipient}`));

          // notify the client that their transfer was recorded
          io.to(clientSocketId).emit('minting-nft', [NFTPRICE]);
        
          // fire up minting script
          const mintChild = fork(mint);
          mintChild.send(recipient);

          // listen for results of setAuthenticated process child
          mintChild.on('message', async message => {

            // get new array of nfts
            //
            // get nft collection for wallet
            var [ gasRequired, storageDeposit, RESULT_collection, OUTPUT_collection ] =
              await contractGetter(
                api,
                socket,
                contract,
                'Main',
                'getCollection',
                recipient,
              );
            const collection = JSON.parse(JSON.stringify(OUTPUT_collection));

            // get the id of new nft (last in collection)
            const nftId = Array.from(collection.ok.ok).pop();

            // communicate to client application that mint of nft ID successful
            io.to(clientSocketId).emit('mint-complete', [nftId]);
            mintQueue.delete(recipient);
          });
        }
      }
    });
  });
}

// interprocess and server client-app messaging
io.on('connection', (socket) => {

  // relay all script events to application
  socket.onAny( async (message, ...args) => {

    if (message == 'authenticate-nft') {

      const wallet = args[0][0];
      const userhash = args[0][1];
      const passhash = args[0][2];


      // store wallet -> socketID in working memory
      if (!walletInfo.has(wallet)) {
      
        walletInfo.set(wallet, [socket.id, userhash, passhash, 0]);

        // initiate authentication process for wallet
        const verifyWalletChild = fork(verifyWallet);
        verifyWalletChild.send(wallet);

        verifyWalletChild.on('message', (contents) => {

          if (contents == 'all-nfts-authenticated') {

            io.to(socket.id).emit('all-nfts-authenticated');
            walletInfo.delete(wallet);

          } else {

            io.to(socket.id).emit(`${contents}`);
          }
          return
        });

      } else {

        const waitingWallet = walletInfo.get(wallet);
        const waitingNftId = waitingWallet[3];
        io.to(socket.id).emit('already-waiting', [waitingNftId]);
        socket.disconnect();
        console.log(red(`ACCESSNFT:`) +
          ` already waiting for wallet ` + magenta(`${wallet}`) + ` to return micropayment`);
        return
      }
    } else if (message == 'mint-nft') {

      const recipient = args[0][0];
      
      // log that we are expecting payment of NFTPRICE from recipient in immediate future
      //
      // payments to OWNER account that have not requested an nft mint will not be honored
      mintQueue.set(recipient, [socket.id, NFTPRICE]);

      io.to(socket.id).emit('pay-to-mint', [NFTPRICE]);

      // remove recipient from mint queue after one minute of no payment receipt
      //
      // this is to avoid ddos type scenario where someone crashes server by flooding with mint requests
      await setTimeout( () => {

        if (mintQueue.has(recipient)) {
        
          mintQueue.delete(recipient);
          console.log(color.magenta.bold(`ACCESSNFT: `) + 
            `mint recipient ${recipient} took too long to pay -- removed from mint queue`);
        }
      }, 60000); // one minute delay

    } else if (message == 'waiting') {

      const hash = args[0][0];
      const nftId = args[0][1];
      const wallet = args[0][2];
      const walletID = walletInfo.get(wallet);
      const clientSocketId = walletID[0];
      
      walletID[3] = nftId;
      walletInfo.set(wallet, walletID);

      io.to(clientSocketId).emit('return-transfer-waiting', [nftId, hash]);
            
    }  else  {

      // relay message to application
      socket.emit(`apprelay-${message}`, ...args);
    }
  });
});

// fire up http server
const PORT = 3000;
httpServer.listen(PORT, () => {
  console.log(blue(`ACCESSNFT:`) +
    ` listening on ` + cyan(`*:${PORT}`));
});

// setup socket connection to server with listenting
// part of the autheticateWallet script
var ioclient = require('socket.io-client');
var socket = ioclient(`http://localhost:${PORT}`);
socket.on('connect', () => {

  console.log(blue(`ACCESSNFT:`) +
    ` verifyWallet socket connected, ID ` + cyan(`${socket.id}`));
    
  // initiate async function above that listens for transfer events
  authenticateWallet(socket).catch((error) => {

    console.error(error);
    process.exit(-1);
  });
});

