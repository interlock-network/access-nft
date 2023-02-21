//
// INTERLOCK NETWORK & ALEPH ZERO
// PSP34 UNIVERSAL ACCESS NFT - CLIENT MINT
//

// imports (anything polkadot with node-js must be required)
const { ApiPromise, WsProvider, Keyring } = require('@polkadot/api');
const { ContractPromise, CodePromise } = require('@polkadot/api-contract');
const { decodeAddress, encodeAddress } = require('@polkadot/keyring');
const WeightV2 = require('@polkadot/types/interfaces');

// imports
import { io } from 'socket.io-client';
import { fork } from 'child_process';
import { readFileSync } from "fs";
import * as prompts from 'prompts';

// child process paths
import * as path from 'path';
const mintTx = path.resolve('mintTx.js');

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
  onCancel
} from "./utils";

// constants
const WALLET = JSON.parse(readFileSync('.wallet.json').toString());
const CLIENT_ADDRESS = WALLET.CLIENT_ADDRESS;
const OWNER_MNEMONIC = process.env.OWNER_MNEMONIC
const OWNER_ADDRESS = process.env.OWNER_ADDRESS;

console.log(magenta(`This mint transaction is signed using the contract owner's`));
console.log(magenta(`keypair for convenience in this demo app. In production,`));
console.log(magenta(`the restricted access server would serve as transaction relay`));
console.log(magenta(`for UANFT mint in exchange for client transfering token to`));
console.log(magenta(`contract owner's address. Or, transfer will occur within`));
console.log(magenta(`an NFT exchange. Or, client app may be configured to`));
console.log(magenta(`self-mint using ILOCK token held in client wallet. See docs`));
console.log(magenta(`for more information about self-mint feature of UANFT contract.\n`));

async function mint() {

  try {

    // establish connection with blockchain
    const [ api, contract ] = await setupSession('mint');

    // create keypair for owner
    const keyring = new Keyring({type: 'sr25519'});
    const OWNER_PAIR = keyring.addFromUri(OWNER_MNEMONIC);
   
    // confirm mint process begining
    await (async () => {

      // get response
      var responseChoice = await prompts({
        type: 'confirm',
        name: 'choice',
        message: `Proceed minting a universal access NFT to your account\n` +
          color.bold.magenta(`${CLIENT_ADDRESS}`) +` ?`,
      }, { onCancel });
      const choice = responseChoice.choice
      console.log('');

      // if cancel, exit
      if (choice == false) {

        process.send('done');
        process.exit();
      }

      if (choice == true) {
              
        // fork process to mint UANFT to client address
        const mintTxChild = fork(mintTx);
        mintTxChild.send(CLIENT_ADDRESS);

        // listen for results of mint tx
        mintTxChild.on('message', async (message) => {

          if (message == 'mint-complete') {

            // get new array of nfts
            //
            // get nft collection for address
            var [ gasRequired, storageDeposit, RESULT_collection, OUTPUT_collection ] =
              await contractGetter(
                api,
                contract,
                OWNER_PAIR,
                'mint',
                'getCollection',
                CLIENT_ADDRESS,
              );
            const collection = JSON.parse(JSON.stringify(OUTPUT_collection));

            // get the id of new nft (last in collection)
            const nftId: any = Array.from(collection.ok.ok).pop();

            // success
            console.log(green(`\n\nUA-NFT`) + color.bold(`|CLIENT-APP: `) +
              color.bold(`Universal Access NFT successfully minted!!!`));

            console.log(green(`UA-NFT`) + color.bold(`|CLIENT-APP: `) +
              color.bold(`Your new Universal Access NFT is `) +
              red(`ID ${nftId.u64}`) + color.bold(`!\n`));
            console.log(color.bold.magenta(`\n\nUA-NFT`) + color.bold(`|CLIENT-APP: `) +
              color.bold(`Check out your collection to see NFT status.\n`));

            await returnToMain('return to main menu to register or display NFT');

          // if some other message
          } else {

            // failure
            console.log(red(`\n\nUA-NFT`) + color.bold(`|CLIENT-APP: `) +
              color.bold(`Something went wrong minting UANFT.`));

            await returnToMain('return to main menu');
          }
        });
      }
    })();
  } catch(error) {

    console.log(red(`UA-NFT`) + color.bold(`|CLIENT-APP: `) + error);

    //process.send('mint-process-error');
    //process.exit();
  }
}

mint();
