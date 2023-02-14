//
// INTERLOCK NETWORK & ALEPH ZERO
// PSP34 UNIVERSAL ACCESS NFT - CLIENT AUTHENTICATE
//

// imports (anything polkadot with node-js must be required)
const { ApiPromise, WsProvider, Keyring } = require('@polkadot/api');
const { ContractPromise, CodePromise } = require('@polkadot/api-contract');
const WeightV2 = require('@polkadot/types/interfaces');

// imports
import { io } from 'socket.io-client';
import { fork } from 'child_process';
import { readFileSync } from "fs";
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
  returnToMain,
  hasCollection,
  isValidSubstrateAddress,
  onCancel
} from "./utils";

const WALLET = JSON.parse(readFileSync('.wallet.json').toString());
const CLIENT_MNEMONIC = WALLET.CLIENT_MNEMONIC
const CLIENT_ADDRESS = WALLET.CLIENT_ADDRESS;
const OWNER_ADDRESS = process.env.OWNER_ADDRESS;
  
var username;
var password;
var passwordVerify;

// setup socket connection with autheticateWallet script
var socket = io('http://localhost:3000');
socket.on('connect', async () => {

  console.log(blue(`\nUA-NFT`) + color.bold(`|CLIENT-APP: `) +
    color.bold(`UNIVERSAL ACCESS NFT DEMO APP, socket ID ` + cyan(`${socket.id}`)) + 
    color.bold(` connected successfully to the secure registration server.`));
   
  // establish connection with blockchain
  const [ api, contract ] = await setupSession('setAuthenticated');

  // check to see if CLIENT_ADDRESS has nft collection
  if (!(await hasCollection(api, contract, CLIENT_ADDRESS))) {
        
    console.log(red(`UA-NFT`) + color.bold(`|CLIENT-APP: `) +
      color.bold(`Your address has no universal access NFT collection. Please return to main menu to mint.\n`));

    // if no collection propmt to return to main menu      
    await returnToMain('return to main menu to mint universal access NFT');
  }

  // second prompt: username
  await (async () => {


    console.log(red(`UA-NFT`) + color.bold(`|CLIENT-APP: `) +
      color.bold(`!!! WARNING !!!\n`));

    console.log(red(`UA-NFT`) + color.bold(`|CLIENT-APP: `) +
      color.bold(`Because your credentials are anonymized, it is impossible for us to tell you your`));
    console.log(red(`UA-NFT`) + color.bold(`|CLIENT-APP: `) +
      color.bold(`username or password if you forget.`));
    console.log(red(`UA-NFT`) + color.bold(`|CLIENT-APP: `) +

      color.bold(`If you forget your username or password, you must repeat this registration process using`));
    console.log(red(`UA-NFT`) + color.bold(`|CLIENT-APP: `) +
      color.bold(`a DIFFERENT username. This is the only way to ensure that access credentials are`));
    console.log(red(`UA-NFT`) + color.bold(`|CLIENT-APP: `) +
      color.bold(`anonymized and secure in a blockchain environment. Maybe write them down somewhere...\n\n`));

    console.log(color.bold.magenta(`UA-NFT`) + color.bold(`|CLIENT-APP: `) +
      color.bold(`AT NO POINT ARE YOUR CREDENTIALS STORED IN A DATABASE.`));
    console.log(color.bold.magenta(`UA-NFT`) + color.bold(`|CLIENT-APP: `) +
      color.bold(`THEY ARE ANONYMIZED AND STORED ON THE BLOCKCHAIN.\n\n`));


    // loop prompt until valid username
    var isAvailable = false;
    while (isAvailable == false) {

      // get valid username
      var responseUsername = await prompts({
        type: 'text',
        name: 'username',
        message: 'Please choose a username with 5 or more characters and no spaces.',
        validate: username => !isValidUsername(username) ?
          red(`UA-NFT`) + color.bold(`|CLIENT-APP: `) + `Too short or contains spaces.` : true
      }, { onCancel });
      username = responseUsername.username;
      console.log('');

      // if valid, check if username is available
      if (await isAvailableUsername(api, contract, getHash(username))) {

        // break the prompt loop
        isAvailable = true;

      } else {

        console.log(red(`UA-NFT`) + color.bold(`|CLIENT-APP: `) +
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
              red(`UA-NFT`) + color.bold(`|CLIENT-APP: `) + `Password too short.` : true
          },
          {
            type: 'password',
            name: 'passwordVerify',
            message: 'Please verify your password.',
          }
        ], { onCancel });
        passwordVerify = responsePassword.passwordVerify ?? 'passwordVerify';
        password = responsePassword.password ?? 'password';
        console.log('');

        if (password != passwordVerify) {
          console.log(red(`UA-NFT`) + color.bold(`|CLIENT-APP: `) + `Password mismatch.`);
        }
      }
      while (password != passwordVerify);
        
      console.log(green(`UA-NFT`) + color.bold(`|CLIENT-APP: `) +
        color.bold(`You successfully entered your new user credentials. .`));
      console.log(yellow(`UA-NFT`) + color.bold(`|CLIENT-APP: `) +
        color.bold(`Wait while we transfer a micropayment of 1 pico TZERO to your address.\n`));

      socket.emit('authenticate-nft', [CLIENT_ADDRESS, getHash(username), getHash(password)]);

    })().catch(error => otherError());
  })().catch(error => otherError());
});

socket.onAny(async (message, ...args) => {

  if (message == 'return-transfer-waiting') {

    const nftId = args[0][0];
    const transactionHash = args[0][1];

    console.log(yellow(`UA-NFT`) + color.bold(`|CLIENT-APP: `) +
      color.bold(`We just transfered a verification micropayment of 1 pico TZERO to your address at`));
    console.log(yellow(`UA-NFT`) + color.bold(`|CLIENT-APP: `) +
      magenta(`${CLIENT_ADDRESS}` + `\n`));
    console.log(yellow(`UA-NFT`) + color.bold(`|CLIENT-APP: `) +
      color.bold(`You may confirm this via the transaction hash`));
  
    console.log(yellow(`UA-NFT`) + color.bold(`|CLIENT-APP: `) +
      cyan(`0x${transactionHash}`) + `\n`);

    console.log(green(`UA-NFT`) + color.bold(`|CLIENT-APP: `) +
      color.bold(`Please transfer 1 pico TZERO in return to complete`));
    console.log(green(`UA-NFT`) + color.bold(`|CLIENT-APP: `) +
      color.bold(`your registration for universal access NFT `) +
      red(`ID ${nftId}`) + color.bold(` to our address at:`)) 
    console.log(green(`UA-NFT`) + color.bold(`|CLIENT-APP: `) +
      magenta(`${OWNER_ADDRESS}\n`));

    console.log(yellow(`UA-NFT`) + color.bold(`|CLIENT-APP: `) +
      color.bold(`The purpose of this is to make sure you actually own the address (and NFT) you claim.\n`));

    // authorize micropayment?
    await (async () => {

      // get response
      var responseChoice = await prompts({
        type: 'confirm',
        name: 'choice',
        message: 'Do you authorize this application to transfer 1 pico TZERO for verification purposes?',
      }, { onCancel });
      const choice = responseChoice.choice
      console.log('');

      if (choice == false) {

        console.clear();
        console.log(red(`\n       ABORTING REGISTRATION. WE WILL NEED YOU TO RETURN THE VERIFICATION `));
        console.log(red(`       MICROPAYMENT BEFORE YOU TRY TO REGISTER A DIFFERENT NFT. REPEAT THE`));
        console.log(red(`       REGISTRATION PROCESS WHEN READY. YOU MAY CHOOSE A DIFFERENT USERNAME`));
        console.log(red(`       AND PASSWORD IF YOU PLEASE.`));

        setTimeout( () => {

          process.send('done');
          process.exit();
      
        }, 10000);
      }
      if (choice == true) {

        // establish connection with blockchain
        const [ api, contract ] = await setupSession('authenticated');
      
        await transferMicropayment(api);
      }
    })();
  } else if (message == 'already-waiting') {

    const nftId = args[0][0];

    console.log(red(`UA-NFT`) + color.bold(`|CLIENT-APP: `) +
      color.bold(`We are still waiting on your verification micropayment for NFT `) +
      red(`ID ${nftId}`) + `.\n`);
    console.log(yellow(`UA-NFT`) + color.bold(`|CLIENT-APP: `) +
      color.bold(`Please transfer 1 pico TZERO to our address to complete your NFT registration:`));
    console.log(yellow(`UA-NFT`) + color.bold(`|CLIENT-APP: `) +
      magenta(`${OWNER_ADDRESS}\n`));

    // authorize micropayment?
    await (async () => {

      // get response
      var responseChoice = await prompts({
        type: 'confirm',
        name: 'choice',
        message: 'Do you authorize this application to transfer 1 pico TZERO for verification purposes?',
      }, { onCancel });
      const choice = responseChoice.choice
      console.log('');

      if (choice == false) {

        console.clear();
        console.log(red(`\n       ABORTING REGISTRATION. WE WILL NEED YOU TO RETURN THE VERIFICATION `));
        console.log(red(`       MICROPAYMENT BEFORE YOU TRY TO REGISTER A DIFFERENT NFT. REPEAT THE`));
        console.log(red(`       REGISTRATION PROCESS WHEN READY. YOU MAY CHOOSE A DIFFERENT USERNAME`));
        console.log(red(`       AND PASSWORD IF YOU PLEASE.`));

        setTimeout( () => {

          process.send('done');
          process.exit();
      
        }, 10000);
      }
      if (choice == true) {

        // establish connection with blockchain
        const [ api, contract ] = await setupSession('authenticated');
      
        await transferMicropayment(api);
      }
    })();
  } else if (message == 'payment-received') {

    const nftId = args[0][0];

    console.log(green(`UA-NFT`) + color.bold(`|CLIENT-APP: `) +
      color.bold(`Your verification micropayment has been received!!!\n`));

    console.log(yellow(`UA-NFT`) + color.bold(`|CLIENT-APP: `) +
      color.bold(`Stand by while we set your NFT `) + red(`ID ${nftId} `) +
      color.bold(`to 'authenticated' and store your`));
    console.log(green(`UA-NFT`) + color.bold(`|CLIENT-APP: `) +
      color.bold(`anonymized credentials on the blockchain!\n`));

  } else if (message == 'setAuthenticated-complete') {

    const nftId = args[0][0];

    console.log(green(`UA-NFT`) + color.bold(`|CLIENT-APP: `) +
      color.bold(`Your NFT `) + red(`ID ${nftId} `) +
      color.bold(`has been set authenticated on the blockchain.\n`));

    console.log(yellow(`UA-NFT`) + color.bold(`|CLIENT-APP: `) +
      color.bold(`Stand by while we store your anonymized credentials on the blockchain.\n`));

  } else if (message == 'credential-set') {

    const nftId = args[0][0];
    const userhash = args[0][1];
    const passhash = args[0][2];
    
    console.log(green(`UA-NFT`) + color.bold(`|CLIENT-APP: `) +
      color.bold(`Your anonymized NFT access credentials have been stored on the blockchain.\n\n\n\n\n`));

    console.log(green(`UA-NFT`) + color.bold(`|CLIENT-APP: `) +
      color.bold(`You have successfully registered your universal access NFT`) + red(` ID ${nftId}`));
    console.log(green(`UA-NFT`) + color.bold(`|CLIENT-APP: `) +
      color.bold(`and may now login to the restricted access area!!!\n`));

    console.log(red(`UA-NFT`) + color.bold(`|CLIENT-APP: `) +
      color.bold(`!!! REMINDER WARNING !!!\n`));

    console.log(red(`UA-NFT`) + color.bold(`|CLIENT-APP: `) +
      color.bold(`Because your credentials are anonymized, it is impossible for us to tell you your`));
    console.log(red(`UA-NFT`) + color.bold(`|CLIENT-APP: `) +
      color.bold(`username or password if you forget.`));
    console.log(red(`UA-NFT`) + color.bold(`|CLIENT-APP: `) +

      color.bold(`If you forget your username or password, you must repeat this registration process using`));
    console.log(red(`UA-NFT`) + color.bold(`|CLIENT-APP: `) +
      color.bold(`a DIFFERENT username. This is the only way to ensure that access credentials are`));
    console.log(red(`UA-NFT`) + color.bold(`|CLIENT-APP: `) +
      color.bold(`anonymized and secure in a blockchain environment. Maybe write them down somewhere...\n\n\n`));

    console.log(color.bold.magenta(`UA-NFT`) + color.bold(`|CLIENT-APP: `) +
      color.bold(`AT NO POINT ARE YOUR CREDENTIALS STORED IN A DATABASE.`));
    console.log(color.bold.magenta(`UA-NFT`) + color.bold(`|CLIENT-APP: `) +
      color.bold(`THEY ARE ANONYMIZED AND STORED ON THE BLOCKCHAIN.\n\n`));

    console.log(color.bold.magenta(`UA-NFT`) + color.bold(`|CLIENT-APP: `) +
      color.bold(`USERNAME STORED ON BLOCKCHAIN AS SHA256 HASH`));
    console.log(color.bold.magenta(`UA-NFT`) + color.bold(`|CLIENT-APP: `) +
      blue(` 0x${userhash}`));
    console.log(color.bold.magenta(`UA-NFT`) + color.bold(`|CLIENT-APP: `) +
      color.bold(`PASSWORD STORED ON BLOCKCHAIN AS SHA256 HASH `));
    console.log(color.bold.magenta(`UA-NFT`) + color.bold(`|CLIENT-APP: `) +
      blue(` 0x${passhash}\n`));

    console.log(color.bold.magenta(`UA-NFT`) + color.bold(`|CLIENT-APP: `) +
      color.bold(`YOUR USERNAME AND PASSWORD ARE IMPOSSIBLE TO DERIVE FROM THE SHA256 HASH. `));
    console.log(color.bold.magenta(`UA-NFT`) + color.bold(`|CLIENT-APP: `) +
      color.bold(`SHA256 HASH NUMBERS ARE USED TO VERIFY THAT YOU POSSESS THE CORRECT CREDENTIALS`));
    console.log(color.bold.magenta(`UA-NFT`) + color.bold(`|CLIENT-APP: `) +
      color.bold(`BY COMPARING LOCAL HASH OF CREDENTIALS YOU PROVIDE ON LOGIN WITH HASH`));
    console.log(color.bold.magenta(`UA-NFT`) + color.bold(`|CLIENT-APP: `) +
      color.bold(`STORED ON BLOCKCHAIN THAT WE GENERATED IN THIS REGISTRATION SESSION.`));

    console.log(color.bold.magenta(`UA-NFT`) + color.bold(`|CLIENT-APP: `) +
      color.bold(`AT NO POINT ARE YOUR CREDENTIALS STORED IN A DATABASE.\n\n`));

    await returnToMain('return to main menu');

  } else if (message == 'all-nfts-authenticated') {
    
    console.log(red(`UA-NFT`) + color.bold(`|CLIENT-APP: `) +
      color.bold(`All your NFTs are already authenticated.`));
    console.log(red(`UA-NFT`) + color.bold(`|CLIENT-APP: `) +
      color.bold(`You need to buy a new universal access NFT to register and gain access to restricted area.\n`));

    await returnToMain('return to main menu to mint new nft');
  }
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

// Check if username is available
const isAvailableUsername = async (api, contract, usernameHash)  => {
  try {

  // create keypair for owner
  const keyring = new Keyring({type: 'sr25519'});
  const CLIENT_PAIR = keyring.addFromUri(CLIENT_MNEMONIC);

  // define special type for gas weights
  type WeightV2 = InstanceType<typeof WeightV2>;
  const gasLimit = api.registry.createType('WeightV2', {
    refTime: 2**53 - 1,
    proofSize: 2**53 - 1,
  }) as WeightV2;

  // get getter output
  var { gasRequired, storageDeposit, result, output } =
    await contract.query['checkCredential'](
      CLIENT_PAIR.address, {gasLimit}, '0x' + usernameHash);

  // convert to JSON format for convenience
  const RESULT = JSON.parse(JSON.stringify(result));
  const OUTPUT = JSON.parse(JSON.stringify(output));

    // if this call reverts, then only possible error is 'credential nonexistent'
    if (RESULT.ok.flags == 'Revert') {

      // logging custom error
      let error = OUTPUT.ok.err.custom.toString().replace(/0x/, '')
      console.log(green(`UA-NFT`) + color.bold(`|CLIENT-APP: `) +
        color.bold(`username available\n`));

      // username is available
      return true
    }
    
    // username is not available
    return false

  } catch (error) {
    console.log(red(`UA-NFT`) + color.bold(`|CLIENT-APP: `) + error);
  }
}

// Check if username is available
const transferMicropayment = async (api)  => {

  try {

    // create keypair for owner
    const keyring = new Keyring({type: 'sr25519'});
    const CLIENT_PAIR = keyring.addFromUri(CLIENT_MNEMONIC);

    const transfer = api.tx.balances.transfer(OWNER_ADDRESS, 1);

    // Sign and send the transaction using our account
    const hash = await transfer.signAndSend(CLIENT_PAIR);

    return hash

  } catch (error) {

    console.log(red(`UA-NFT`) + color.bold(`|CLIENT-APP: `) + error);
  }
}


// handle misc error
const otherError = () => {

  console.log(red(`UA-NFT`) + color.bold(`|CLIENT-APP: `) + 'failed to gather required information\n');
  process.send('error');
  process.exit();
}
