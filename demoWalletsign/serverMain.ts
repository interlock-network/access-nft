//
// INTERLOCK NETWORK & ALEPH ZERO
// PSP34 UNIVERSAL ACCESS NFT - SERVER MAIN
//

// 
// This is the parent script for the access NFT authentication process.
// It runs persistently, and spawns a verifyAddressChild process each time somebody
// wishes to authenticate the fact that they possess an access NFT,
// to establish access credentials of some sort. This script is meant to
// be simple, limited to listening for requests to authenticate, and spawing
// script to gather credentials in the case of authentication success.
//

import { fork } from 'child_process';

// child process paths
import * as path from 'path';
const verifyAddress = path.resolve('serverVerifyAddress.js');
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
// ...in practice NFTPRICE may be variable.

// map to keep track of waiting address transfers
// mapping is address -> [socketId, userhash, passhash, nftId]
var waitingQueue = new Map();
// mapping is address -> [socketId, NFTPRICE]
var mintQueue = new Map();

async function transferListener(socket) {

  // establish connection with blockchain
  const [ api, contract ] = await setupSession('transferListener');
  
  // successful transferListener initialization
  console.log(green(`UA-NFT`) + color.bold(`|AUTH-SERVER: `) +
    color.bold(`authentication/registration server running`));
  console.log('');
  console.log(color.bold(`   ! please connect UA-NFT client app`));
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

        const sendingAddress = event.data[0];
        const receivingAddress = event.data[1];
        const transferAmount = event.data[2];

        //console.log(event)
        // check for verification transfers
        //
        // from Interlock
        if ( sendingAddress == OWNER_ADDRESS &&
          transferAmount == AMOUNT) {

          console.log(green(`UA-NFT`) + color.bold(`|AUTH-SERVER: `) +
            color.bold(`auth transfer complete  `));
          console.log(yellow(`UA-NFT`) + color.bold(`|AUTH-SERVER: `) +
            `need return transfer to `);
          console.log(yellow(`UA-NFT`) + color.bold(`|AUTH-SERVER: `) +
            magenta(`${receivingAddress}\n`));
        //
        // from verifying address
        } else if (receivingAddress == OWNER_ADDRESS &&
          transferAmount == AMOUNT) {
                
          const clientAddress = sendingAddress.toHuman();
          const clientSocketId = waitingQueue.get(clientAddress)[0];
          const userhash = waitingQueue.get(clientAddress)[1];
          const passhash = waitingQueue.get(clientAddress)[2];
          const nftId = waitingQueue.get(clientAddress)[3];

          console.log(green(`UA-NFT`) + color.bold(`|AUTH-SERVER: `) +
            color.bold(`received transfer from `));
          console.log(green(`UA-NFT`) + color.bold(`|AUTH-SERVER: `) +
            magenta(`${clientAddress}`));
          console.log(green(`UA-NFT`) + color.bold(`|AUTH-SERVER: `) +
            color.bold(`authenticated!\n`));

          // notify the client that their transfer was recorded
          io.to(clientSocketId).emit('payment-received', [nftId]);
        
          // change contract state to indicate nft is authenticated
          const setAuthenticatedChild = fork(setAuthenticated);
          setAuthenticatedChild.send(clientAddress);

          // listen for results of setAuthenticated process child
          setAuthenticatedChild.on('message', message => {

            // communicate to client application that isauthenticated is set true
            io.to(clientSocketId).emit('setAuthenticated-complete', [nftId]);

            // fork process to set credentials provided at authenticate-address call
            const setCredentialsChild = fork(setCredentials);
            setCredentialsChild.send({
              id: nftId,
	      address: clientAddress,
              userhash: userhash,
              passhash: passhash
            });
            
            // listen for results of 
            setCredentialsChild.on('message', () => {

              io.to(clientSocketId).emit('credential-set', [nftId, userhash, passhash]);
              waitingQueue.delete(clientAddress);
            });
          });
        } else if (receivingAddress == OWNER_ADDRESS &&
          mintQueue.has(sendingAddress.toHuman()) &&
          transferAmount.toNumber() == mintQueue.get(sendingAddress.toHuman())[1]) {

          const recipient = sendingAddress.toHuman();
          const clientSocketId = mintQueue.get(recipient)[0];

          console.log(green(`UA-NFT`) + color.bold(`|AUTH-SERVER: `) +
            color.bold(`got NFT payment from `));
          console.log(green(`UA-NFT`) + color.bold(`|AUTH-SERVER: `) +
            magenta(`${recipient}`));
          console.log(green(`UA-NFT`) + color.bold(`|AUTH-SERVER: `) +
            color.bold(`minting NFT!\n`));

          // notify the client that their transfer was recorded
          io.to(clientSocketId).emit('minting-nft', [NFTPRICE]);
        
          // fire up minting script
          const mintChild = fork(mint);
          mintChild.send(recipient);

          // listen for results of setAuthenticated process child
          mintChild.on('message', async message => {

            // get new array of nfts
            //
            // get nft collection for address
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

      const address = args[0][0];
      const userhash = args[0][1];
      const passhash = args[0][2];

      // store address -> socketID in working memory
      if (!waitingQueue.has(address)) {
      
        waitingQueue.set(address, [socket.id, userhash, passhash, 0]);

        // initiate authentication process for address
        const verifyAddressChild = fork(verifyAddress);
        verifyAddressChild.send(address);

        verifyAddressChild.on('message', (contents) => {

          if (contents == 'all-nfts-authenticated') {

            io.to(socket.id).emit('all-nfts-authenticated');
            waitingQueue.delete(address);

            console.log(red(`UA-NFT`) + color.bold(`|AUTH-SERVER: `) +
              magenta(`${address}`));
            console.log(red(`UA-NFT`) + color.bold(`|AUTH-SERVER: `) +
              `needs nonauthenticated nft\n`);

          } else {

            io.to(socket.id).emit(`${contents}`);
          }
          return
        });

      } else {

        let waitingAddressInfo = waitingQueue.get(address);
        const waitingNftId = waitingAddressInfo[3];

        waitingAddressInfo = [socket.id, userhash, passhash, waitingNftId];
        waitingQueue.set(address, waitingAddressInfo);

        io.to(socket.id).emit('already-waiting', [waitingNftId]);

        console.log(red(`UA-NFT`) + color.bold(`|AUTH-SERVER: `) +
          magenta(`${address}`));
        console.log(red(`UA-NFT`) + color.bold(`|AUTH-SERVER: `) +
          `owes micropayment\n`);
      }
    } else if (message == 'mint-nft') {

      const recipient = args[0][0];
      
      // log that we are expecting payment of NFTPRICE from recipient in immediate future
      //
      // payments to OWNER account that have not requested an nft mint will not be honored
      mintQueue.set(recipient, [socket.id, NFTPRICE]);

      io.to(socket.id).emit('pay-to-mint', [NFTPRICE]);

      console.log(green(`UA-NFT`) + color.bold(`|AUTH-SERVER: `) +
        `waiting on payment from`);
      console.log(green(`UA-NFT`) + color.bold(`|AUTH-SERVER: `) +
        magenta(`${recipient}\n`));

      // remove recipient from mint queue after one minute of no payment receipt
      //
      // this is to avoid ddos type scenario where someone crashes server by flooding with mint requests
      await setTimeout( () => {

        if (mintQueue.has(recipient)) {
        
          mintQueue.delete(recipient);
          console.log(red(`UA-NFT`) + color.bold(`|AUTH-SERVER: `) + 
            `NFT payment timeout for`);
          console.log(red(`UA-NFT`) + color.bold(`|AUTH-SERVER: `) + 
            magenta(`${recipient}`));
          console.log(red(`UA-NFT`) + color.bold(`|AUTH-SERVER: `) + 
            `removing from mint queue\n`);
        }
      }, 60000); // one minute delay

    } else if (message == 'waiting') {

      const hash = args[0][0];
      const nftId = args[0][1];
      const address = args[0][2];
      let waitingAddressInfo = waitingQueue.get(address);
      const clientSocketId = waitingAddressInfo[0];
      
      waitingAddressInfo[3] = nftId;
      waitingQueue.set(address, waitingAddressInfo);

      io.to(clientSocketId).emit('return-transfer-waiting', [nftId, hash]);
            
    }  else  {

      // relay message to applications
      socket.emit(`apprelay-${message}`, ...args);
    }
  });
});

// fire up http server
const PORT = 3000;
httpServer.listen(PORT, () => {
  console.log(blue(`\nUA-NFT`) + color.bold(`|AUTH-SERVER: `) +
    `server listening on ` + cyan(`*:${PORT}`));
});

// setup socket connection to server with listenting
// part of the script
var ioclient = require('socket.io-client');
var socket = ioclient(`http://localhost:${PORT}`);
socket.on('connect', () => {

  console.log(blue(`UA-NFT`) + color.bold(`|AUTH-SERVER: `) +
    `transferListener connected`);
    
  // initiate async function above that listens for transfer events
  transferListener(socket).catch((error) => {

    console.error(error);
    process.exit(-1);
  });
});

