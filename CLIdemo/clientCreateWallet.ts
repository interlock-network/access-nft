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
  isValidMnemonic
} from "./utils";

var mnemonic;
var address;

async function createWallet() {

  try {

    console.log(green(`\nACCESSNFT: `) +
      color.bold(`First we need to create a quick and dirty wallet for signing transactions.`));
    console.log(green(`ACCESSNFT: `) +
      color.bold(`This wallet will be a file stored locally containing an account-mnemonic pair.\n`));

    console.log(red(`\nACCESSNFT: `) +
      color.bold(`THIS APPLICATION IS FOR DEMONSTRATION PURPOSES ONLY.`));
    console.log(red(`ACCESSNFT: `) +
      color.bold(`WE RECOMMEND YOU USE A THROW-AWAY ACCOUNT FOR CREATING THIS WALLET.\n`));

    console.log(color.bold.magenta(`ACCESSNFT: `) +
      color.bold(`CREATE NEW ACCOUNT HERE:`));
    console.log(color.bold.magenta(`ACCESSNFT: `) +
      color.bold(`https://test.azero.dev/#/accounts\n`));

    console.log(color.bold.magenta(`ACCESSNFT: `) +
      color.bold(`PLEASE MAKE SURE YOU HAVE ENOUGH TZERO BY VISITING FAUCET HERE:.`));
    console.log(color.bold.magenta(`ACCESSNFT: `) +
      color.bold(`https://faucet.test.azero.dev\n`));

    console.log(red(`ACCESSNFT: `) +
      color.bold(`Please only link address containing real assets if you trust the machine or device`));
    console.log(red(`ACCESSNFT: `) +
      color.bold(`that this application is running on.\n`));

    console.log(green(`\nACCESSNFT: `) +
      color.bold(`IF YOU WISH, YOU MAY USE THE DEFAULT CLIENT WALLET.`));
    console.log(green(`ACCESSNFT: `) +
      color.bold(`PROVIDED BY US FOR DEMONSTRATION..\n`));
            
    // prompt
    //
    // proceed to create new wallet?
    (async () => {

      // get response
      var responseChoice = await prompts({
        type: 'confirm',
        name: 'choice',
        message: 'Do you wish to create your own wallet instead of using the default?',
      });
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
          validate: address => (!isValidSubstrateAddress(address) && (address.length > 0)) ?
            red(`ACCESSNFT: `) + `Invalid address` : true
        });
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
              red(`ACCESSNFT: `) + `Invalid mnemonic` : true
          });
          mnemonic = responseMnemonic.mnemonic;
          console.log('');
  
          fs.writeFileSync('.wallet', `{CLIENT_ADDRESS="${address}",\n` +
                                      `CLIENT_MNEMONIC="${mnemonic}"}`);

          console.log(green(`ACCESSNFT: `) +
            color.bold(`You entered a valid address and mnemonic`));
          console.log(green(`ACCESSNFT: `) +
             color.bold(`that is stored locally to sign for transaction.`));
          console.log(green(`ACCESSNFT: `) +
            color.bold(`At no point will your mnemonic be transmitted somewhere.\n`));


          console.log(yellow(`ACCESSNFT: `) +
            color.bold(`If you would like to purge your address information from this application,`));
          console.log(yellow(`ACCESSNFT: `) +
            color.bold(`you may do so from the main menu.\n`));
  
          await returnToMain('return to main menu to mint universal access NFT');
        })();
      })();
     })();
  } catch(error) {

    console.log(red(`ACCESSNFT: `) + error);

    process.send('program-error');
    process.exit();
  }
}

createWallet();




