//
// INTERLOCK NETWORK & ALEPH ZERO
// PSP34 UNIVERSAL ACCESS NFT - CLIENT RESET
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

// environment constants
import * as dotenv from 'dotenv';
dotenv.config();

// utility functions
import {
  setupSession,
  returnToMain,
  contractGetter,
  isValidSubstrateAddress,
  hasCollection,
  onCancel
} from "./utils";

// specify color formatting
import * as color from 'cli-color';
const red = color.red.bold;
const green = color.green.bold;
const blue = color.blue.bold;
const cyan = color.cyan;
const yellow = color.yellow.bold;
const magenta = color.magenta;

// constants
const OWNER_MNEMONIC = process.env.OWNER_MNEMONIC;
const ISAUTHENTICATED = '0x697361757468656e74696361746564';
const TRUE = '0x74727565';


const WALLET = JSON.parse(readFileSync('.wallet.json').toString());
const CLIENT_MNEMONIC = WALLET.CLIENT_MNEMONIC
const CLIENT_ADDRESS = WALLET.CLIENT_ADDRESS;

// constants
//
// null === no limit
// refTime and proofSize determined by contracts-ui estimation plus fudge-factor
const refTimeLimit = 12000000000;
const proofSizeLimit = 150000;
const storageDepositLimit = null;

// setup socket connection with autheticateWallet script
var socket = io('http://localhost:3000');
socket.on('connect', async () => {

  // establish connection with blockchain
   const [ api, contract ] = await setupSession('setAuthenticated');

  console.log(green(`\nUA-NFT`) + color.bold(`|CLIENT-APP: `) +
    color.bold(`In order to reset your universal access NFT credentials, you MUST know the NFT ID.\n`));

  console.log(green(`\nUA-NFT`) + color.bold(`|CLIENT-APP: `) +
    color.bold(`Resetting your username and password is a two step process.`));
  console.log(green(`\nUA-NFT`) + color.bold(`|CLIENT-APP: `) +
    color.bold(`Step 1: reset your universal access NFT here.\n`));
  console.log(green(`UA-NFT`) + color.bold(`|CLIENT-APP: `) +
    color.bold(`Step 2: redo the authentication and credential registration step from the main menu.\n\n`));

    // if valid, check to see if CLIENT_ADDRESS has nft collection
    if (!(await hasCollection(api, contract, CLIENT_ADDRESS))) {

      console.log(red(`UA-NFT`) + color.bold(`|CLIENT-APP: `) +
        color.bold(`This CLIENT_ADDRESS has no universal access NFT collection. `) +
        color.bold(`Please return to main menu to mint.\n`));

      // if no collection propmt to return to main menu
      await returnToMain('return to main to restart the reset process with the correct CLIENT_ADDRESS');
    }
            
    // if collection exists, get array
    //
    // get nft collection for CLIENT_ADDRESS
    var [ gasRequired, storageDeposit, RESULT_collection, OUTPUT_collection ] =
      await contractGetter(
        api,
        socket,
        contract,
        'Authenticate',
        'getCollection',
        CLIENT_ADDRESS,
      );
    const collection = JSON.parse(JSON.stringify(OUTPUT_collection));

    // find nft to authenticated
    const nfts = Array.from(collection.ok.ok);

    // print table of NFTs and their authentication status
    console.log(color.bold(`AVAILABLE NFTs TO RESET\n`));
    let nft: any;
    let reset: number[] = [];
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
      if (authenticated.ok == TRUE) {

        console.log(green(`\t${nft.u64}\n`));
            
        reset.push(nft.u64);
      }
    }

    // check if collection contains authenticated nfts to reset
    if (reset == []) {

      console.log(red(`UA-NFT`) + color.bold(`|CLIENT-APP: `) +
        color.bold(`This collection has no universal access NFTs available to reset. `) +
        color.bold(`They are all not authenticated.`));

      // if no collection propmt to return to main menu
      await returnToMain('return to main menu');
    }

    // second prompt, get NFT ID
    await (async () => {

      // get valid nft address
      let responseId = await prompts({
        type: 'number',
        name: 'id',
        message: 'Now, enter the ID of the NFT credentials you would like to reset.\n',
        validate: id => !reset.includes(id) ?
          red(`UA-NFT`) + color.bold(`|CLIENT-APP: `) + `Not a NFT you can reset right now. Reenter ID.` : true
      }, { onCancel });
      const id = responseId.id;
      console.log('');

      if (id != undefined) {
      
        // create key pair for owner
        const keyring = new Keyring({type: 'sr25519'});
        const CLIENT_PAIR = keyring.addFromUri(CLIENT_MNEMONIC);

        // define special type for gas weights
        type WeightV2 = InstanceType<typeof WeightV2>;
        const gasLimit = api.registry.createType('WeightV2', {
          refTime: refTimeLimit,
          proofSize: proofSizeLimit,
        }) as WeightV2;

        // too much gas required?
        if (1 /* gasRequired*/ > gasLimit) {  // need to fix dry run.

           // logging and terminate
           console.log(red(`UA-NFT`) + color.bold(`|CLIENT-APP: `) +
             'tx aborted, gas required is greater than the acceptable gas limit.');
        }

        // submit doer tx
        let extrinsic = await contract.tx['psp34::transfer'](
           { storageDepositLimit, gasLimit }, CLIENT_ADDRESS, {u64: id}, [0])
             .signAndSend(CLIENT_PAIR, async result => {

          // when tx hits block
          if (result.status.isInBlock) {
  
            // logging
            console.log(yellow(`UA-NFT`) + color.bold(`|CLIENT-APP: `) + `NFT reset in a block`);

          // when tx is finalized in block, tx is successful
          } else if (result.status.isFinalized) {

            // logging and terminate
            console.log(green(`UA-NFT`) + color.bold(`|CLIENT-APP: `) +
              color.bold(`NFT reset successful\n`));
            console.log(color.bold.magenta(`UA-NFT`) + color.bold(`|CLIENT-APP: `) +
              color.bold(`To create new credentials for universal access NFT `) +
              red(`ID ${id}`) + color.bold(` you will need to reauthenticate and register.\n
                                       `));
            await returnToMain('return to main menu to reregister NFT ' + red(`ID ${id}`));
          }
      });
    }
  })();
});


