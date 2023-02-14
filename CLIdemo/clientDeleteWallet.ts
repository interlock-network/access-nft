//
// INTERLOCK NETWORK & ALEPH ZERO
// PSP34 UNIVERSAL ACCESS NFT - CLIENT DELETE WALLET
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
} from "./utils";


const WALLET = JSON.parse(fs.readFileSync('.wallet.json').toString());
const CLIENT_ADDRESS = WALLET.CLIENT_ADDRESS;

async function deleteWallet() {

  try {

    console.log(red(`\nUA-NFT`) + color.bold(`|CLIENT-APP: `) +
      color.bold(`Do you really wish to delete the wallet you associated with account address`));
    console.log(red(`UA-NFT`) + color.bold(`|CLIENT-APP: `) +
      magenta(`${CLIENT_ADDRESS}\n`) + `?\n`);
            
    // prompt
    //
    // proceed to delete wallet?
    (async () => {

      // get response
      var responseChoice = await prompts({
        type: 'confirm',
        name: 'choice',
        message: 'Delete wallet?',
      });
      const choice = responseChoice.choice
      console.log('');

      if (choice == false) {

        process.send('done');
        process.exit();
      }
  
      fs.writeFileSync('.wallet.json', '');

      console.log(green(`UA-NFT`) + color.bold(`|CLIENT-APP: `) +
        color.bold(`You deleted your wallet.`));
      console.log(green(`UA-NFT`) + color.bold(`|CLIENT-APP: `) +
        color.bold(`You will need to re-add a wallet if you want to continue using this application.\n`));
  
      await returnToMain('return to main menu to add new wallet or quit');

    })();
  } catch(error) {

    console.log(red(`UA-NFT`) + color.bold(`|CLIENT-APP: `) + error);

    process.send('program-error');
    process.exit();
  }
}

deleteWallet();




