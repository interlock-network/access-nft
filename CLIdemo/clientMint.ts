//
// INTERLOCK NETWORK & ALEPH ZERO
// PSP34 UNIVERSAL ACCESS NFT - CLIENT MINT
//

// imports (anything polkadot with node-js must be required)
const { ApiPromise, WsProvider, Keyring } = require('@polkadot/api');
const { ContractPromise, CodePromise } = require('@polkadot/api-contract');
const { decodeAddress, encodeAddress } = require('@polkadot/keyring');
const WeightV2 = require('@polkadot/types/interfaces');

// imports
import { io } from 'socket.io-client';
import * as prompts from 'prompts';

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
  setupSession,
  contractDoer
} from "./utils";

const OWNER_MNEMONIC = process.env.OWNER_MNEMONIC;

// constants
//
// null === no limit
// refTime and proofSize determined by contracts-ui estimation plus fudge-factor
const refTimeLimit = 8000000000;
const proofSizeLimit = 180000;
const storageDepositLimit = null;
  
var wallet;

// setup socket connection with autheticateWallet script
var socket = io('http://localhost:3000');
socket.on('connect', async () => {

  console.log(blue(`ACCESSNFT:`) +
    ` accessApp socket connected, ID ` + cyan(`${socket.id}`));
   
  // establish connection with blockchain
  const [ api, contract ] = await setupSession('setAuthenticated');

  console.log(magenta('\nYou will be minting this universal access NFT'));
  console.log(magenta('as the owner of the NFT smart contract. In practice,'));
  console.log(magenta('the client application will not have this privilege,'));
  console.log(magenta('and the NFTs will be minted by the server that contains'));
  console.log(magenta('the secret mnemonic key for the contract\'s owner account.'));
  console.log(magenta('This functionality is up to the adopter to implement.\n'));

  // begin prompt tree
  //
  // first prompt: wallet address
  (async () => {

    // get valid wallet address
    let responseWallet = await prompts({
      type: 'text',
      name: 'wallet',
      message: 'Please enter the wallet address that you would like to mint this NFT to.\n',
      validate: wallet => (!isValidSubstrateAddress(wallet)) ?
        red(`ACCESSNFT: `) + `Invalid address` : true
    });
    wallet = responseWallet.wallet;
    console.log('');

    await mint(api, contract, wallet);

  })().catch(error => otherError());
});

// Check address.
const isValidSubstrateAddress = (wallet) => {
  try {

    encodeAddress(decodeAddress(wallet))

    // address encodes/decodes wo error => valid address
    return true

  } catch (error) {

    // encode/decode failure => invalid address
    return false
  }
}

// Check if username is available
const mint = async (api, contract, wallet)  => {
  
  try {

    // create keypair for owner
    const keyring = new Keyring({type: 'sr25519'});
    const OWNER_PAIR = keyring.addFromUri(OWNER_MNEMONIC);

    // define special type for gas weights
    type WeightV2 = InstanceType<typeof WeightV2>;
    const gasLimit = api.registry.createType('WeightV2', {
      refTime: refTimeLimit,
      proofSize: proofSizeLimit,
    }) as WeightV2;

    // get getter output
    var { gasRequired, storageDeposit, result, output } =
      await contract.query['mint'](
        OWNER_PAIR.address, {gasLimit}, wallet);

    // convert to JSON format for convenience
    const RESULT = JSON.parse(JSON.stringify(result));
    const OUTPUT = JSON.parse(JSON.stringify(output));

    // if this call reverts, then only possible error is 'credential nonexistent'
    if (RESULT.ok.flags == 'Revert') {

      // logging custom error
      let error = OUTPUT.ok.err.custom.toString().replace(/0x/, '')
      console.log(red(`ACCESSNFT: `) + error);
      process.send('error');
      process.exit();
    }

    // too much gas required?
    if (gasRequired > gasLimit) {
  
      // logging and terminate
      console.log(red(`ACCESSNFT:`) +
        ' tx aborted, gas required is greater than the acceptable gas limit.\n');
      process.send('error');
      process.exit();
    }

    // submit doer tx
    let extrinsic = await contract.tx['mint'](
      { storageDepositLimit, gasLimit }, wallet)
        .signAndSend(OWNER_PAIR, result => {

      // when tx hits block
      if (result.status.isInBlock) {

        // logging
        console.log(yellow(`ACCESSNFT:`) + ` mint tx in a block`);

      // when tx is finalized in block, tx is successful
      } else if (result.status.isFinalized) {

        // logging and terminate
        console.log(green(`ACCESSNFT:`) +
          color.bold(` mint tx successful\n`));

        (async () => {

          var choice = await prompts({
            type: 'select',
            name: 'return',
            message: 'Now choose one of the following options:',
            choices: [{ title: 'return to main menu', value: 'return' }]
          });

          process.send('done');
          process.exit();
        })();
      }
    });
  } catch (error) {

    console.log(red(`ACCESSNFT: `) + 'failed to mint\n');
    process.send('error');
    process.exit();
  }
}

// handle misc error
const otherError = () => {

  console.log(red(`ACCESSNFT: `) + 'failed to gather required information\n');
  process.send('error');
  process.exit();
}
