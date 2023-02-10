//
// INTERLOCK NETWORK & ALEPH ZERO
// PSP34 UNIVERSAL ACCESS NFT - CLIENT AUTHENTICATE
//

// imports (anything polkadot with node-js must be required)
const { ApiPromise, WsProvider, Keyring } = require('@polkadot/api');
const { ContractPromise, CodePromise } = require('@polkadot/api-contract');
const { decodeAddress, encodeAddress } = require('@polkadot/keyring')
const WeightV2 = require('@polkadot/types/interfaces');

// imports
import { io } from 'socket.io-client';
import { fork } from 'child_process';
import * as prompts from 'prompts';

// environment constants
import * as dotenv from 'dotenv';
dotenv.config();

// child process paths
import * as path from 'path';
const menu = path.resolve('client.js');

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
  getHash,
  returnToMain
} from "./utils";

const OWNER_ADDRESS = process.env.OWNER_ADDRESS;
const OWNER_MNEMONIC = process.env.OWNER_MNEMONIC;
  
var wallet;
var username;
var password;
var passwordVerify;

// setup socket connection with autheticateWallet script
var socket = io('http://localhost:3000');
socket.on('connect', async () => {

  console.log(blue(`\nACCESSNFT: `) +
    color.bold(`UNIVERSAL ACCESS NFT DEMO APP, socket ID ` + cyan(`${socket.id}`)) + 
    color.bold(` connected successfully to the secure registration server.`));
   
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
      message: 'Please enter the wallet address containing the NFT you would like to authenticate.\n',
      validate: wallet => (!isValidSubstrateAddress(wallet)) ?
        red(`ACCESSNFT: `) + `Invalid address` : true
    });
    wallet = responseWallet.wallet;
    console.log('');
    
      // if valid, check to see if wallet has nft collection
      if (!(await hasCollection(api, contract, wallet))) {
        
        console.log(red(`ACCESSNFT: `) +
           color.bold(`This wallet has no universal access NFT collection. Please return to main menu to mint.\n`));

        // if no collection propmt to return to main menu      
        await returnToMain('return to main menu to mint NFT');
      }

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
        username = responseUsername.username;
        console.log('');

        // if valid, check if username is available
        if (await isAvailableUsername(api, contract, getHash(username))) {

          // break the prompt loop
          isAvailable = true;

        } else {

          console.log(red(`ACCESSNFT: `) +
            `Username already taken. Choose a different username.\n`);
        }
      }
    
      // third prompt: password
      (async () => {
        
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
          console.log('');

          if (  password != passwordVerify) {
            console.log(red(`ACCESSNFT: `) + `Password mismatch.`);
          }
        }
        while (password != passwordVerify);
        
        console.log(green(`ACCESSNFT: `) +
          color.bold(`You successfully entered credential and wallet information.`));
        console.log(yellow(`ACCESSNFT: `) +
          color.bold(`Wait while we transfer a micropayment to your wallet.\n`));

        socket.emit('authenticate-nft', [wallet, getHash(username), getHash(password)]);

      })().catch(error => otherError());
    })().catch(error => otherError());
  })().catch(error => otherError());
});

socket.onAny(async (message, ...args) => {

  if (message == 'return-transfer-waiting') {

    const nftId = args[0][0];
    const transactionHash = args[0][1];

    console.log(yellow(`ACCESSNFT: `) +
      color.bold(`We just transfered a verification micropayment of 1 pico AZERO to your wallet at`));
    console.log(yellow(`ACCESSNFT: `) +
      magenta(`${wallet}` + `\n`));
    console.log(yellow(`ACCESSNFT: `) +
      color.bold(`You may confirm this via the transaction hash`));
  
    console.log(yellow(`ACCESSNFT: `) +
      cyan(`0x${transactionHash}`) + `\n`);

    console.log(green(`ACCESSNFT: `) +
      color.bold(`Please transfer 1 pico AZERO in return to complete`));
    console.log(green(`ACCESSNFT: `) +
      color.bold(`your registration for universal access NFT `) +
      red(`ID ${nftId}`) + color.bold(` to our wallet:`)) 
    console.log(green(`ACCESSNFT: `) +
      magenta(`${OWNER_ADDRESS}\n`));

    console.log(yellow(`ACCESSNFT: `) +
      color.bold(`The purpose of this is to make sure you actually own the wallet (and NFT) you claim to own.\n`));

  } else if (message == 'already-waiting') {

    const nftId = args[0][0];

    console.log(red(`ACCESSNFT: `) +
      color.bold(`We are still waiting on your wallet verification micropayment for NFT `) +
      red(`ID ${nftId}`) + `.\n`);
    console.log(yellow(`ACCESSNFT: `) +
      color.bold(`Please transfer 1 pico AZERO to our wallet to complete your NFT registration:`));
    console.log(yellow(`ACCESSNFT: `) +
      magenta(`${OWNER_ADDRESS}\n`));

  } else if (message == 'payment-received') {

    const nftId = args[0][0];

    console.log(green(`ACCESSNFT: `) +
      color.bold(`Your verification micropayment has been received!!!\n`));

    console.log(yellow(`ACCESSNFT: `) +
      color.bold(`Stand by while we set your NFT `) + red(`ID ${nftId} `) +
      color.bold(`to 'authenticated' and store your`));
    console.log(green(`ACCESSNFT: `) +
      color.bold(`anonymized credentials on the blockchain!\n`));

  } else if (message == 'setAuthenticated-complete') {

    const nftId = args[0][0];

    console.log(green(`ACCESSNFT: `) +
      color.bold(`Your NFT `) + red(`ID ${nftId} `) +
      color.bold(`has been set authenticated on the blockchain.\n`));

    console.log(yellow(`ACCESSNFT: `) +
      color.bold(`Stand by while we store your anonymized credentials on the blockchain.\n`));

  } else if (message == 'credential-set') {

    const nftId = args[0][0];
    const userhash = args[0][1];
    const passhash = args[0][2];
    
    console.log(green(`ACCESSNFT: `) +
      color.bold(`Your anonymized NFT access credentials have been stored on the blockchain.\n\n\n`));

    console.log(green(`ACCESSNFT: `) +
      color.bold(`You have successfully registered your universal access NFT`) + red(` ID ${nftId}`));
    console.log(green(`ACCESSNFT: `) +
      color.bold(`and may now login to the restricted access area!!!\n\n\n`));

    console.log(red(`ACCESSNFT: `) +
      color.bold(`!!! WARNING !!!\n`));

    console.log(red(`ACCESSNFT: `) +
      color.bold(`Because your credentials are anonymized, it is impossible for us to tell you your`));
    console.log(red(`ACCESSNFT: `) +
      color.bold(`username or password if you forget.`));

    console.log(red(`ACCESSNFT: `) +
      color.bold(`If you forget your username or password, you must repeat this registration process using`));
    console.log(red(`ACCESSNFT: `) +
      color.bold(`a DIFFERENT username. This is the only way to ensure that access credentials are`));
    console.log(red(`ACCESSNFT: `) +
      color.bold(`anonymized and secure in a blockchain environment. Maybe write them down somewhere...\n\n`));


    console.log(color.bold.magenta(`ACCESSNFT: `) +
      color.bold(`USERNAME STORED ON BLOCKCHAIN AS SHA256 HASH`));
    console.log(color.bold.magenta(`ACCESSNFT: `) +
      blue(` 0x${userhash}`));
    console.log(color.bold.magenta(`ACCESSNFT: `) +
      color.bold(`PASSWORD STORED ON BLOCKCHAIN AS SHA256 HASH `));
    console.log(color.bold.magenta(`ACCESSNFT: `) +
      blue(` 0x${passhash}\n`));

    console.log(color.bold.magenta(`ACCESSNFT: `) +
      color.bold(`YOUR USERNAME AND PASSWORD ARE IMPOSSIBLE TO DERIVE FROM THE SHA256 HASH. `));
    console.log(color.bold.magenta(`ACCESSNFT: `) +
      color.bold(`SHA256 HASH NUMBERS ARE USED TO VERIFY THAT YOU POSSESS THE CORRECT CREDENTIALS`));
    console.log(color.bold.magenta(`ACCESSNFT: `) +
      color.bold(`BY COMPARING LOCAL HASH OF CREDENTIALS YOU PROVIDE ON LOGIN WITH HASH`));
    console.log(color.bold.magenta(`ACCESSNFT: `) +
      color.bold(`STORED ON BLOCKCHAIN THAT WE GENERATED IN THIS REGISTRATION SESSION.`));

    console.log(color.bold.magenta(`ACCESSNFT: `) +
      color.bold(`AT NO POINT ARE YOUR CREDENTIALS STORED IN A DATABASE.\n\n\n`));

    await returnToMain('return to main menu');

  } else if (message == 'all-nfts-authenticated') {
    
    console.log(red(`ACCESSNFT: `) +
      color.bold(`All your NFTs are already authenticated.`));
    console.log(red(`ACCESSNFT: `) +
      color.bold(`You need to buy a new universal access NFT to register and gain access to restricted area.`));

    await returnToMain('return to main menu to mint new nft');
  }
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

// Check if wallet has collection
const hasCollection = async (api, contract, wallet)  => {
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
    await contract.query['getCollection'](
      OWNER_PAIR.address, {gasLimit}, wallet);

  // convert to JSON format for convenience
  const RESULT = JSON.parse(JSON.stringify(result));

    // if this call reverts, then only possible error is 'credential nonexistent'
    if (RESULT.ok.flags == 'Revert') {

      // the only possible error is the custom 'no collection' type
      //
      // :. wallet has no collection
      return false
    }
    
    // wallet has collection
    return true

  } catch (error) {
    console.log(error)
  }
}

// handle misc error
const otherError = () => {

  console.log(red(`ACCESSNFT: `) + 'failed to gather required information\n');
  process.send('error');
  process.exit();
}
