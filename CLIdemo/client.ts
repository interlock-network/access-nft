//
// INTERLOCK NETWORK & ALEPH ZERO
// PSP34 UNIVERSAL ACCESS NFT - CLIENT MAIN
//

import { fork } from 'child_process';

// child process paths
import * as path from 'path';
const menu = path.resolve('client.js');
const mint = path.resolve('clientMint.js');
const authenticate = path.resolve('clientAuthenticate.js');
const display = path.resolve('clientDisplay.js');
const reset = path.resolve('clientReset.js');
const login = path.resolve('clientLogin.js');

// imports
import * as prompts from 'prompts';

// start menu options
const options = [
  { title: 'mint universal access NFT', value: 'mint' },
  { title: 'register universal access NFT', value: 'authenticate' },
  { title: 'display universal access NFT collection', value: 'display' },
  { title: 'login to restricted access area', value: 'login' },
  { title: 'reset username and password for restricted access area', value: 'reset' },
  { title: 'quit application', value: 'quit' }
];

async function mainMenu() {

  try {
    const response = await prompts([
      {
        type: 'select',
        name: 'choice',
        message: '\nUNIVERSAL ACCESS NFT DEMO APP ~ Please choose an action:',
        choices: options,
      }
    ]);

    switch (response.choice) {

      case 'mint':

        // initiate minting process for wallet
        const mintChild = fork(mint);

        mintChild.on('message', () => {
          
          // initiate minting process for wallet
          const menuChild = fork(menu);
        });
        break;    

      case 'authenticate':

        // initiate authentication process for wallet
        const authenticateChild = fork(authenticate);

        authenticateChild.on('message', () => {
          
          // initiate minting process for wallet
          const menuChild = fork(menu);
        });
        break;

      case 'display':

        // display wallet's available NFTs
        const displayChild = fork(display);

        displayChild.on('message', () => {
          
          // initiate minting process for wallet
          const menuChild = fork(menu);
        });
        break;

      case 'login':

        // login to secure restricted access area
        const loginChild = fork(login);

        loginChild.on('message', () => {
          
          // initiate minting process for wallet
          const menuChild = fork(menu);
        });
        break;

      case 'reset':

        // reset username and password
        const resetChild = fork(reset);

        resetChild.on('message', () => {
          
          // initiate minting process for wallet
          const menuChild = fork(menu);
        });
        break;

      case 'quit application':

        console.log('goodbye.');
        process.exit();
        break;
    }

  } catch (error) {
    console.log(error)
  }
}

mainMenu()
