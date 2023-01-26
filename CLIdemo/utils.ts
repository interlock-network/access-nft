//
// INTERLOCK NETWORK - UTILITIES
// PSP34 ACCESS NFT AUTHENTICATION
//

// imports
const { ApiPromise, WsProvider, Keyring } = require('@polkadot/api');
const { ContractPromise, CodePromise } = require('@polkadot/api-contract');
var io = require('socket.io-client');
const colors = require('colors');
const path = require('path');
const fork = require('child_process').fork;
const setWaiting = path.resolve('setWaiting.js');
const { BN } = require('@polkadot/util');
const WeightV2 = require('@polkadot/types/interfaces');
require('dotenv').config();

// specify color formatting
const color = require('cli-color');
const red = color.red.bold;
const green = color.green.bold;
const blue = color.blue.bold;
const cyan = color.cyan.bold;
const yellow = color.yellow.bold;
const magenta = color.magenta.bold;

// constants
const ACCESS_METADATA = require('./access/target/ink/metadata.json');
const ACCESS_CONTRACT = process.env.ACCESS_CONTRACT;
const OWNER_MNEMONIC = process.env.OWNER_MNEMONIC;
const APP_PROCESS = process.env.APP_PROCESS;
const WEB_SOCKET = process.env.WEB_SOCKET;
const TRUE = '0x74727565';
const FALSE = '0x66616c7365';
const ISAUTHENTICATED = '0x697361757468656e74696361746564';
const ISWAITING = '0x697377616974696e67';
const AMOUNT = 1;



export async function contractGetter(
	api,
	socket,
	contract,
	method: string,
	wallet: string,
) {

    const keyring = new Keyring({type: 'sr25519'});
    const OWNER_PAIR = keyring.addFromUri(OWNER_MNEMONIC);

	    // define special type for gas weights
    type WeightV2 = InstanceType<typeof WeightV2>;
    const gasLimit = api.registry.createType('WeightV2', {
      refTime: 2**53 - 1,
      proofSize: 2**53 - 1,
    }) as WeightV2;
	console.log('test');

	socket.emit('teset');
	    // get NFT collection for wallet
    var { gasRequired, storageDeposit, result, output } =
      await contract.query[method](
        OWNER_PAIR.address, {gasLimit}, wallet);
}
