//
// INTERLOCK NETWORK & ALEPH ZERO
// PSP34 UNIVERSAL ACCESS NFT - CLIENT MAIN
//

// child process paths
import * as path from 'path';
const menu = path.resolve('clientMain.js');
const createWallet = path.resolve('clientAddWallet.js');
const mint = path.resolve('clientMint.js');
const authenticate = path.resolve('clientAuthenticate.js');
const display = path.resolve('clientDisplay.js');
const reset = path.resolve('clientReset.js');
const login = path.resolve('clientLogin.js');

// imports
import { fork } from 'child_process';
import * as prompts from 'prompts';

// start menu options
const options = [
  { title: 'create or add new wallet for this demo application', value: 'add'},
  { title: 'mint universal access NFT', value: 'mint' },
  { title: 'register universal access NFT', value: 'authenticate' },
  { title: 'display universal access NFT collection', value: 'display' },
  { title: 'login to restricted access area', value: 'login' },
  { title: 'reset username and password', value: 'reset' },
  { title: 'quit application', value: 'quit' }
];

async function mainMenu() {

  try {


    const response = await prompts([
      {
        type: 'select',
        name: 'choice',
        message: '\nUNIVERSAL ACCESS NFT DEMO APP ~ Please choose an action:\n',
        choices: options,
      }
    ]);

    switch (response.choice) {

      case 'add':

        // initiate minting process for wallet
        const createWalletChild = fork(createWallet);

        createWalletChild.on('message', () => {
          
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

      case 'quit application':

        process.exit();
        break;
    }

  } catch (error) {
    console.log(error)
  }
}

console.clear();
console.log(`\n`);
console.log(`Welcome to the Universal Access NFT demonstration application!\n`);

console.log(`The value proposition for this technology is that it is a blockchain secret`);
console.log(`(eg, username/passwords) management system (a form of proof of pseudo proof-of-knowledge)`);
console.log(`that is extremely resistant to compromise:\n`);


console.log(`. At no point in the process are secrets stored in a database in recoverable form.`);
console.log(`. Secrets are as vulnerable as the https protocol and cache level security of server and c\n`);

console.log(`This is just a proof of concept, containing all the key pieces.`);
console.log(`Production implementations are left to the eyes of the beholder.`);

mainMenu();
