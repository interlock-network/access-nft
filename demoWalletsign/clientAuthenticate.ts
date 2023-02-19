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
    color.bold(`demoApp, SID` + cyan(` ${socket.id}`)));
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
            message: 'Please choose password with 8+ characters.\n  Whitespace ok, no length limit.\n',
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
        color.bold(`You successfully entered new credentials.\n`));

      console.log(yellow(`UA-NFT`) + color.bold(`|CLIENT-APP: `) +
        color.bold(`Stand by while we register your UANFT.`));

      // fork process to register UANFT and set credentials provided
      const registerChild = fork(register);
      registerChild.send({
        id: nftId,
        userhash: userhash,
        passhash: passhash
      });

      // listen for results of
      registerChild.on('message', () => {

				if (message == 'register-complete') {

    		console.log(green(`UA-NFT`) + color.bold(`|CLIENT-APP: `) +
		      color.bold(`Your anonymized NFT access credentials have`));
    		console.log(green(`UA-NFT`) + color.bold(`|CLIENT-APP: `) +
		      color.bold(`been stored on the blockchain.\n\n\n\n\n`));

    		console.log(green(`UA-NFT`) + color.bold(`|CLIENT-APP: `) +
		      color.bold(`Universal access NFT`) + red(` ID ${nftId}`) + color.bold(` authenticated!!!`));
    		console.log(green(`UA-NFT`) + color.bold(`|CLIENT-APP: `) +
		      color.bold(`You may now login to the restricted access area!!!\n\n`));

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
    		  color.bold(`Maybe WRITE THEM DOWN somewhere...?\n\n`));

		    console.log(color.bold.magenta(`UA-NFT`) + color.bold(`|CLIENT-APP: `) +
    		  color.bold(`USERNAME STORED ON BLOCKCHAIN AS SHA256 HASH`));
		    console.log(color.yellow(`0x${userhash}`));
    		console.log(color.bold.magenta(`UA-NFT`) + color.bold(`|CLIENT-APP: `) +
		      color.bold(`PASSWORD STORED ON BLOCKCHAIN AS SHA256 HASH `));
		    console.log(color.yellow(`0x${passhash}\n\n`));

		    console.log(color.bold.magenta(`UA-NFT`) + color.bold(`|CLIENT-APP: `) +
		      color.bold(`USERNAME/PASSWORD IMPOSSIBLE TO DERIVE FROM HASH. `));
		    console.log(color.bold.magenta(`UA-NFT`) + color.bold(`|CLIENT-APP: `) +
		      color.bold(`SHA256 HASHES VERIFY YOU POSSESS CREDENTIALS`));
    		console.log(color.bold.magenta(`UA-NFT`) + color.bold(`|CLIENT-APP: `) +
		      color.bold(`BY COMPARING LOCAL HASH OF CREDENTIALS YOU PROVIDE`));
    		console.log(color.bold.magenta(`UA-NFT`) + color.bold(`|CLIENT-APP: `) +
		      color.bold(`ON LOGIN WITH THE HASHES WE JUST GENERATED`));
    		console.log(color.bold.magenta(`UA-NFT`) + color.bold(`|CLIENT-APP: `) +
		      color.bold(`AND STORED ON THE BLOCKCHAIN.\n`));

		    console.log(green(`UA-NFT`) + color.bold(`|CLIENT-APP: `) +
		      color.bold(`YOUR CREDENTIALS ARE NEVER STORED IN A DATABASE.`));
		    console.log(green(`UA-NFT`) + color.bold(`|CLIENT-APP: `) +
		      color.bold(`THEY ARE ANONYMIZED & STORED ON BLOCKCHAIN.\n`));

				await returnToMain('return to main menu to login to restricted access area');

				} else {

		    console.log(red(`UA-NFT`) + color.bold(`|CLIENT-APP: `) +
    		  color.bold(`Whoops...something went wrong registering your UANFT!\n`));

				await returnToMain('return to main menu to retry registration');
							
      });
    })().catch(error => otherError());
  })().catch(error => otherError());
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
    await contract.query['getCredential'](
      CLIENT_PAIR.address, {gasLimit}, '0x' + usernameHash);

  // convert to JSON format for convenience
  const RESULT = JSON.parse(JSON.stringify(result));
  const OUTPUT = JSON.parse(JSON.stringify(output));

    // if this call reverts, then only possible error is 'credential nonexistent'
    if (RESULT.ok.flags == 'Revert') {

      // logging custom error
      let error = OUTPUT.ok.err.custom.toString().replace(/0x/, '')
      console.log(green(`UA-NFT`) + color.bold(`|CLIENT-APP: `) +
        color.bold(`username available!\n`));

      // username is available
      return true
    }
    
    // username is not available
    return false

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
