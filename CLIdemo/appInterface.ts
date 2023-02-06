//
// INTERLOCK NETWORK - CLI INTERFACE
// PSP34 ACCESS NFT AUTHENTICATION
//

// imports
import { io } from 'socket.io-client';
import * as inquirer from 'inquirer';
import * as crypto from 'crypto';

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
   
  var wallet;
  var username;
  var password;

  inquirer
    .prompt([

      {
        name: 'wallet',
        type: 'input',
        message: 'Please enter the wallet address holding an NFT that you would like to authenticate:'
      },
      {
        name: 'username',
        type: 'input',
        message: 'Please enter the username you would like to use for your access privilege. Please keep it under 23 characters, and no spaces.'
      },
      {
        name: 'password',
        type: 'password',
        message: 'Please enter your password. It may be as long as you like.'
      },
    ])
    .then((answer) => {

      const userhash = crypto
        .createHash('sha256')
        .update(answer.username)
        .digest('hex');

      const passhash = crypto
        .createHash('sha256')
        .update(answer.password)
        .digest('hex');

      socket.emit('authenticate-nft', [answer.wallet, userhash, passhash]);
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
