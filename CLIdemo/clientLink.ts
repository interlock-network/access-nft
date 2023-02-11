//
// INTERLOCK NETWORK & ALEPH ZERO
// PSP34 UNIVERSAL ACCESS NFT - CLIENT LINK WALLET
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
  contractGetter,
  setupSession,
  contractDoer,
  returnToMain
} from "./utils";

const OWNER_MNEMONIC = process.env.OWNER_MNEMONIC;
const ISAUTHENTICATED = '0x697361757468656e74696361746564';
const FALSE = '0x66616c7365';
  
var wallet;

// setup socket connection with autheticateWallet script
var socket = io('http://localhost:3000');
socket.on('connect', async () => {

  // establish connection with blockchain
  const [ api, contract ] = await setupSession('setAuthenticated');


    while (true) {

      // begin prompt tree
      //
      // first prompt: wallet address
      await (async () => {

        // get valid wallet address
        let responseWallet = await prompts({
          type: 'text',
          name: 'wallet',
          message: 'Please enter the wallet address for the NFT collection you would like to view.\n',
          validate: wallet => (!isValidSubstrateAddress(wallet) && (wallet.length > 0)) ?
            red(`ACCESSNFT: `) + `Invalid address` : true
        });
        wallet = responseWallet.wallet;
        console.log('');
    
        // if valid, check to see if wallet has nft collection
        if (!(await hasCollection(api, contract, wallet))) {
        
          console.log(red(`ACCESSNFT: `) +
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
            socket,
            contract,
            'Authenticate',
            'getCollection',
            wallet,
          );
        const collection = JSON.parse(JSON.stringify(OUTPUT_collection));

        // find nft to authenticated
        const nfts = Array.from(collection.ok.ok);


        // print table of NFTs and their authentication status
        console.log(color.bold(`\tNFT ID\t\t\t\tSTATUS\n`));
        let nft: any;
        for (nft of nfts) {

          // get attribute isauthenticated state
          var [ gasRequired, storageDeposit, RESULT_authenticated, OUTPUT_authenticated ] =
            await contractGetter(
              api,
              socket,
              contract,
              'Authenticate',
              'psp34Metadata::getAttribute',
              {u64: nft.u64},
              ISAUTHENTICATED,
            ); 
          let authenticated = JSON.parse(JSON.stringify(OUTPUT_authenticated));

          // record nft id of one that is waiting and ready to authenticate
          if (authenticated.ok == FALSE) {

            console.log(red(`\t${nft.u64}\t\t\t\tNEEDS AUTHENTICATION\n`));
          } else {
            console.log(green(`\t${nft.u64}\t\t\t\tSUCCESSFULLY AUTHENTICATED!\n`));
          }
        }
      })();

      await (async () => {

      var choice = await prompts({
        type: 'select',
        name: 'return',
        message: 'Options:',
        choices: [
          { title: 'return to main menu', value: 'return' },
          { title: 'display another collection', value: 'collection' },
        ]
      });
      if (choice.return == 'return') {

        process.send('done');
        process.exit();
      }
    })();
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



