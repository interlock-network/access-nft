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
      color.bold(`First we need to add a quick and dirty wallet for signing transactions.`));
    console.log(green(`UA-NFT`) + color.bold(`|CLIENT-APP: `) +
      color.bold(`This wallet will be a file stored locally containing an account-mnemonic pair.\n`));

    console.log(red(`\nUA-NFT`) + color.bold(`|CLIENT-APP: `) +
      color.bold(`THIS APPLICATION IS FOR DEMONSTRATION PURPOSES ONLY.`));
    console.log(red(`UA-NFT`) + color.bold(`|CLIENT-APP: `) +
      color.bold(`WE RECOMMEND YOU USE A THROW-AWAY ACCOUNT FOR CREATING THIS WALLET.\n`));

    console.log(green(`UA-NFT`) + color.bold(`|CLIENT-APP: `) +
      color.bold(`IF YOU WISH, YOU MAY USE THE DEFAULT CLIENT WALLET.`));
    console.log(green(`UA-NFT`) + color.bold(`|CLIENT-APP: `) +
      color.bold(`PROVIDED BY US FOR DEMONSTRATION PURPOSES.\n`));

    console.log(color.bold.magenta(`\nUA-NFT`) + color.bold(`|CLIENT-APP: `) +
      color.bold(`Create a new account here:`));
    console.log(color.bold.magenta(`UA-NFT`) + color.bold(`|CLIENT-APP: `) +
      color.bold.cyan(`https://test.azero.dev/#/accounts\n`));

    console.log(color.bold.magenta(`UA-NFT`) + color.bold(`|CLIENT-APP: `) +
      color.bold(`And if you do, please make sure it has enough TZERO by visiting the faucet here:`));
    console.log(color.bold.magenta(`UA-NFT`) + color.bold(`|CLIENT-APP: `) +
      color.bold.cyan(`https://faucet.test.azero.dev\n`));

    console.log(red(`\nUA-NFT`) + color.bold(`|CLIENT-APP: `) +
      color.bold(`Please only add address containing real assets if you trust the machine or device`));
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
        message: 'Do you wish to create your own account instead of using the default?',
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
          message: 'Please enter the address for the account you wish to use.\n',
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
            message: 'Please enter the mnemonic for the account you wish to use.\n',
            validate: mnemonic => !isValidMnemonic(mnemonic) ?
              red(`UA-NFT`) + color.bold(`|CLIENT-APP: `) + `Invalid mnemonic` : true
          }, { onCancel });
          mnemonic = responseMnemonic.mnemonic;
          console.log('');
  
          fs.writeFileSync('.wallet.json', `{"CLIENT_ADDRESS":"${address}",\n` +
                                           `"CLIENT_MNEMONIC":"${mnemonic}"}`);

          console.log(green(`UA-NFT`) + color.bold(`|CLIENT-APP: `) +
            color.bold(`You entered a valid address and mnemonic`));
          console.log(green(`UA-NFT`) + color.bold(`|CLIENT-APP: `) +
             color.bold(`that will be stored locally to sign for transaction.`));
          console.log(green(`UA-NFT`) + color.bold(`|CLIENT-APP: `) +
            color.bold(`At no point will your mnemonic be transmitted beyond this device.\n`));


          console.log(yellow(`UA-NFT`) + color.bold(`|CLIENT-APP: `) +
            color.bold(`If you would like to purge your address and mnemonic information from this application,`));
          console.log(yellow(`UA-NFT`) + color.bold(`|CLIENT-APP: `) +
            color.bold(`you may do so from the main menu.\n`));
  
          await returnToMain('return to main menu to mint universal access NFT');
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




