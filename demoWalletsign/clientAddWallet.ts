//
// INTERLOCK NETWORK & ALEPH ZERO
// PSP34 UNIVERSAL ACCESS NFT - CLIENT CREATE WALLET
//

// imports
import { io } from 'socket.io-client';
import * as prompts from 'prompts';
import * as crypto from 'crypto';
import * as fs from 'fs';

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
  returnToMain,
  isValidSubstrateAddress,
  isValidMnemonic,
  onCancel
} from "./utils";

var mnemonic;
var address;

async function addWallet() {

  try {

    console.log(green(`\nUA-NFT`) + color.bold(`|CLIENT-APP: `) +
      color.bold(`We need a wallet to sign transactions.`));
    console.log(green(`UA-NFT`) + color.bold(`|CLIENT-APP: `) +
      color.bold(`This wallet will be the simplest kind:`));
    console.log(green(`UA-NFT`) + color.bold(`|CLIENT-APP: `) +
      color.bold(`local file with address-mnemonic pair.\n\n`));

    console.log(red(`UA-NFT`) + color.bold(`|CLIENT-APP: `) +
      color.bold(`THIS APP IS FOR DEMO PURPOSES ONLY.`));
    console.log(red(`UA-NFT`) + color.bold(`|CLIENT-APP: `) +
      color.bold(`WE RECOMMEND YOU USE THROW-AWAY ACCOUNT`));
    console.log(red(`UA-NFT`) + color.bold(`|CLIENT-APP: `) +
      color.bold(`IF YOU WITH TO CREATE A NEW WALLET.\n`));

    console.log(green(`UA-NFT`) + color.bold(`|CLIENT-APP: `) +
      color.bold(`OR, YOU MAY USE DEFAULT CLIENT WALLET.`));
    console.log(green(`UA-NFT`) + color.bold(`|CLIENT-APP: `) +
      color.bold(`PROVIDED BY US FOR DEMO PURPOSES.\n`));

    console.log(color.bold.magenta(`\nUA-NFT`) + color.bold(`|CLIENT-APP: `) +
      color.bold(`Create a new account here:`));
    console.log(color.bold.magenta(`UA-NFT`) + color.bold(`|CLIENT-APP: `) +
      color.bold.cyan(`https://test.azero.dev/#/accounts\n`));

    console.log(color.bold.magenta(`UA-NFT`) + color.bold(`|CLIENT-APP: `) +
      color.bold(`And if so, add TZERO by visiting faucet:`));
    console.log(color.bold.magenta(`UA-NFT`) + color.bold(`|CLIENT-APP: `) +
      color.bold.cyan(`https://faucet.test.azero.dev\n\n`));

    console.log(red(`UA-NFT`) + color.bold(`|CLIENT-APP: `) +
      color.bold(`Please only add wallet holding real assets`));
    console.log(red(`UA-NFT`) + color.bold(`|CLIENT-APP: `) +
      color.bold(`if you trust the machine or device`));
    console.log(red(`UA-NFT`) + color.bold(`|CLIENT-APP: `) +
      color.bold(`that this application is running on.\n`));

    // prompt
    //
    // proceed to create new wallet?
    (async () => {

      // get response
      var responseChoice = await prompts({
        type: 'confirm',
        name: 'choice',
        message: 'Add your own account instead of default?',
        }, { onCancel });
      const choice = responseChoice.choice
      console.log('');

      if (choice == false) {

        process.send('done');
        process.exit();
      }

      // first prompt: address
      await (async () => {

        // get valid address
        let responseAddress = await prompts({
          type: 'text',
          name: 'address',
          message: 'Please enter account address.\n',
          validate: address => !isValidSubstrateAddress(address) ?
            red(`UA-NFT`) + color.bold(`|CLIENT-APP: `) + `Invalid address` : true
        }, { onCancel });
        address = responseAddress.address;
        console.log('');

        // second prompt: mnemonic
        await (async () => {

          // get valid mnemonic
          let responseMnemonic = await prompts({
            type: 'text',
            name: 'mnemonic',
            message: 'Please enter account address mnemonic.\n',
            validate: mnemonic => !isValidMnemonic(mnemonic) ?
              red(`UA-NFT`) + color.bold(`|CLIENT-APP: `) + `Invalid mnemonic` : true
          }, { onCancel });
          mnemonic = responseMnemonic.mnemonic;
          console.log('');
  
          fs.writeFileSync('.wallet.json', `{"CLIENT_ADDRESS":"${address}",\n` +
                                           `"CLIENT_MNEMONIC":"${mnemonic}"}`);

          console.log(green(`UA-NFT`) + color.bold(`|CLIENT-APP: `) +
            color.bold(`You entered a valid address and mnemonic,`));
          console.log(green(`UA-NFT`) + color.bold(`|CLIENT-APP: `) +
             color.bold(`stored locally to sign transactions.`));
          console.log(green(`UA-NFT`) + color.bold(`|CLIENT-APP: `) +
            color.bold(`At no point will your mnemonic be`));
          console.log(green(`UA-NFT`) + color.bold(`|CLIENT-APP: `) +
            color.bold(`transmitted beyond this device.\n`));


          console.log(yellow(`UA-NFT`) + color.bold(`|CLIENT-APP: `) +
            color.bold(`If you would like to purge your address`));
          console.log(yellow(`UA-NFT`) + color.bold(`|CLIENT-APP: `) +
            color.bold(`and mnemonic information from this app,`));
          console.log(yellow(`UA-NFT`) + color.bold(`|CLIENT-APP: `) +
            color.bold(`you may do so from the main menu.\n`));
  
          await returnToMain('return to mint universal access NFT');
        })();
      })();
     })();
  } catch(error) {

    console.log(red(`UA-NFT`) + color.bold(`|CLIENT-APP: `) + error);

    process.send('program-error');
    process.exit();
  }
}

addWallet();




