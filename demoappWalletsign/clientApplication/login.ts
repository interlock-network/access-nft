//
// INTERLOCK NETWORK & ALEPH ZERO
// PSP34 UNIVERSAL ACCESS NFT - CLIENT LOGIN
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
  setupSession,
  returnToMain,
  onCancel,
  isValidUsername
} from "./utils";

const OWNER_MNEMONIC = process.env.OWNER_MNEMONIC;

// setup secure connection with accessArea server,
// allowing self-signed certificate for demoapp purposes
//
// in production, one should use a certificate authority
var socket = io('https://localhost:8443', {
    rejectUnauthorized: false
});

// every time a client connects to login
socket.on('connect', async () => {

  // https connect success notification
  console.log(blue(`\nUA-NFT`) + color.bold(`|CLIENT-APP: `) +
    color.bold(`demoApp, SID` + cyan(` ${socket.id}`) + ` connected`));
  console.log(blue(`UA-NFT`) + color.bold(`|CLIENT-APP: `) +
    color.bold(`to secure restricted access area server via https.\n`));

  // begin prompt tree
  //
  // prompt: login username
  (async () => {

    // get username
    var responseUsername = await prompts({
      type: 'text',
      name: 'username',
      message: 'Please enter your username to log into restricted area.\n',
      validate: username => !isValidUsername(username) ?
        red(`UA-NFT`) + color.bold(`|CLIENT-APP: `) + `Too short or contains spaces.` : true
    }, { onCancel });
    const username = responseUsername.username;
    console.log('');
    
    // prompt: password
    (async () => {

      // get password
      var responsePassword = await prompts({
        type: 'password',
        name: 'password',
        message: 'Please enter your password.',
        validate: password => (password.length < 8) ?
          red(`UA-NFT`) + color.bold(`|CLIENT-APP: `) + `Password invalid.` : true
      }, { onCancel });
      const password = responsePassword.password;
      console.log('');
      
      // if not onCancel, notify credentials are begin sent to accessArea server to be
      // hashed and checked against blockchain records
      if (password != undefined) {
        console.log(green(`UA-NFT`) + color.bold(`|CLIENT-APP: `) +
          color.bold(`submitting login information over secure`));
        console.log(green(`UA-NFT`) + color.bold(`|CLIENT-APP: `) +
          color.bold(`https connection for SHA256 hash verification`));
        console.log(green(`UA-NFT`) + color.bold(`|CLIENT-APP: `) +
          color.bold(`against blockchain credential hash record.\n`));

        // letting accessArea server know we want to access restricated access area
        socket.emit('request-access', username, password);

        // wating for response from accessArea getCredential check
        socket.onAny( async (message, ...args) => {

          // no userhash exists on blockchain
          if (message == 'bad-username') {

            // notify and kick back to main menu
            console.log(red(`UA-NFT`) + color.bold(`|CLIENT-APP: `) +
              color.bold(`username is incorrect or does not exist...`));
            console.log(red(`UA-NFT`) + color.bold(`|CLIENT-APP: `) +
              color.bold(`...please try again\n`));

            setTimeout( () => {

              process.send('fail');
              process.exit();
            }, 3000);

          // userhash exists but passhash missmatch
          } else if (message == 'bad-password') {

            // notify and kick back to main menu
            console.log(red(`UA-NFT`) + color.bold(`|CLIENT-APP: `) +
              color.bold(`password is incorrect...`));
            console.log(red(`UA-NFT`) + color.bold(`|CLIENT-APP: `) +
              color.bold(`...please try again\n`));

            setTimeout( () => {

              process.send('fail');
              process.exit();
            }, 3000);

          // userhash exists and passhash matches
          } else if (message == 'access-granted') {

            // enter restricted access area and fetch art
            console.clear();
            console.log(green(`\n LOGIN SUCCESS!!!\n\n`));
            socket.emit('fetch-art');

            // when art is received, display
            socket.on('ascii-art', (art) => {

              // big ol welcome banner
              console.log(red(`${art}`));
              console.log(`\n\n\n\n\n\n\n`);

              // prompt
              //
              // do something useful?
              (async () => {

                // get response
                var responseSomething = await prompts({
                  type: 'confirm',
                  name: 'something',
                  message: 'do something useful?',
                });
                const something = responseSomething.something;
                console.log('');

                // notify accessArea depending on choice
                if (something) {
                  socket.emit('do-something-useful');
                } else {
                  socket.emit('do-something-useless');
                }
              })();
            });

            // confirmation that the priviledged user did something useful
            socket.on('did-something-useful', (result) => {

              console.log(color.bold(` You just did something useful by setting`));
              console.log(blue(` somethingUseful = `) + green(`${result}`));
              console.log(color.bold(` in the restricted area!!!\n`));

              // kick user back to main menu
              (async () => {

                var choice = await prompts({
                  type: 'select',
                  name: 'logout',
                  message: 'Next options:',
                  choices: [{ title: 'logout', value: 'logout' }]
                });
               
                socket.emit('logout');
                process.send('done');
                process.exit();
              })();
            });

            // confirmation that the priviledged user did something useless
            socket.on('did-something-useless', (result) => {

              console.log(color.bold(` You just did something useless by setting`));
              console.log(blue(` somethingUseful = `) + red(`${result}`));
              console.log(color.bold(` in the restricted area!!!\n`));

              // kick user back to main menu
              (async () => {

                var choice = await prompts({
                  type: 'select',
                  name: 'logout',
                  message: 'Next options:',
                  choices: [{ title: 'logout', value: 'logout' }]
                });
               
                socket.emit('logout');
                process.send('done');
                process.exit();
              })();
            });
          }
        });
      }
    })();
  })();
});

