//
// INTERLOCK NETWORK - CLI INTERFACE
// PSP34 ACCESS NFT AUTHENTICATION
//

// imports
import { io } from 'socket.io-client';
import * as inquirer from 'inquirer';
import * as prompts from 'prompts';
import * as crypto from 'crypto';
import * as bs58check from 'bs58check';
const { decodeAddress, encodeAddress } = require('@polkadot/keyring')
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
  var walletValid = false;
  var username;
  var usernameValid = false;
  var password;

  const options = [
    'mint NFT',
    'authenticate NFT',
    'display collection',
    'reset username and password',
    'login to secure area'
  ];

  (async () => {
    let response = await prompts({
      type: 'text',
      name: 'wallet',
      message: 'Please enter the wallet address containing\nthe NFT you would like to authenticate.',
      validate: wallet => !isValidSubstrateAddress(wallet) ?
			 red(`ACCESSNFT: `) + `Invalid address` : true
    });
		wallet = response.wallet;
  })();

/*
	    console.log(answer.wallet)
	    console.log(answer.walletValid)
      const userhash = crypto
        .createHash('sha256')
        .update(answer.username)
        .digest('hex');

      const passhash = crypto
        .createHash('sha256')
        .update(answer.password)
        .digest('hex');

      socket.emit('authenticate-nft', [answer.wallet, userhash, passhash]);
*/

});

socket.onAny((message, ...args) => {

  console.log(message, ...args);
});

// Check address.
const isValidSubstrateAddress = (wallet) => {
  try {

    encodeAddress(decodeAddress(wallet))
    return true
  } catch (error) {
    return false
  }
}


