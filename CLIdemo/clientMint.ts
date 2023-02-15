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
import { readFileSync } from "fs";
import * as prompts from 'prompts';

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
  returnToMain,
  onCancel
} from "./utils";

// constants
const WALLET = JSON.parse(readFileSync('.wallet.json').toString());
const CLIENT_MNEMONIC = WALLET.CLIENT_MNEMONIC
const CLIENT_ADDRESS = WALLET.CLIENT_ADDRESS;
const OWNER_ADDRESS = process.env.OWNER_ADDRESS;

// setup socket connection with autheticateWallet script
var socket = io('http://localhost:3000');
socket.on('connect', async () => {

  console.log(blue(`\nUA-NFT`) + color.bold(`|CLIENT-APP: `) +
    `demoApp connect, SID ` + cyan(`${socket.id}\n`));
   
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
      
    socket.emit('mint-nft', [CLIENT_ADDRESS]);
  })();
});

socket.onAny(async (message, ...args) => {

  // server received request and is waiting for payment from client
  if (message == 'pay-to-mint') {

    const price = args[0][0];
    const adjustedPrice = price/1000000000000;

    console.log(red(`UA-NFT`) + color.bold(`|CLIENT-APP: `) +
      color.bold(`Server is waiting on your payment.\n`));

    console.log(yellow(`UA-NFT`) + color.bold(`|CLIENT-APP: `) +
      color.bold(`The current price of one universal access NFT`));
    console.log(yellow(`UA-NFT`) + color.bold(`|CLIENT-APP: `) +
      color.bold(`to our restricted area is `) + red(`${adjustedPrice} TZERO\n`));
    console.log(yellow(`UA-NFT`) + color.bold(`|CLIENT-APP: `) +
      color.bold(`Do you still wish to proceed, to purchase and`));
    console.log(yellow(`UA-NFT`) + color.bold(`|CLIENT-APP: `) +
      color.bold(`transfer`) + red(` ${adjustedPrice} TZERO `) +
      color.bold(`to NFT contract owner's account`));

    console.log(yellow(`UA-NFT`) + color.bold(`|CLIENT-APP: `) +
      color.bold.magenta(`${OWNER_ADDRESS}`) + color.bold(` ?\n`));

    // verify mint intention, at given price
    await (async () => {

      var choice = await prompts({
        type: 'select',
        name: 'return',
        message: 'Please confirm:',
        choices: [
          { title: `YES, transfer ${adjustedPrice} TZERO to mint my NFT.\n`, value: 'mint' },
          { title: 'NO, I do not wish to purchase an NFT for this price.\n', value: 'cancel' },
        ]
      }, { onCancel });
      if (choice.return == 'cancel') {

        process.send('done');
        process.exit();
      }

      if (choice.return == 'mint') {
      
        // establish connection with blockchain
        const [ api, contract ] = await setupSession('mint');

        // create keypair for owner
        const keyring = new Keyring({type: 'sr25519'});
        const CLIENT_PAIR = keyring.addFromUri(CLIENT_MNEMONIC);

        const transfer = api.tx.balances.transfer(OWNER_ADDRESS, price);

        // Sign and send the transaction using our account
        const hash = await transfer.signAndSend(CLIENT_PAIR);

        console.log(green(`UA-NFT`) + color.bold(`|CLIENT-APP: `) +
          color.bold(`Transfer transaction finalized.`));
        console.log(green(`UA-NFT`) + color.bold(`|CLIENT-APP: `) +
          color.bold(`Transaction hash for record: `));
        console.log(color.yellow(`${hash}\n`));
      }
     })();
  // payment received and mint in progress
  } else if (message == 'minting-nft') {

    const price = args[0][0];
    const adjustedPrice = price/1000000000000;

    // minting tx is in progress
    console.log(green(`UA-NFT`) + color.bold(`|CLIENT-APP: `) +
      color.bold(`Payment received!!!`) +
      red(` ${adjustedPrice} TZERO`));
    console.log(yellow(`UA-NFT`) + color.bold(`|CLIENT-APP: `) +
      color.bold(`Please stand by while we mint your NFT...\n`));

  // mint complete
  } else if (message == 'mint-complete') {

    // newly minted nft
    const nftId = args[0][0].u64;

    // success
    console.log(green(`\n\nUA-NFT`) + color.bold(`|CLIENT-APP: `) +
      color.bold(`Universal Access NFT successfully minted!!!`));

    console.log(green(`UA-NFT`) + color.bold(`|CLIENT-APP: `) +
      color.bold(`Your new Universal Access NFT is `) +
      red(`ID ${nftId}`) + color.bold(`!\n`));
    console.log(color.bold.magenta(`\n\nUA-NFT`) + color.bold(`|CLIENT-APP: `) +
      color.bold(`Check out your collection to see NFT status.\n`));

    await returnToMain('return to main menu to authenticate or display NFT');
  }
});
