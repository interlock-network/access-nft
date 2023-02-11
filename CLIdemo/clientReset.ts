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
  hasCollection
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

// constants
//
// null === no limit
// refTime and proofSize determined by contracts-ui estimation plus fudge-factor
const refTimeLimit = 650000000;
const proofSizeLimit = 150000;
const storageDepositLimit = null;

// setup socket connection with autheticateWallet script
var socket = io('http://localhost:3000');
socket.on('connect', async () => {

  // establish connection with blockchain
   const [ api, contract ] = await setupSession('setAuthenticated');

  console.log(green(`\nACCESSNFT: `) +
    color.bold(`In order to reset your universal access NFT credentials, you MUST know the NFT ID.\n`));

  // begin prompt tree
  //
  // first prompt: wallet address
  await (async () => {

    // get valid wallet address
    let responseWallet = await prompts({
      type: 'text',
      name: 'wallet',
      message: 'Please enter the wallet address for the NFT you would like to reset.\n',
      validate: wallet => (!isValidSubstrateAddress(wallet) && (wallet.length > 0)) ?
        red(`ACCESSNFT: `) + `Invalid address` : true
    });
    let wallet = responseWallet.wallet;
    console.log('');

    // if valid, check to see if wallet has nft collection
    if (!(await hasCollection(api, contract, wallet))) {

      console.log(red(`ACCESSNFT: `) +
        color.bold(`This wallet has no universal access NFT collection.`) +
        color.bold(`  Please return to main menu to mint.\n`));

      // if no collection propmt to return to main menu
      await returnToMain('return to main to restart the reset process with the correct wallet');
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

      console.log(red(`ACCESSNFT: `) +
        color.bold(`This collection has no universal access NFTs to reset. They are all not authenticated.`));

      // if no collection propmt to return to main menu
      await returnToMain('return to main menu');
    }

     // second prompt, get NFT ID
     await (async () => {

      // get valid wallet address
       let responseId = await prompts({
         type: 'number',
        name: 'id',
        message: 'Now, enter the ID of the NFT credentials you would like to reset.\n',
         validate: id => !reset.includes(id) ?
           red(`ACCESSNFT: `) + `Not a NFT you can reset right now. Reenter ID.` : true
      });
       const id = responseId.id;
       console.log('');
       /* 
      // get attribute isauthenticated state
      var [ gasRequired, storageDeposit, RESULT_authenticated, OUTPUT_authenticated ] =
        await contractGetter(
          api,
          socket,
          contract,
          'Reset',
          'psp34::transfer',
          wallet,
          {u64: id},
          0
        ); 
*/

      // create key pair for owner
       const keyring = new Keyring({type: 'sr25519'});
      const OWNER_PAIR = keyring.addFromUri(OWNER_MNEMONIC);

      // define special type for gas weights
       type WeightV2 = InstanceType<typeof WeightV2>;
      const gasLimit = api.registry.createType('WeightV2', {
        refTime: refTimeLimit,
        proofSize: proofSizeLimit,
      }) as WeightV2;

      // too much gas required?
      if (gasRequired > gasLimit) {

         // logging and terminate
         console.log(red(`ACCESSNFT:`) +
           ' tx aborted, gas required is greater than the acceptable gas limit.');
      }

      // submit doer tx
      let extrinsic = await contract.tx['psp34::transfer'](
         { storageDepositLimit, gasLimit }, wallet, {u64: id}, 0)
           .signAndSend(OWNER_PAIR, async result => {

        // when tx hits block
        if (result.status.isInBlock) {
  
          // logging
           console.log(yellow(`ACCESSNFT:`) + ` NFT transfer in a block`);

        // when tx is finalized in block, tx is successful
         } else if (result.status.isFinalized) {

          // logging and terminate
           console.log(green(`ACCESSNFT: `) +
              color.bold(`NFT transfer successful`));
          await returnToMain('return to main menu to reregister NFT ' + red(`ID ${id}`));
         }
      });
    })();
  })();
});


