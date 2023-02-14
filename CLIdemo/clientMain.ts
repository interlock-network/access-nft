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
  { title: bold('create or add new wallet for this demo application'), value: 'add'},
  { title: bold('mint universal access NFT'), value: 'mint' },
  { title: bold('register universal access NFT'), value: 'authenticate' },
  { title: bold('display universal access NFT collection'), value: 'display' },
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
        message: blue('\nUNIVERSAL ACCESS NFT DEMO APP ~ PLEASE CHOOSE AN ACTION!\n'),
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
        console.log(red(`\n            GOODBYE!!!\n\n`));

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
console.log(`\n`);
console.log(blue(`Welcome to the Universal Access NFT demonstration application!\n`));

console.log(red(`The value of this technology derives from being a blockchain-based secret`));
console.log(red(`management system (eg for usernames/passwords) using NFTs and cryptographic hashing`));
console.log(red(`to establish access permissions and credentials that are extremely resistant to compromise.\n`));


console.log(yellow(`. Access permission secrets or identifying information are never stored in a database or in cleartext.`));
console.log(yellow(`. Identifying information and secrets are stored on the blockchain as SHA256 hash digests.`));
console.log(yellow(`. Secrets are at most as vulnerable as the https protocol and the root access to RAM `));
console.log(yellow(`  program runtime memory in the server verifying client access permission credentials`));
console.log(yellow(`  (disregarding of course, the case of a compromised client device or phishing attack).`));
console.log(yellow(`. NFTs provide holders with the right to establish access/permission credentials.`));
console.log(yellow(`. All stored credential information--all identifying information--is kept secret.\n`));

console.log(bold.magenta(`This is a proof of concept containing all the key pieces.`));
console.log(bold.magenta(`Production implementations will vary.\n`));

console.log(blue(`~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n`));

mainMenu();
