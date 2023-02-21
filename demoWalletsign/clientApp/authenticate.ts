//
// INTERLOCK NETWORK & ALEPH ZERO
// PSP34 UNIVERSAL ACCESS NFT - CLIENT AUTHENTICATE
//

// imports (anything polkadot with node-js must be required)
const { ApiPromise, WsProvider, Keyring } = require('@polkadot/api');
const { ContractPromise, CodePromise } = require('@polkadot/api-contract');
const WeightV2 = require('@polkadot/types/interfaces');

// imports
import { fork } from 'child_process';
import { readFileSync } from "fs";
import * as prompts from 'prompts';

// environment constants
import * as dotenv from 'dotenv';
dotenv.config();

// child process paths
import * as path from 'path';
const register = path.resolve('register.js');

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
  isValidUsername,
  isAvailableUsername,
  setupSession,
  getHash,
  returnToMain,
  hasCollection,
  onCancel
} from "./utils";

const WALLET = JSON.parse(readFileSync('.wallet.json').toString());
const CLIENT_MNEMONIC = WALLET.CLIENT_MNEMONIC
const CLIENT_ADDRESS = WALLET.CLIENT_ADDRESS;
  
var username;
var password;
var passwordVerify;

async function authenticate() {

  try {

    // establish connection with blockchain
    const [ api, contract ] = await setupSession('authenticate');

    // create keypair for owner
    const keyring = new Keyring({type: 'sr25519'});
    const CLIENT_PAIR = keyring.addFromUri(CLIENT_MNEMONIC);

    // check to see if CLIENT_ADDRESS has nft collection
    if (!(await hasCollection(api, contract, CLIENT_ADDRESS))) {
        
      console.log(red(`UA-NFT`) + color.bold(`|CLIENT-APP: `) +
        color.bold(`Your have no universal access NFTs.`));
      console.log(red(`UA-NFT`) + color.bold(`|CLIENT-APP: `) +
        color.bold(`Please return to main menu to mint.\n`));

      // if no collection propmt to return to main menu      
      await returnToMain('goto main menu to mint universal access NFT');
    }

    // if collection exists, get array
    //
    // get nft collection for CLIENT_ADDRESS
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
    console.log(color.bold(`AVAILABLE UANFTs TO REGISTER\n`));
    let nft: any;
    let ids: any[] = [];
    for (nft of nfts) {

      // get attribute isauthenticated state
      var [ gasRequired, storageDeposit, RESULT_authenticated, OUTPUT_authenticated ] =
        await contractGetter(
          api,
          contract,
          CLIENT_PAIR,
          'Authenticate',
          'isAuthenticated',
          {u64: nft.u64},
        );
      let authenticated = JSON.parse(JSON.stringify(OUTPUT_authenticated));

      // record nft id of one that is waiting and ready to authenticate
      if (authenticated.ok.ok == true) {

        console.log(red(`\t${nft.u64}\n`));

      } else {

        console.log(green(`\t${nft.u64}\n`));
      }
      ids.push(nft.u64);
    }

    console.log(red(`UA-NFT`) + color.bold(`|CLIENT-APP: `) +
      color.bold(`NFT IDs in red already have access credentials`));
    console.log(red(`UA-NFT`) + color.bold(`|CLIENT-APP: `) +
      color.bold(`that you registered with them.`));
    console.log(red(`UA-NFT`) + color.bold(`|CLIENT-APP: `) +
      color.bold(`If you proceed to register new credentials with`));
    console.log(red(`UA-NFT`) + color.bold(`|CLIENT-APP: `) +
      color.bold(`the NFT IDs in red, you will overwrite the old.\n`));

    // prompt, NFT ID
    await (async () => {

      // get valid nft address
      let responseId = await prompts({
        type: 'number',
        name: 'id',
        message: 'Enter the ID of the UANFT you wish to register credentials for.\n',
        validate: id => !ids.includes(id) ?
          red(`UA-NFT`) + color.bold(`|CLIENT-APP: `) + `NFT ID not in your collection.` : true
      }, { onCancel });
      const id = responseId.id;
      console.log('');

      if (id != undefined) {

        // prompt: username
        await (async () => {

          console.clear();

          console.log(red(`\n\nUA-NFT`) + color.bold(`|CLIENT-APP: `) +
            color.bold(`!!! WARNING !!!\n`));

          console.log(red(`UA-NFT`) + color.bold(`|CLIENT-APP: `) +
            color.bold(`Because your credentials are anonymized, `));
          console.log(red(`UA-NFT`) + color.bold(`|CLIENT-APP: `) +
            color.bold(`it is impossible for us to reveal your`));
          console.log(red(`UA-NFT`) + color.bold(`|CLIENT-APP: `) +
            color.bold(`username or password if you forget.\n`));
          console.log(red(`UA-NFT`) + color.bold(`|CLIENT-APP: `) +
            color.bold(`If you forget your username or password, you`));
          console.log(red(`UA-NFT`) + color.bold(`|CLIENT-APP: `) +
            color.bold(`must repeat this registration process with`));
          console.log(red(`UA-NFT`) + color.bold(`|CLIENT-APP: `) +
            color.bold(`a DIFFERENT username.\n`));
          console.log(red(`UA-NFT`) + color.bold(`|CLIENT-APP: `) +
            color.bold(`(This is the only way we can ensure access`));   
          console.log(red(`UA-NFT`) + color.bold(`|CLIENT-APP: `) +
            color.bold(`credentials are anonymized and secure in a`));   
          console.log(red(`UA-NFT`) + color.bold(`|CLIENT-APP: `) +
            color.bold(`transparent blockchain environment.)\n`));   

          console.log(red(`UA-NFT`) + color.bold(`|CLIENT-APP: `) +
            color.bold(`Maybe WRITE THEM DOWN somewhere...?\n`));

          console.log(color.bold.magenta(`UA-NFT`) + color.bold(`|CLIENT-APP: `) +
            color.bold(`CREDENTIALS ARE NEVER STORED IN A DATABASE.`));
          console.log(color.bold.magenta(`UA-NFT`) + color.bold(`|CLIENT-APP: `) +
            color.bold(`THEY ARE ANONYMIZED & STORED ON BLOCKCHAIN.\n\n`));

          // loop prompt until valid username
          var isAvailable = false;
          while (isAvailable == false) {

            // get valid username
            var responseUsername = await prompts({
              type: 'text',
              name: 'username',
              message: 'Please choose username, 5+ characters of any type but no space.\n',
              validate: username => !isValidUsername(username) ?
                red(`UA-NFT`) + color.bold(`|CLIENT-APP: `) + `Too short / contains spaces.` : true
            }, { onCancel });
            username = responseUsername.username;
            console.log('');

            // if valid, check if username is available
            if (await isAvailableUsername(api, contract, getHash(username))) {

              // break the prompt loop
              isAvailable = true;

            } else {

              console.log(red(`UA-NFT`) + color.bold(`|CLIENT-APP: `) +
                color.bold(`Username taken. Choose different username.\n`));
            }
          }
    
          // prompt: password
          (async () => {
        
            // loop prompt until valid password match
            do {

              // get valid password
              var responsePassword = await prompts([
                {
                  type: 'password',
                  name: 'password',
                  message: 'Please choose password with 8+ characters.\n  Whitespace ok, no length limit.\n',
                  validate: password => (password.length < 8) ?
                    red(`UA-NFT`) + color.bold(`|CLIENT-APP: `) + color.bold(`Password too short.\n`) : true
                },
                {
                  type: 'password',
                  name: 'passwordVerify',
                  message: 'Please verify your password.\n',
                }
              ], { onCancel });
              passwordVerify = responsePassword.passwordVerify ?? 'passwordVerify';
              password = responsePassword.password ?? 'password';
              console.log('');

              if (password != passwordVerify) {
                console.log(red(`UA-NFT`) + color.bold(`|CLIENT-APP: `) + color.bold(`Password mismatch.\n`));
              }
            }
            while (password != passwordVerify);
        
            console.log(green(`UA-NFT`) + color.bold(`|CLIENT-APP: `) +
              color.bold(`You successfully entered new credentials.\n`));

            console.log(yellow(`UA-NFT`) + color.bold(`|CLIENT-APP: `) +
              color.bold(`Stand by while we register your UANFT.`));

            // fork process to register UANFT and set credentials provided
            const registerChild = fork(register);
            registerChild.send({
              id: id,
              userhash: getHash(username),
              passhash: getHash(password)
            });

            // listen for results of registration tx
            registerChild.on('message', async (message) => {

              if (message == 'register-complete') {

                console.clear();

                console.log(green(`\n\nUA-NFT`) + color.bold(`|CLIENT-APP: `) +
                  color.bold(`Your anonymized NFT access credentials have`));
                console.log(green(`UA-NFT`) + color.bold(`|CLIENT-APP: `) +
                  color.bold(`been stored on the blockchain.\n\n\n\n\n`));

                console.log(green(`UA-NFT`) + color.bold(`|CLIENT-APP: `) +
                  color.bold(`Universal access NFT`) + red(` ID ${id}`) + color.bold(` authenticated!!!`));
                console.log(green(`UA-NFT`) + color.bold(`|CLIENT-APP: `) +
                  color.bold(`You may now login to the restricted access area!!!\n\n`));

                console.log(red(`UA-NFT`) + color.bold(`|CLIENT-APP: `) +
                  color.bold(`!!! REMINDER WARNING !!!\n`));

                console.log(red(`UA-NFT`) + color.bold(`|CLIENT-APP: `) +
                  color.bold(`Because your credentials are anonymized, `));
                console.log(red(`UA-NFT`) + color.bold(`|CLIENT-APP: `) +
                  color.bold(`it is impossible for us to reveal your`));
                console.log(red(`UA-NFT`) + color.bold(`|CLIENT-APP: `) +
                  color.bold(`username or password if you forget.\n`));

                console.log(red(`UA-NFT`) + color.bold(`|CLIENT-APP: `) +
                  color.bold(`If you forget your username or password, you`));
                console.log(red(`UA-NFT`) + color.bold(`|CLIENT-APP: `) +
                  color.bold(`must repeat this registration process with`));
                console.log(red(`UA-NFT`) + color.bold(`|CLIENT-APP: `) +
                  color.bold(`a DIFFERENT username.\n`));

                console.log(red(`UA-NFT`) + color.bold(`|CLIENT-APP: `) +
                  color.bold(`This is the only way we can ensure access`));   
                console.log(red(`UA-NFT`) + color.bold(`|CLIENT-APP: `) +
                  color.bold(`credentials are anonymized and secure in a`));   
                console.log(red(`UA-NFT`) + color.bold(`|CLIENT-APP: `) +
                  color.bold(`transparent blockchain environment.\n`));   

                console.log(red(`UA-NFT`) + color.bold(`|CLIENT-APP: `) +
                  color.bold(`Maybe WRITE THEM DOWN somewhere...?\n\n`));

                console.log(color.bold.magenta(`UA-NFT`) + color.bold(`|CLIENT-APP: `) +
                    color.bold(`USERNAME STORED ON BLOCKCHAIN AS SHA256 HASH`));
                console.log(color.yellow(`0x${getHash(username)}`));
                console.log(color.bold.magenta(`UA-NFT`) + color.bold(`|CLIENT-APP: `) +
                  color.bold(`PASSWORD STORED ON BLOCKCHAIN AS SHA256 HASH `));
                console.log(color.yellow(`0x${getHash(password)}`));
                console.log(green(`UA-NFT`) + color.bold(`|CLIENT-APP: `) +
                  color.bold(`You do not need to record these hash numbers.`));
                console.log(green(`UA-NFT`) + color.bold(`|CLIENT-APP: `) +
                  color.bold(`They are provided in case you wish to verify`));
                console.log(green(`UA-NFT`) + color.bold(`|CLIENT-APP: `) +
                  color.bold(`their presence on-chain via contract explorer, or`));
                console.log(green(`UA-NFT`) + color.bold(`|CLIENT-APP: `) +
                  color.bold(`if you would like to verify SHA256 hashes yourself.\n\n`));


                console.log(color.bold.magenta(`UA-NFT`) + color.bold(`|CLIENT-APP: `) +
                  color.bold(`USERNAME/PASSWORD IMPOSSIBLE TO DERIVE FROM HASH. `));
                console.log(color.bold.magenta(`UA-NFT`) + color.bold(`|CLIENT-APP: `) +
                  color.bold(`SHA256 HASHES VERIFY YOU POSSESS CREDENTIALS`));
                  console.log(color.bold.magenta(`UA-NFT`) + color.bold(`|CLIENT-APP: `) +
                  color.bold(`BY COMPARING LOCAL HASH OF CREDENTIALS YOU PROVIDE`));
                console.log(color.bold.magenta(`UA-NFT`) + color.bold(`|CLIENT-APP: `) +
                  color.bold(`ON LOGIN WITH THE HASHES WE JUST GENERATED`));
                console.log(color.bold.magenta(`UA-NFT`) + color.bold(`|CLIENT-APP: `) +
                  color.bold(`AND STORED ON THE BLOCKCHAIN.\n`));

                console.log(green(`UA-NFT`) + color.bold(`|CLIENT-APP: `) +
                  color.bold(`YOUR CREDENTIALS ARE NEVER STORED IN A DATABASE.`));
                console.log(green(`UA-NFT`) + color.bold(`|CLIENT-APP: `) +
                  color.bold(`THEY ARE ANONYMIZED & STORED ON BLOCKCHAIN.\n`));

                await returnToMain('return to main menu to login to restricted access area');

              } else {

                console.log(red(`UA-NFT`) + color.bold(`|CLIENT-APP: `) +
                  color.bold(`Whoops...something went wrong registering your UANFT!\n`));

                console.log(red(`UA-NFT`) + color.bold(`|CLIENT-APP: `) +
                  color.bold(`Error: ${message}\n`));

                await returnToMain('return to main menu to retry registration');
              }
            });
          })();
        })();
      }
    })();
  } catch(error) {

    console.log(red(`UA-NFT`) + color.bold(`|CLIENT-APP: `) + error);

    process.send('authenticate-process-error');
    process.exit();
  }
}

authenticate();

