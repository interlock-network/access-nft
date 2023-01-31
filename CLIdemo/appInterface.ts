//
// INTERLOCK NETWORK - CLI INTERFACE
// PSP34 ACCESS NFT AUTHENTICATION
//

// imports
var io = require('socket.io-client');
const inquirer = require('inquirer');

// specify color formatting
const color = require('cli-color');
const red = color.red.bold;
const green = color.green.bold;
const blue = color.blue.bold;
const cyan = color.cyan.bold;
const yellow = color.yellow.bold;
const magenta = color.magenta.bold;


// setup socket connection with autheticateWallet script
var socket = io.connect('http://localhost:3000', {reconnect: true});
socket.on('connect', () => {

  console.log(blue(`ACCESSNFT:`) +
    ` accessApp socket connected, ID ` + cyan(`${socket.id}`));
   
  inquirer
    .prompt([
      {
        name: 'wallet',
        type: 'input',
        message: 'Please enter the wallet address you would like to authenticate:'
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
