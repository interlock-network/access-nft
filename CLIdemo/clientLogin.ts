//
// INTERLOCK NETWORK & ALEPH ZERO
// PSP34 UNIVERSAL ACCESS NFT - CLIENT LOGIN
//

// imports (anything polkadot with node-js must be required)
const { ApiPromise, WsProvider, Keyring } = require('@polkadot/api');
const { ContractPromise, CodePromise } = require('@polkadot/api-contract');
const { decodeAddress, encodeAddress } = require('@polkadot/keyring')
const WeightV2 = require('@polkadot/types/interfaces');

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

// start menu options
const options = [
  { title: 'logout now', value: 'logout' },
];

// setup socket connection with autheticateWallet script
var socket = io('https://localhost:8443', {
		rejectUnauthorized: false
});
socket.on('connect', async () => {

  console.log(blue(`ACCESSNFT:`) +
    ` accessApp socket connected, ID ` + cyan(`${socket.id}`));

  // begin prompt tree
  //
  // first prompt: login username
  (async () => {

    // get username
    var responseUsername = await prompts({
      type: 'text',
      name: 'username',
      message: 'Please enter your username.',
      validate: username => !isValidUsername(username) ?
        red(`ACCESSNFT: `) + `Too short or contains spaces.` : true
    });
    const username = responseUsername.username;
    console.log('');
    
    // second prompt: password
    (async () => {

      // get password
      var responsePassword = await prompts({
        type: 'password',
        name: 'password',
        message: 'Please enter your password.',
        validate: password => (password.length < 8) ?
          red(`ACCESSNFT: `) + `Password invalid.` : true
		  });
      const password = responsePassword.password;
			console.log('');

      console.log(green(`ACCESSNFT: `) +
			  `submitting login information over secure connection for verification\n`);

			socket.emit('request-access', username, password);

			socket.onAny((message, ...args) => {

				if (message == 'bad-username') {

      		console.log(red(`ACCESSNFT: `) +
			  		`username is incorrect or does not exist...please try again`);
					console.log('');
					process.send('fail');
					process.exit();

				} else if (message == 'bad-password') {

      		console.log(red(`ACCESSNFT: `) +
			  		`password is incorrect...please try again`);
					console.log('');
					process.send('fail');
					process.exit();

				} else if (message == 'access-granted') {

					console.clear();
					console.log(`SUCCESS!!!\n\n\n\n\n\n\n`);
					socket.emit('fetch-art');

					socket.on('ascii-art', (art) => {

						console.log(red(`\n\n${art}`));
						console.log(`\n\n\n\n\n\n\n`);

					  // prompt
 						//
  					// do something useful?
  					(async () => {

    					// get response
    					var responseSomething = await prompts({
      					type: 'confirm',
      					name: 'something',
      					message: 'do something useful?',
    					});
   						const something = responseSomething.something;
    					console.log('');

							if (something) {
								socket.emit('do-something-useful');
							} else {
								socket.emit('do-something-useless');
							}
						})();
					});

					socket.on('did-something-useful', (result) => {

						console.log(
							green('You just did something useful by setting somethingUseful=true in the restricted area..\n'));

  					(async () => {

    					var choice = await prompts({
      					type: 'select',
      					name: 'logout',
      					message: 'Now choose one of the following options:',
								choices: [{ title: 'logout now', value: 'logout' }]
							});
   						
    					console.log('');
							socket.emit('logout');
							console.log('goodbye\n');
							process.send('done');
							process.exit();
						})();
					});

					socket.on('did-something-useless', (result) => {

						console.log(
							red('You just did something useless by setting somethingUseful=false in the restricted area..\n'));

  					(async () => {

    					var choice = await prompts({
      					type: 'select',
      					name: 'logout',
      					message: 'Now choose one of the following options:',
								choices: [{ title: 'logout now', value: 'logout' }]
    					});
   						
    					console.log('');
							socket.emit('logout');
							console.log('goodbye\n');
							process.send('done');
							process.exit();
						})();
					});
				}
			});
    })();
  })();
});

// Check if valid username.
const isValidUsername = (username) => {
  try {

    // search for any whitespace
    if (/\s/.test(username)) {

      // username not valid
      return false

    // make sure not too short
    } else if (username.length < 5) {

      // username not valid
      return false
    }

    // username valid
    return true

  } catch (error) {
    return false
  }
}


