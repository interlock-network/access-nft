//
// INTERLOCK NETWORK - CLI INTERFACE
// PSP34 ACCESS NFT AUTHENTICATION
//

// imports (anything polkadot with node-js must be required)
const { ApiPromise, WsProvider, Keyring } = require('@polkadot/api');
const { ContractPromise, CodePromise } = require('@polkadot/api-contract');
const WeightV2 = require('@polkadot/types/interfaces');

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


// utility functions
import {
  contractGetter,
  setupSession,
  terminateProcess,
  contractDoer
} from "./utils";

const OWNER_MNEMONIC = process.env.OWNER_MNEMONIC;


// setup socket connection with autheticateWallet script
var socket = io('http://localhost:3000');
socket.on('connect', async () => {

  console.log(blue(`ACCESSNFT:`) +
    ` accessApp socket connected, ID ` + cyan(`${socket.id}`));
   
  // establish connection with blockchain
  const [ api, contract ] = await setupSession('setAuthenticated');
	
	var wallet;
  var username;
	var usernameHash;
  var password;
	var passwordHash;

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

    (async () => {
			var isAvailable = false;
			while (isAvailable == false) {
      let response = await prompts({
        type: 'text',
        name: 'username',
        message: 'Please choose a username with no spaces.',
        validate: username => !isValidUsername(username) ?
		      red(`ACCESSNFT: `) + `Spaces are not permitted.` : true
      });

			if (await isAvailableUsername(api, contract, getHash(response.username))) {
							isAvailable = true;
			} else {
					console.log(red(`ACCESSNFT: `) + `Username already taken.`);
			}
			}
		  username = response.username;
    })();
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


// Check if valid username.
const isValidUsername = (username) => {
  try {

		if (/\s/.test(username)) {
      return false
		}
    return true
  } catch (error) {
    return false
  }
}

// Check if username is available
const isAvailableUsername = async (api, contract, usernameHash)  => {
  try {

  // create keypair for owner
  const keyring = new Keyring({type: 'sr25519'});
  const OWNER_PAIR = keyring.addFromUri(OWNER_MNEMONIC);

  // define special type for gas weights
  type WeightV2 = InstanceType<typeof WeightV2>;
  const gasLimit = api.registry.createType('WeightV2', {
    refTime: 2**53 - 1,
    proofSize: 2**53 - 1,
  }) as WeightV2;

  // get getter output
  var { gasRequired, storageDeposit, result, output } =
    await contract.query['checkCredential'](
      OWNER_PAIR.address, {gasLimit}, '0x' + usernameHash);

  // convert to JSON format for convenience
  const RESULT = JSON.parse(JSON.stringify(result));
  const OUTPUT = JSON.parse(JSON.stringify(output));


    if (RESULT.ok.flags == 'Revert') {


        // logging custom error
        let error = OUTPUT.ok.err.custom.toString().replace(/0x/, '')
        console.log(green(`ACCESSNFT:`) +
          color.bold(` username available`));
				return true
			

    }
					console.log(result)
					console.log(RESULT)
    // check if OK result is reverted contract that returned error
			return false
    


			console.log(usernameHash)

  } catch (error) {
    console.log(error)
  }
}

// calculate hash
const getHash = (input) => {

  const digest = crypto
    .createHash('sha256')
    .update(input)
    .digest('hex');

		console.log(digest)

		return digest
}



//
// convert hex string to ASCII string
//
function hexToString(hex: String) {

  // iterate through hex string taking byte chunks and converting to ASCII characters
  var str = '';
  for (var i = 0; i < hex.length; i += 2) {
    str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
  }

  return str;
}
