//
// INTERLOCK NETWORK & ALEPH ZERO
// PSP34 UNIVERSAL ACCESS NFT - CLIENT MAIN
//

// child process paths
import * as path from 'path';
const menu = path.resolve('clientMain.js');
const addWallet = path.resolve('clientAddWallet.js');
const deleteWallet = path.resolve('clientDeleteWallet.js');
const mint = path.resolve('clientMint.js');
const authenticate = path.resolve('clientAuthenticate.js');
const display = path.resolve('clientDisplay.js');
const reset = path.resolve('clientReset.js');
const login = path.resolve('clientLogin.js');

// imports
import { fork } from 'child_process';
import * as prompts from 'prompts';

// specify color formatting
import * as color from 'cli-color';
const red = color.red.bold;
const green = color.green.bold;
const blue = color.blue.bold;
const cyan = color.cyan;
const yellow = color.yellow.bold;
const magenta = color.magenta;
const bold = color.bold;

// start menu options
const options = [
  { title: bold('create or add wallet for demo app'), value: 'add'},
  { title: bold('mint new universal access NFT'), value: 'mint' },
  { title: bold('register universal access NFT'), value: 'authenticate' },
  { title: bold('see universal access NFT collection'), value: 'display' },
  { title: bold('login to restricted access area'), value: 'login' },
  { title: bold('reset username and password'), value: 'reset' },
  { title: bold('delete wallet information'), value: 'delete' },
  { title: bold('quit application'), value: 'quit' }
];

async function mainMenu() {

  try {


    const response = await prompts([
      {
        type: 'select',
        name: 'choice',
        message: blue('\n UNIVERSAL ACCESS NFT DEMO APP ~ PLEASE CHOOSE AN ACTION!\n'),
        choices: options,
      }
    ]);

    switch (response.choice) {

      case 'add':

        // initiate minting process for wallet
        const addWalletChild = fork(addWallet);

        addWalletChild.on('message', () => {
          
          const menuChild = fork(menu);
        });
        break;    

      case 'mint':

        // initiate minting process for wallet
        const mintChild = fork(mint);

        mintChild.on('message', () => {
          
          const menuChild = fork(menu);
        });
        break;    

      case 'authenticate':

        // initiate authentication process for wallet
        const authenticateChild = fork(authenticate);

        authenticateChild.on('message', () => {
          
          const menuChild = fork(menu);
        });
        break;

      case 'display':

        // display wallet's available NFTs
        const displayChild = fork(display);

        displayChild.on('message', () => {
          
          const menuChild = fork(menu);
        });
        break;

      case 'login':

        // login to secure restricted access area
        const loginChild = fork(login);

        loginChild.on('message', () => {
          
          const menuChild = fork(menu);
        });
        break;

      case 'reset':

        // reset username and password
        const resetChild = fork(reset);

        resetChild.on('message', () => {
          
          const menuChild = fork(menu);
        });
        break;

      case 'delete':

        // reset username and password
        const deleteWalletChild = fork(deleteWallet);

        deleteWalletChild.on('message', () => {
          
          const menuChild = fork(menu);
        });
        break;

      case 'quit':

        console.clear();
        console.log(red(`\n\n GOODBYE!!!\n\n`));

        setTimeout( () => {
          console.clear();
          process.exit();
        }, 2500);
    }
  } catch (error) {
    console.log(error)
  }
}

console.clear();
console.log(blue(`\n\n Welcome to the Universal Access NFT demo app!\n\n`));

console.log(red(` The value of this tech is as a blockchain-based secret/access`));
console.log(red(` management system using NFTs and crypto hashing to establish`));
console.log(red(` access permissions/credentials highly resistant to compromise.\n`));

console.log(yellow(`. NFT provides owner right to register one set of access credentials.`));
console.log(yellow(`. All stored credential info--all id info--is kept secret.`));
console.log(yellow(`. Never are access permission secrets or id info stored in database.`));
console.log(yellow(`. Id info and secrets stored on blockchain as SHA256 hash digests.`));
console.log(yellow(`. Secrets are only as vulnerable as https protocol or root ability`));
console.log(yellow(`  to scrape runtime memory in the server responsible for granting`));
console.log(yellow(`  client applications auth token or access to restricted area`));
console.log(yellow(`  (that is, disregarding cases of compromised client device or phish).\n`));

console.log(bold.magenta(` This is a proof of concept containing all the key pieces.`));
console.log(bold.magenta(` Production implementations will vary.\n\n`));

console.log(blue(`~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n`));

mainMenu();
