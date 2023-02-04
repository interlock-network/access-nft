//
// INTERLOCK NETWORK - CLI INTERFACE
// PSP34 ACCESS NFT AUTHENTICATION
//

// imports
import { io } from 'socket.io-client';
import * as inquirer from 'inquirer';
import * as crypto from 'crypto-js';

// specify color formatting
import * as color from 'cli-color';
const red = color.red.bold;
const green = color.green.bold;
const blue = color.blue.bold;
const cyan = color.cyan;
const yellow = color.yellow.bold;
const magenta = color.magenta;


// setup socket connection with autheticateWallet script
var socket = io('http://localhost:3000');
socket.on('connect', () => {

  console.log(blue(`ACCESSNFT:`) +
    ` accessApp socket connected, ID ` + cyan(`${socket.id}`));
   
  inquirer
    .prompt([

      {
        name: 'wallet',
        type: 'input',
        message: 'Please enter the wallet address holding an NFT that you would like to authenticate:'
      },
    ])
    .then((answer) => {

      socket.emit('authenticate-nft', answer.wallet);
    })
    .catch((error) => {
    
      if (error.isTtyError) {

        console.log(red(`ACCESSNFT: `) + error.isTtyError)
      } else {

        console.log(red(`ACCESSNFT: `) + error);
      }
    });
});

socket.onAny((message, ...args) => {

  console.log(message, ...args);
});
