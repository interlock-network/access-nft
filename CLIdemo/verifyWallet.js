//
// INTERLOCK NETWORK - VERIFY WALLET
// PSP34 ACCESS NFT AUTHENTICATION
//

//
// database table:
// access(NFTid integer, Wallet text, AuthAmount integer, Waiting integer)
//

// imports
const { ApiPromise, WsProvider, Keyring } = require('@polkadot/api');
const { ContractPromise, CodePromise } = require('@polkadot/api-contract');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fork = require('child_process').fork;
require('dotenv').config();

// constants
const access_metadata = require('./access_metadata.json');
const access_contract = process.env.CONTRACT_ADDRESS;
const OWNER_mnemonic = process.env.OWNER_MNEMONIC;
const TRUE = '0x74727565';
const FALSE = '0x66616c7365';
const ISAUTHENTICATED = '0x697361757468656e74696361746564';

async function main(message) {

  try {

    // setup session
		let database = new sqlite3.Database('./access.db', sqlite3.OPEN_READWRITE);
    const wsProvider = new WsProvider('wss://ws.test.azero.dev');
    const keyring = new Keyring({type: 'sr25519'});
    const api = await ApiPromise.create({ provider: wsProvider });
    const contract = new ContractPromise(api, access_metadata, access_contract);
    const OWNER_pair = keyring.addFromUri(OWNER_mnemonic);

		let queryWaiting = `SELECT Wallet wallet,
															 Waiting waiting,
           							FROM access
           							WHERE Wallet  = ?`;

    let notAuthenticated = false;
    let notAuthenticatedId;

		db.serialize(() => {
  		db.get(queryWaiting, [message.wallet], (err, row) => {
    		if (err) {
      		console.error(err.message);
    		}
  			if (row) {
					if (row.waiting == 1) {

						console.log(`ACCESSNFT:`.red.bold + ` waiting for wallet to return validation transfer`);
		        const listen = path.resolve('keepListeningForTransfer.js');
    		    const listenChild = fork(listen);

       			listenChild.send({amount: message.amount, wallet: message.wallet});

        		listenChild.on('message', message => {
          		if (message == 'wallet verified') {
            		const set = path.resolve('setAuthenticated.js');
            		const setChild = fork(set);
            		setChild.send({id: notAuthenticatedId});
            
            		setChild.on('message', message => {
              		if (message == 'nft authenticated') {
                		process.send({
                  		type: "authentication complete",
                  		wallet: message.wallet,
                  		id: notAuthenticatedId
                		});
										database.close();
                		process.exit();
              		}
								});
          		}
        		});
					}
				} else {
    			console.log(`ACCESSNFT:`.green.bold + ` wallet clear, checking for available NFTs`);
				}

});
    // get NFT collection for wallet
    let { gasRequired, storageDeposit, result, output } =
      await contract.query['ilockerCollection'](
        OWNER_pair.address, {}, message.wallet);

    // check if the call was successful
    if (result.isOk) {

      // find nft to authenticate
      const collection = JSON.parse(JSON.stringify(output));
      for (nft in collection.ok) {

        let { gasRequired, storageDeposit, result, output } =
          await contract.query['psp34Metadata::getAttribute'](
            OWNER_pair.address, {}, {u64: collection.ok[nft].u64}, ISAUTHENTICATED);
        let authenticated = JSON.parse(JSON.stringify(output));
        if (FALSE == authenticated) {
          notAuthenticated = true;
          notAuthenticatedId = collection.ok[nft].u64;
        }
      }

      // not nfts to authenticate
      if (notAuthenticated == false) {
        process.send('all nfts already authenticated')
				database.close();
        process.exit();

      // or authenticate one of the unauthenticated nfts
      } else if (notAuthenticated == true) {

        const listen = path.resolve('listenForTransfer.js');
        const listenChild = fork(listen);

        listenChild.send({amount: message.amount, wallet: message.wallet});

        listenChild.on('message', message => {
          if (message == 'wallet verified') {
            const set = path.resolve('setAuthenticated.js');
            const setChild = fork(set);
            setChild.send({id: notAuthenticatedId});
            
            setChild.on('message', message => {
              if (message == 'nft authenticated') {
                process.send({
                  type: "authentication complete",
                  wallet: message.wallet,
                  id: notAuthenticatedId
                });
								database.close();
                process.exit();
              };
            });
          };
        });
      }
    }

  } catch(error) {

    console.log(error);
    process.send('no nfts present');
		database.close();
    process.exit();
  }
}

process.on('message', message => {
  main(message).catch((error) => {
    console.error(error);
		database.close();
    process.exit(-1);
  });
});
