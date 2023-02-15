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
    color.bold(`UNIVERSAL ACCESS NFT APP, ID` + cyan(` ${socket.id}`)));
  console.log(blue(`UA-NFT`) + color.bold(`|CLIENT-APP: `) +
    color.bold(`connected to the secure registration server.\n`));
   
  // establish connection with blockchain
  const [ api, contract ] = await setupSession('setAuthenticated');

  // check to see if CLIENT_ADDRESS has nft collection
  if (!(await hasCollection(api, contract, CLIENT_ADDRESS))) {
        
    console.log(red(`UA-NFT`) + color.bold(`|CLIENT-APP: `) +
      color.bold(`Your have no universal access NFTs.`));
    console.log(red(`UA-NFT`) + color.bold(`|CLIENT-APP: `) +
      color.bold(`Please return to main menu to mint.\n`));

    // if no collection propmt to return to main menu      
    await returnToMain('goto main menu to mint universal access NFT');
  }

  // second prompt: username
  await (async () => {


    console.log(red(`UA-NFT`) + color.bold(`|CLIENT-APP: `) +
      color.bold(`!!! WARNING !!!\n`));

    console.log(red(`UA-NFT`) + color.bold(`|CLIENT-APP: `) +
      color.bold(`Because your credentials are anonymized, `));
    console.log(red(`UA-NFT`) + color.bold(`|CLIENT-APP: `) +
      color.bold(`it is impossible for us to reveal your`));
    console.log(red(`UA-NFT`) + color.bold(`|CLIENT-APP: `) +
      color.bold(`username or password if you forget.\n`));
    console.log(red(`UA-NFT`) + color.bold(`|CLIENT-APP: `) +
      color.bold(`If you forget your username or password, you`));
    console.log(red(`UA-NFT`) + color.bold(`|CLIENT-APP: `) +
      color.bold(`must repeat this registration process with`));
    console.log(red(`UA-NFT`) + color.bold(`|CLIENT-APP: `) +
      color.bold(`a DIFFERENT username.\n`));
    console.log(red(`UA-NFT`) + color.bold(`|CLIENT-APP: `) +
      color.bold(`(This is the only way we can ensure access`));   
    console.log(red(`UA-NFT`) + color.bold(`|CLIENT-APP: `) +
      color.bold(`credentials are anonymized and secure in a`));   
    console.log(red(`UA-NFT`) + color.bold(`|CLIENT-APP: `) +
      color.bold(`transparent blockchain environment.)\n`));   

    console.log(red(`UA-NFT`) + color.bold(`|CLIENT-APP: `) +
      color.bold(`Maybe WRITE THEM DOWN somewhere...?\n`));

    console.log(color.bold.magenta(`UA-NFT`) + color.bold(`|CLIENT-APP: `) +
      color.bold(`CREDENTIALS ARE NEVER STORED IN A DATABASE.`));
    console.log(color.bold.magenta(`UA-NFT`) + color.bold(`|CLIENT-APP: `) +
      color.bold(`THEY ARE ANONYMIZED & STORED ON BLOCKCHAIN.\n\n`));


    // loop prompt until valid username
    var isAvailable = false;
    while (isAvailable == false) {

      // get valid username
      var responseUsername = await prompts({
        type: 'text',
        name: 'username',
        message: 'Please choose username, 5+ characters of any type but no space.\n',
        validate: username => !isValidUsername(username) ?
          red(`UA-NFT`) + color.bold(`|CLIENT-APP: `) + `Too short / contains spaces.` : true
      }, { onCancel });
      username = responseUsername.username;
      console.log('');

      // if valid, check if username is available
      if (await isAvailableUsername(api, contract, getHash(username))) {

        // break the prompt loop
        isAvailable = true;

      } else {

        console.log(red(`UA-NFT`) + color.bold(`|CLIENT-APP: `) +
          color.bold(`Username taken. Choose different username.\n`));
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
            message: 'Please choose password with 8+ characters.\nWhitespace ok, no length limit.\n',
            validate: password => (password.length < 8) ?
              red(`UA-NFT`) + color.bold(`|CLIENT-APP: `) + color.bold(`Password too short.\n`) : true
          },
          {
            type: 'password',
            name: 'passwordVerify',
            message: 'Please verify your password.\n',
          }
        ], { onCancel });
        passwordVerify = responsePassword.passwordVerify ?? 'passwordVerify';
        password = responsePassword.password ?? 'password';
        console.log('');

        if (password != passwordVerify) {
          console.log(red(`UA-NFT`) + color.bold(`|CLIENT-APP: `) + color.bold(`Password mismatch.\n`));
        }
      }
      while (password != passwordVerify);
        
      console.log(green(`UA-NFT`) + color.bold(`|CLIENT-APP: `) +
        color.bold(`You successfully entered new credentials.`));
      console.log(yellow(`UA-NFT`) + color.bold(`|CLIENT-APP: `) +
        color.bold(`Wait while we transfer a micropayment of`));
      console.log(yellow(`UA-NFT`) + color.bold(`|CLIENT-APP: `) +
        color.bold(`1 pico TZERO to your address.\n`));

      socket.emit('authenticate-nft', [CLIENT_ADDRESS, getHash(username), getHash(password)]);

    })().catch(error => otherError());
  })().catch(error => otherError());
});

socket.onAny(async (message, ...args) => {

  if (message == 'return-transfer-waiting') {

    const nftId = args[0][0];
    const transactionHash = args[0][1];

    console.log(yellow(`UA-NFT`) + color.bold(`|CLIENT-APP: `) +
      color.bold(`We just transfered a verification micropayment of`));
    console.log(yellow(`UA-NFT`) + color.bold(`|CLIENT-APP: `) +
      color.bold(`1 pico TZERO to your address at`));
    console.log(yellow(`UA-NFT`) + color.bold(`|CLIENT-APP: `) +
      magenta(`${CLIENT_ADDRESS}` + `\n`));
    console.log(yellow(`UA-NFT`) + color.bold(`|CLIENT-APP: `) +
      color.bold(`You may confirm this via transaction hash`));
  
    console.log(yellow(`UA-NFT`) + color.bold(`|CLIENT-APP: `) +
      color.yellow(`0x${transactionHash}`) + `\n`);

    console.log(green(`UA-NFT`) + color.bold(`|CLIENT-APP: `) +
      color.bold(`Please return transfer 1 pico TZERO to complete`));
    console.log(green(`UA-NFT`) + color.bold(`|CLIENT-APP: `) +
      color.bold(`your registration for universal access NFT `) +
      red(`ID ${nftId}`) + color.bold(` to`)) 
    console.log(green(`UA-NFT`) + color.bold(`|CLIENT-APP: `) +
      magenta(`${OWNER_ADDRESS}\n`));

    console.log(red(`UA-NFT`) + color.bold(`|CLIENT-APP: `) +
      color.bold(`The purpose of this is to make sure you actually`));
    console.log(red(`UA-NFT`) + color.bold(`|CLIENT-APP: `) +
      color.bold(`own the address (and NFT) you claim.\n`));

    // authorize micropayment?
    await (async () => {

      // get response
      var responseChoice = await prompts({
        type: 'confirm',
        name: 'choice',
        message: 'Do you authorize this application to transfer\n1 pico TZERO for verification purposes?',
      }, { onCancel });
      const choice = responseChoice.choice
      console.log('');

      if (choice == false) {

        console.clear();
        console.log(red(`\n ABORTING REGISTRATION.\n`));
        console.log(red(` WE NEED YOU TO RETURN THE VERIFICATION `));
        console.log(red(` MICROPAYMENT BEFORE REGISTERING A DIFFERENT NFT.`));
        console.log(red(` REPEAT THE REGISTRATION PROCESS WHEN READY.`));
        console.log(red(` YOU MAY CHOOSE A DIFFERENT USERNAME`));
        console.log(red(` AND PASSWORD IF YOU PLEASE.`));

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
      color.bold(`Waiting on NFT `) + red(`${nftId}`) + color.bold(` micropayment`) +
      red(`ID ${nftId}`) + `.\n`);
    console.log(yellow(`UA-NFT`) + color.bold(`|CLIENT-APP: `) +
      color.bold(`Please transfer authorize transfer of 1 pico TZERO.`));
    console.log(yellow(`UA-NFT`) + color.bold(`|CLIENT-APP: `) +
      magenta(`${OWNER_ADDRESS}\n`));

    // authorize micropayment?
    await (async () => {

      // get response
      var responseChoice = await prompts({
        type: 'confirm',
        name: 'choice',
        message: 'Do you authorize transfer of 1 pico TZERO\nfor verification purposes?',
      }, { onCancel });
      const choice = responseChoice.choice
      console.log('');

      if (choice == false) {

        console.clear();
        console.log(red(`\n ABORTING REGISTRATION.\n`));
        console.log(red(` WE NEED YOU TO RETURN THE VERIFICATION `));
        console.log(red(` MICROPAYMENT BEFORE REGISTERING A DIFFERENT NFT.`));
        console.log(red(` REPEAT THE REGISTRATION PROCESS WHEN READY.`));
        console.log(red(` YOU MAY CHOOSE A DIFFERENT USERNAME`));
        console.log(red(` AND PASSWORD IF YOU PLEASE.`));

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
      color.bold(`Your micropayment was received!!!\n`));

    console.log(yellow(`UA-NFT`) + color.bold(`|CLIENT-APP: `) +
      color.bold(`Stand by while we set your NFT `) + red(`ID ${nftId} `));
    console.log(yellow(`UA-NFT`) + color.bold(`|CLIENT-APP: `) +
      color.bold(`to 'authenticated' and store your`));
    console.log(yellow(`UA-NFT`) + color.bold(`|CLIENT-APP: `) +
      color.bold(`anonymized credentials on the blockchain!\n`));

  } else if (message == 'setAuthenticated-complete') {

    const nftId = args[0][0];

    console.log(green(`UA-NFT`) + color.bold(`|CLIENT-APP: `) +
      color.bold(`Your NFT `) + red(`ID ${nftId}`) + color.bold(` has been set`));
    console.log(green(`UA-NFT`) + color.bold(`|CLIENT-APP: `) +
      color.bold(`'authenticated' on the blockchain.\n`));

    console.log(yellow(`UA-NFT`) + color.bold(`|CLIENT-APP: `) +
      color.bold(`Stand by while we store your anonymized`));
    console.log(yellow(`UA-NFT`) + color.bold(`|CLIENT-APP: `) +
      color.bold(`credentials on the blockchain.\n`));

  } else if (message == 'credential-set') {

    const nftId = args[0][0];
    const userhash = args[0][1];
    const passhash = args[0][2];
    
    console.log(green(`UA-NFT`) + color.bold(`|CLIENT-APP: `) +
      color.bold(`Your anonymized NFT access credentials have`));
    console.log(green(`UA-NFT`) + color.bold(`|CLIENT-APP: `) +
      color.bold(`been stored on the blockchain.\n\n\n\n\n`));

    console.log(green(`UA-NFT`) + color.bold(`|CLIENT-APP: `) +
      color.bold(`Universal access NFT`) + red(` ID ${nftId}`) + color.bold(` authenticated!!!`));
    console.log(green(`UA-NFT`) + color.bold(`|CLIENT-APP: `) +
      color.bold(`You may now login to the restricted access area!!!\n\n\n\n\n`));

    console.log(red(`UA-NFT`) + color.bold(`|CLIENT-APP: `) +
      color.bold(`!!! REMINDER WARNING !!!\n`));

    console.log(red(`UA-NFT`) + color.bold(`|CLIENT-APP: `) +
      color.bold(`Because your credentials are anonymized, `));
    console.log(red(`UA-NFT`) + color.bold(`|CLIENT-APP: `) +
      color.bold(`it is impossible for us to reveal your`));
    console.log(red(`UA-NFT`) + color.bold(`|CLIENT-APP: `) +
      color.bold(`username or password if you forget.\n`));
    console.log(red(`UA-NFT`) + color.bold(`|CLIENT-APP: `) +
      color.bold(`If you forget your username or password, you`));
    console.log(red(`UA-NFT`) + color.bold(`|CLIENT-APP: `) +
      color.bold(`must repeat this registration process with`));
    console.log(red(`UA-NFT`) + color.bold(`|CLIENT-APP: `) +
      color.bold(`a DIFFERENT username.\n`));
    console.log(red(`UA-NFT`) + color.bold(`|CLIENT-APP: `) +
      color.bold(`(This is the only way we can ensure access`));   
    console.log(red(`UA-NFT`) + color.bold(`|CLIENT-APP: `) +
      color.bold(`credentials are anonymized and secure in a`));   
    console.log(red(`UA-NFT`) + color.bold(`|CLIENT-APP: `) +
      color.bold(`transparent blockchain environment.\n`));   
    console.log(red(`UA-NFT`) + color.bold(`|CLIENT-APP: `) +
      color.bold(`Maybe WRITE THEM DOWN somewhere...?\n`));

    console.log(color.bold.magenta(`UA-NFT`) + color.bold(`|CLIENT-APP: `) +
      color.bold(`CREDENTIALS ARE NEVER STORED IN A DATABASE.`));
    console.log(color.bold.magenta(`UA-NFT`) + color.bold(`|CLIENT-APP: `) +
      color.bold(`THEY ARE ANONYMIZED & STORED ON BLOCKCHAIN.\n\n`));

    console.log(color.bold.magenta(`UA-NFT`) + color.bold(`|CLIENT-APP: `) +
      color.bold(`USERNAME STORED ON BLOCKCHAIN AS SHA256 HASH`));
    console.log(color.bold.magenta(`UA-NFT`) + color.bold(`|CLIENT-APP: `) +
      color.yellow(`0x${userhash}`));
    console.log(color.bold.magenta(`UA-NFT`) + color.bold(`|CLIENT-APP: `) +
      color.bold(`PASSWORD STORED ON BLOCKCHAIN AS SHA256 HASH `));
    console.log(color.bold.magenta(`UA-NFT`) + color.bold(`|CLIENT-APP: `) +
      color.yellow(`0x${passhash}\n\n`));

    console.log(color.bold.magenta(`UA-NFT`) + color.bold(`|CLIENT-APP: `) +
      color.bold(`USERNAME AND PASSWORD IMPOSSIBLE TO DERIVE FROM HASH. `));
    console.log(color.bold.magenta(`UA-NFT`) + color.bold(`|CLIENT-APP: `) +
      color.bold(`SHA256 HASH NUMBERS VERIFY YOU POSSESS CREDENTIALS`));
    console.log(color.bold.magenta(`UA-NFT`) + color.bold(`|CLIENT-APP: `) +
      color.bold(`BY COMPARING LOCAL HASH OF CREDENTIALS YOU PROVIDE ON`));
    console.log(color.bold.magenta(`UA-NFT`) + color.bold(`|CLIENT-APP: `) +
      color.bold(`ANY LOGIN, WITH HASHES WE JUST GENERATED DURING REGISTRATION`));
    console.log(color.bold.magenta(`UA-NFT`) + color.bold(`|CLIENT-APP: `) +
      color.bold(`AND STORED ON THE BLOCKCHAIN.\n`));

    console.log(green(`UA-NFT`) + color.bold(`|CLIENT-APP: `) +
      color.bold(`YOUR CREDENTIALS ARE NEVER STORED IN A DATABASE.\n\n`));

    await returnToMain('return to main menu');

  } else if (message == 'all-nfts-authenticated') {
    
    console.log(red(`UA-NFT`) + color.bold(`|CLIENT-APP: `) +
      color.bold(`All your NFTs are already authenticated.`));
    console.log(red(`UA-NFT`) + color.bold(`|CLIENT-APP: `) +
      color.bold(`You need to buy a new universal access NFT`));
    console.log(red(`UA-NFT`) + color.bold(`|CLIENT-APP: `) +
      color.bold(`to register and gain access to restricted area.\n`));

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
        color.bold(`username  available\n`));

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

  console.log(red(`UA-NFT`) + color.bold(`|CLIENT-APP: `) +
		color.bold('Failed to register credentials.\n'));
  process.send('error');
  process.exit();
}
