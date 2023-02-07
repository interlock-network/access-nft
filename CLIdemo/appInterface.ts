//
// INTERLOCK NETWORK - CLI INTERFACE
// PSP34 ACCESS NFT AUTHENTICATION
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
import * as bs58check from 'bs58check';

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
  
var wallet;
var username;
var password;

// start menu options
const options = [
  'mint NFT',
  'authenticate NFT',
  'display collection',
  'reset username and password',
  'login to secure area'
];

// setup socket connection with autheticateWallet script
var socket = io('http://localhost:3000');
socket.on('connect', async () => {

  console.log(blue(`ACCESSNFT:`) +
    ` accessApp socket connected, ID ` + cyan(`${socket.id}`));
   
  // establish connection with blockchain
  const [ api, contract ] = await setupSession('setAuthenticated');

  // begin prompt tree
  //
  // first prompt: wallet address
  (async () => {

    // get valid wallet address
    let responseWallet = await prompts({
      type: 'text',
      name: 'wallet',
      message: 'Please enter the wallet address containing\nthe NFT you would like to authenticate.',
      validate: wallet => (!isValidSubstrateAddress(wallet) && (wallet.length > 0)) ?
        red(`ACCESSNFT: `) + `Invalid address` : true
    });
    wallet = responseWallet.wallet;

    // second prompt: username
    (async () => {

      // loop prompt until valid username
      var isAvailable = false;
      while (isAvailable == false) {

        // get valid username
        var responseUsername = await prompts({
          type: 'text',
          name: 'username',
          message: 'Please choose a username with 5 or more characters and no spaces.',
          validate: username => !isValidUsername(username) ?
            red(`ACCESSNFT: `) + `Too short or contains spaces.` : true
        });

        // if valid, check if username is available
        if (await isAvailableUsername(api, contract, getHash(responseUsername.username))) {
          isAvailable = true;
        } else {
          console.log(red(`ACCESSNFT: `) + `Username already taken.`);
        }
      }
      username = responseUsername.username;
    
      // third prompt: password
      (async () => {

        // loop prompt until valid username
        var passwordVerify = '********';
        
          // loop prompt until valid password match
          do {

            // get valid password
            var responsePassword = await prompts([
              {
                type: 'password',
                name: 'password',
                message: 'Please choose a password with 8 or more characters.\nIt may contain whitespace.',
                validate: password => (password.length < 8) ?
                  red(`ACCESSNFT: `) + `Password too short.` : true
              },
              {
                type: 'password',
                name: 'passwordVerify',
                message: 'Please verify your password.',
              }
            ]);
            passwordVerify = responsePassword.passwordVerify;
             password = responsePassword.password;

            if (  password != passwordVerify) {
              console.log(red(`ACCESSNFT: `) + `password mismatch`);
            }
          }
        while (password != passwordVerify)
        console.log(green(`ACCESSNFT: `) + `successfully entered information`);
      })();
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

    // address encodes/decodes wo error => valid address
    return true

  } catch (error) {

    // encode/decode failure => invalid address
    return false
  }
}


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

    // if this call reverts, then only possible error is 'credential nonexistent'
    if (RESULT.ok.flags == 'Revert') {

      // logging custom error
      let error = OUTPUT.ok.err.custom.toString().replace(/0x/, '')
      console.log(green(`ACCESSNFT:`) +
        color.bold(` username available`));

      // username is available
      return true
    }
    
    // username is not available
    return false

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

  return digest
}

