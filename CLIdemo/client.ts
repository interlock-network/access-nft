//
// INTERLOCK NETWORK - CLIENT
// PSP34 ACCESS NFT AUTHENTICATION
//

// imports (anything polkadot with node-js must be required)
const { ApiPromise, WsProvider, Keyring } = require('@polkadot/api');
const { ContractPromise, CodePromise } = require('@polkadot/api-contract');
const { decodeAddress, encodeAddress } = require('@polkadot/keyring')
const WeightV2 = require('@polkadot/types/interfaces');

import { fork } from 'child_process';

// child process paths
import * as path from 'path';
const mint = path.resolve('clientMint.js');
const authenticate = path.resolve('clientAuthenticate.js');
const display = path.resolve('clientDisplay.js');
const reset = path.resolve('clientReset.js');
const login = path.resolve('clientLogin.js');

// imports
import { io } from 'socket.io-client';
import * as prompts from 'prompts';
import * as crypto from 'crypto';

// specify color formatting
import * as color from 'cli-color';
const red = color.red.bold;
const green = color.green.bold;
const blue = color.blue.bold;
const cyan = color.cyan;
const yellow = color.yellow.bold;
const magenta = color.magenta;

// utility functions
import {
  setupSession,
} from "./utils";

const OWNER_MNEMONIC = process.env.OWNER_MNEMONIC;
  
var wallet;
var username;
var password;

// start menu options
const options = [
  { title: 'mint universal access NFT', value: 'mint' },
	{ title: 'authenticate universal access NFT', value: 'authenticate' },
	{ title: 'display universal access NFT collection', value: 'display' },
	{ title: 'reset username and password secure restricted access area', value: 'reset' },
	{ title: 'login to secure restricted access area', value: 'login' }
];

async function mainMenu() {

try {
  const response = await prompts([
    {
      type: 'select',
      name: 'choice',
      message: 'Choose an action:',
      choices: options,
    }
  ]);

  switch (response.choice) {

		case 'mint':

		  // initiate minting process for wallet
      const mintChild = fork(mint);

		  mintChild.on('message', () => {
				mainMenu();
			});
			break;		

		case 'authenticate':

		  // initiate authentication process for wallet
      const authenticateChild = fork(authenticate);

		  authenticateChild.on('message', () => {
				mainMenu();
			});
			break;

		case 'display':

		  // display wallet's available NFTs
      const displayChild = fork(display);

		  displayChild.on('message', () => {
				mainMenu();
			});
			break;

		case 'reset':

		  // reset username and password
      const resetChild = fork(reset);

		  resetChild.on('message', () => {
				mainMenu();
			});
		  break;

		case 'login':

		  // login to secure restricted access area
      const loginChild = fork(login);

		  loginChild.on('message', () => {
				mainMenu();
			});
		  break;
	}

} catch (error) {
				console.log(error)
}

}

mainMenu()
