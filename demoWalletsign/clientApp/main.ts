//
// INTERLOCK NETWORK & ALEPH ZERO
// PSP34 UNIVERSAL ACCESS NFT - CLIENT MAIN
//

// child process paths
import * as path from 'path';
const menu = path.resolve('main.js');
const addWallet = path.resolve('addWallet.js');
const deleteWallet = path.resolve('deleteWallet.js');
const mint = path.resolve('mint.js');
const authenticate = path.resolve('authenticate.js');
const display = path.resolve('display.js');
const login = path.resolve('login.js');

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
  { title: bold('add wallet or use default for signing tx\n'), value: 'add'},
  { title: bold('mint new universal access NFT\n'), value: 'mint' },
  { title: bold('register or reset universal access NFT credentials\n'), value: 'authenticate' },
  { title: bold('display universal access NFT collection\n'), value: 'display' },
  { title: bold('login to restricted access area\n'), value: 'login' },
  { title: bold('delete wallet information\n'), value: 'delete' },
  { title: bold('quit application\n'), value: 'quit' }
];

async function mainMenu() {

  try {

    const response = await prompts([
      {
        type: 'select',
        name: 'choice',
        message: blue(' UNIVERSAL ACCESS NFT DEMO APP ~ PLEASE CHOOSE AN ACTION!\n'),
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
console.log(blue(`\n Welcome to the Universal Access NFT demo app!\n`));

console.log(red(` The value of this tech is as a blockchain-based secret/access`));
console.log(red(` management system using NFTs and crypto hashing to establish`));
console.log(red(` access permissions/credentials highly resistant to compromise.\n`));

console.log(yellow(`. NFT provides owner right to register one set of access credentials.`));
console.log(yellow(`. All credential info is kept secret, anonymized on blockchain..`));
console.log(yellow(`. Never are access credentials stored in database.`));
console.log(yellow(`. Anonymized credentials stored on blockchain as SHA256 hash digests.`));
console.log(yellow(`. Architecture lends itself to future zero-knowledge proof scheme.\n`));

console.log(bold.magenta(` This is a proof of concept containing all the key pieces.`));
console.log(bold.magenta(` Production implementations will vary. Implementation may be`));
console.log(bold.magenta(` configured for basic username/password, or 2FA token issue.\n`));

mainMenu();
