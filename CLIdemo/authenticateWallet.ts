//
// INTERLOCK NETWORK & ALEPH ZERO
// PSP34 ACCESS NFT - AUTHENTICATE WALLET
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
const verifyWallet = path.resolve('verifyWallet.js');
const setCredentials = path.resolve('setCredential.js');
const setAuthenticated = path.resolve('setAuthenticated.js');

// environment constants
import * as dotenv from 'dotenv';
dotenv.config();

// utility functions
import {
  setupSession,
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

// map to keep track of waiting wallet transfers
// mapping is [wallet -> socketID]
var walletIDs = new Map();

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

        //console.log(event)
        // check for verification transfers
        //
        // from Interlock
        if ( event.data[0] == OWNER_ADDRESS &&
          event.data[2] == AMOUNT) {

          console.log(green(`ACCESSNFT:`) +
            color.bold(` authentication transfer complete to wallet `) + magenta(`${event.data[1]}`));
          console.log(yellow(`ACCESSNFT:`) +
            ` waiting on returning verification transfer to wallet ` + magenta(`${event.data[1]}`));
        //
        // from wallet holder
        } else if (event.data[1] == OWNER_ADDRESS &&
          event.data[2] == AMOUNT) {
		
          const wallet = event.data[0].toHuman();

          console.log(green(`ACCESSNFT:`) +
            color.bold(` verification transfer complete from wallet `) + magenta(`${event.data[0]}`));
          console.log(green(`ACCESSNFT:`) +
            ` wallet ` +  magenta(`${event.data[0]}`) + ` is verified`);
        
	  // change contract state to indicate nft is authenticated
          const setAuthenticatedChild = fork(setAuthenticated);
          setAuthenticatedChild.send(event.data[0]);

          // listen for results of setAuthenticated process child
	  setAuthenticatedChild.on('message', message => {

            // communitcate to client application that isauthenticated is set true
            io.to(walletIDs.get(wallet)[0]).emit('setAuthenticate-complete');

            // fork process to set credentials provided at authenticate-wallet call
            const setCredentialsChild = fork(setCredentials);
            setCredentialsChild.send({
              wallet: wallet,
              id: message[0].u64,
              userhash: walletIDs.get(wallet)[1],
              passhash: walletIDs.get(wallet)[2],

            });
            
            // listen for results of 
            setCredentialsChild.on('message', () => {

              io.to(walletIDs.get(wallet)[0]).emit('setCredentials-complete');
              walletIDs.delete(wallet);
            });
	  });
        }
      }
    });
  });
}

// interprocess and server client-app messaging
io.on('connection', (socket) => {

  // relay all script events to application
  socket.onAny((message, ...args) => {

    const wallet = args[0][0];
    const userhash = args[0][1];
    const passhash = args[0][2];

    if (message == 'authenticate-nft') {

      // store wallet -> socketID in working memory
      if (!walletIDs.has(wallet)) {
      
        walletIDs.set(wallet, [socket.id, userhash, passhash]);

        // initiate authentication process for wallet
        const verifyWalletChild = fork(verifyWallet);
        verifyWalletChild.send(wallet);

        verifyWalletChild.on('message', (contents) => {

          if (contents == 'all-nfts-authenticated') {

            io.to(socket.id).emit('all-nfts-authenticated');
            walletIDs.delete(wallet);

          } else if (contents == 'waiting') {

            io.to(socket.id).emit('return-transfer-waiting');

          } else {

            io.to(socket.id).emit(`${contents}`);
          }
	  return
        });

      } else {

        io.to(socket.id).emit('already-waiting');
        socket.disconnect();
        console.log(red(`ACCESSNFT:`) +
          ` already waiting for wallet ` + magenta(`${wallet}`) + ` to return micropayment`);
	return
      }
    } else {

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

