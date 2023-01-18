//
// INTERLOCK NETWORK - LISTEN FOR TRANSFER
// PSP34 ACCESS NFT AUTHENTICATION
//

// imports
const colors = require('colors');
const { ApiPromise, WsProvider, Keyring } = require('@polkadot/api');
const { ContractPromise, CodePromise } = require('@polkadot/api-contract');
require('dotenv').config();

// constants
const OWNER_mnemonic = process.env.OWNER_MNEMONIC;
const OWNER_address = process.env.OWNER_ADDRESS;
const metadata = require('./access_metadata.json');

async function main(message) {

  // establish connection with blockchain
  console.log('');
  const wsProvider = new WsProvider('wss://ws.test.azero.dev');
  const api = await ApiPromise.create({ provider: wsProvider });
  console.log('');

  // create signing keypair
  const keyring = new Keyring({type: 'sr25519'});
  const OWNER_pair = keyring.addFromUri(OWNER_mnemonic);

  // Subscribe to system events via storage
  api.query.system.events((events) => {

    // Loop through the Vec<EventRecord>
    events.forEach((record) => {

      // Extract the phase, event and the event types
      const { event, phase } = record;
      const types = event.typeDef;
      if (event.method == 'Transfer') {

        // check for verification transfers
	//
	// from Interlock
        if ( event.data[0] == OWNER_address &&
          event.data[1] == message.wallet) {
          console.log(`ACCESSNFT:`.green.bold + ' authentication transfer complete');
          console.log(`ACCESSNFT:`.yellow.bold + ' waiting on returning verification transfer');
        //
        // from wallet holder
        } else if ( event.data[0] == message.wallet &&
          event.data[1] == OWNER_address){
          console.log(`ACCESSNFT:`.green.bold + ' verification transfer complete');
          console.log(`ACCESSNFT:`.green.bold + ' wallet verified');
          process.send('wallet verified');
          process.exit();
        }
      }
    });
  });

  // create transfer object
  const transfer = api.tx.balances.transfer(message.wallet, message.amount);

  // Sign and send the transaction using our account
  const hash = await transfer.signAndSend(OWNER_pair);

  console.log(`ACCESSNFT:`.yellow.bold + `authentication transfer sent: ${hash.toHex()}`);
}

process.on('message', message => {
  main(message).catch((error) => {
    console.error(error);
    process.exit(-1);
  });
});
