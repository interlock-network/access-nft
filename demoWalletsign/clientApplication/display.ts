//
// INTERLOCK NETWORK & ALEPH ZERO
// PSP34 UNIVERSAL ACCESS NFT - CLIENT DISPLAY COLLECTION
//

// imports (anything polkadot with node-js must be required)
const { ApiPromise, WsProvider, Keyring } = require('@polkadot/api');
const { ContractPromise, CodePromise } = require('@polkadot/api-contract');
const { decodeAddress, encodeAddress } = require('@polkadot/keyring')
const WeightV2 = require('@polkadot/types/interfaces');

// imports
import { io } from 'socket.io-client';
import { readFileSync } from "fs";
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
  contractGetter,
  setupSession,
  returnToMain,
  hasCollection
} from "./utils";

// constants
const WALLET = JSON.parse(readFileSync('.wallet.json').toString());
const CLIENT_MNEMONIC = WALLET.CLIENT_MNEMONIC;
const CLIENT_ADDRESS = WALLET.CLIENT_ADDRESS;

async function display() {

  try {

    // establish connection with blockchain
    const [ api, contract ] = await setupSession('setAuthenticated');

    // create keypair for owner
    const keyring = new Keyring({type: 'sr25519'});
    const CLIENT_PAIR = keyring.addFromUri(CLIENT_MNEMONIC);

    console.log(color.bold.magenta(`UA-NFT`) + color.bold(`|CLIENT-APP: `) +
      color.bold(`Reminder...`));
    console.log(color.bold.magenta(`UA-NFT`) + color.bold(`|CLIENT-APP: `) +
      color.bold(`You are responsible for remembering the`));
    console.log(color.bold.magenta(`UA-NFT`) + color.bold(`|CLIENT-APP: `) +
      color.bold(`username/password pairs associated with`));
    console.log(color.bold.magenta(`UA-NFT`) + color.bold(`|CLIENT-APP: `) +
      color.bold(`each authenticated universal access NFT.\n`));

    console.log(color.bold.magenta(`UA-NFT`) + color.bold(`|CLIENT-APP: `) +
      color.bold(`This is because username/password pairs`));
    console.log(color.bold.magenta(`UA-NFT`) + color.bold(`|CLIENT-APP: `) +
      color.bold(`are not stored in a traditional database.`));
    console.log(color.bold.magenta(`UA-NFT`) + color.bold(`|CLIENT-APP: `) +
      color.bold(`We only store the obfuscated anonymized`));
    console.log(color.bold.magenta(`UA-NFT`) + color.bold(`|CLIENT-APP: `) +
      color.bold(`username/password hashes on the blockchain`));
    console.log(color.bold.magenta(`UA-NFT`) + color.bold(`|CLIENT-APP: `) +
      color.bold(`for the purpose of comparing the hashes of`));
    console.log(color.bold.magenta(`UA-NFT`) + color.bold(`|CLIENT-APP: `) +
      color.bold(`credentials you provide to our secure server`));
    console.log(color.bold.magenta(`UA-NFT`) + color.bold(`|CLIENT-APP: `) +
      color.bold(`each time you log in to restricted access area.\n`));
    
    // if valid, check to see if wallet has nft collection
    if (!(await hasCollection(api, contract, CLIENT_ADDRESS))) {
        
      console.log(red(`UA-NFT`) + color.bold(`|CLIENT-APP: `) +
        color.bold(`This wallet has no universal access NFT collection.`) +
        color.bold(`  Please return to main menu to mint.\n`));

      // if no collection propmt to return to main menu      
      await returnToMain('return to main menu to mint NFT');
    }

    // if collection exists, get array
    //
    // get nft collection for wallet
    var [ gasRequired, storageDeposit, RESULT_collection, OUTPUT_collection ] =
      await contractGetter(
        api,
        contract,
        CLIENT_PAIR,
        'Authenticate',
        'getCollection',
        CLIENT_ADDRESS,
      );
    const collection = JSON.parse(JSON.stringify(OUTPUT_collection));

    // find nft to authenticated
    const nfts = Array.from(collection.ok.ok);

    // print table of NFTs and their authentication status
    console.log(color.bold(`\n YOUR UNIVERSAL ACCESS NFT COLLECTION:\n`));
    console.log(color.bold(`\tNFT ID\t\t\t\tSTATUS\n`));
    let nft: any;
    for (nft of nfts) {

      // get attribute isauthenticated state
      var [ gasRequired, storageDeposit, RESULT_authenticated, OUTPUT_authenticated ] =
        await contractGetter(
          api,
          contract,
          CLIENT_PAIR,
          'display',
          'isAuthenticated',
          {u64: nft.u64},
        ); 
      let authenticated = JSON.parse(JSON.stringify(OUTPUT_authenticated));

      // record nft id of one that is waiting and ready to authenticate
      if (authenticated.ok.ok == false) {

        console.log(red(`\t${nft.u64}\t\t\t\tNEEDS AUTHENTICATION\n`));
      } else {
        console.log(green(`\t${nft.u64}\t\t\t\tSUCCESSFULLY AUTHENTICATED!\n`));
      }
    }
    await returnToMain('return to register NFTs or login to restricted area');

  } catch(error) {

    console.log(red(`UA-NFT`) + color.bold(`|CLIENT-APP: `) + error);

    process.send('display-process-error');
    process.exit();
  }
}

display();
