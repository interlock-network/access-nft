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
const setCredentials = path.resolve('setCredentials.js');
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
const cyan = color.cyan.bold;
const yellow = color.yellow.bold;
const magenta = color.magenta.bold;

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

          console.log(green(`ACCESSNFT:`) +
            color.bold(` verification transfer complete from wallet `) + magenta(`${event.data[0]}`));
          console.log(green(`ACCESSNFT:`) +
            ` wallet ` +  magenta(`${event.data[0]}`) + ` is verified`);
          socket.emit('set-authenticated', event.data[0].toHuman());
        }
      }
    });
  });
}

// interprocess and server client-app messaging
io.on('connection', (socket) => {

  // relay all script events to application
  socket.onAny((message, ...args) => {

    if (message == 'authenticate-nft') {

      // initiate authentication process for wallet
      const verifyWalletChild = fork(verifyWallet);
      verifyWalletChild.send(args[0]);

    } else if (message == 'set-authenticated')  {
   
      // change contract state to indicate nft is authenticated
      const setAuthenticatedChild = fork(setAuthenticated);
      setAuthenticatedChild.send(args[0]);

    } else if (message == 'setAuthenticated-complete') {

      // initiate script that sets credentiails
 //     const setCredentialChild = fork(setCredentials);
   //   setCredentialChild.send('');
      
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
    ` listening on ` + cyan(`*:`) + cyan(`${PORT}`));
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
