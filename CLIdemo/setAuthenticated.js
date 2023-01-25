//
// INTERLOCK NETWORK - SET AUTHENTICATED
// PSP34 ACCESS NFT AUTHENTICATION
//
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
// imports
var colors = require('colors');
var io = require('socket.io-client');
var _a = require('@polkadot/api'), ApiPromise = _a.ApiPromise, WsProvider = _a.WsProvider, Keyring = _a.Keyring;
var _b = require('@polkadot/api-contract'), ContractPromise = _b.ContractPromise, CodePromise = _b.CodePromise;
require('dotenv').config();
// specify color formatting
var color = require('cli-color');
var red = color.red.bold;
var green = color.green.bold;
var blue = color.blue.bold;
var cyan = color.cyan.bold;
var yellow = color.yellow.bold;
var magenta = color.magenta.bold;
// constants
var ACCESS_METADATA = require(process.env.ACCESS_METADATA);
var ACCESS_CONTRACT = process.env.ACCESS_CONTRACT;
var OWNER_MNEMONIC = process.env.OWNER_MNEMONIC;
var WEB_SOCKET = process.env.WEB_SOCKET;
// constants
var MEG = 1000000;
var gasLimit = 100000 * MEG;
var storageDepositLimit = null;
function setAuthenticated(message, socket) {
    return __awaiter(this, void 0, void 0, function () {
        var wsProvider, keyring, api, contract, OWNER_PAIR, _a, gasRequired, storageDeposit, result, output, collection, _b, _c, _i, _d, gasRequired_1, storageDeposit_1, result_1, output_1, waiting, _e, gasRequired_2, storageDeposit_2, result_2, output_2, error, extrinsic, error_1;
        return __generator(this, function (_f) {
            switch (_f.label) {
                case 0:
                    _f.trys.push([0, 11, , 12]);
                    // setup session
                    console.log('');
                    console.log(blue("ACCESSNFT:").blue.bold +
                        " establishing setAuthenticated websocket connection with Aleph Zero blockchain...");
                    wsProvider = new WsProvider(WEB_SOCKET);
                    keyring = new Keyring({ type: 'sr25519' });
                    return [4 /*yield*/, ApiPromise.create({ provider: wsProvider })];
                case 1:
                    api = _f.sent();
                    console.log(blue("ACCESSNFT:").blue.bold +
                        " established setAuthenticated websocket connection with Aleph Zero blockchain " +
                        cyan("".concat(WEB_SOCKET)).cyan.bold);
                    console.log('');
                    contract = new ContractPromise(api, ACCESS_METADATA, ACCESS_CONTRACT);
                    OWNER_PAIR = keyring.addFromUri(OWNER_MNEMONIC);
                    return [4 /*yield*/, contract.query['ilockerCollection'](OWNER_PAIR.address, {}, message.wallet)];
                case 2:
                    _a = _f.sent(), gasRequired = _a.gasRequired, storageDeposit = _a.storageDeposit, result = _a.result, output = _a.output;
                    console.log(result);
                    if (!result.isOk) return [3 /*break*/, 9];
                    collection = JSON.parse(JSON.stringify(output));
                    _b = [];
                    for (_c in collection.ok)
                        _b.push(_c);
                    _i = 0;
                    _f.label = 3;
                case 3:
                    if (!(_i < _b.length)) return [3 /*break*/, 8];
                    nft = _b[_i];
                    return [4 /*yield*/, contract.query['psp34Metadata::getAttribute'](OWNER_PAIR.address, {}, { u64: collection.ok[nft].u64 }, ISWAITING)];
                case 4:
                    _d = _f.sent(), gasRequired_1 = _d.gasRequired, storageDeposit_1 = _d.storageDeposit, result_1 = _d.result, output_1 = _d.output;
                    waiting = JSON.parse(JSON.stringify(output_1));
                    if (!(waiting == TRUE)) return [3 /*break*/, 7];
                    notAuthenticatedId = collection.ok[nft].u64;
                    return [4 /*yield*/, contract.query['setAuthenticated'](OWNER_PAIR.address, {}, { u64: notAuthenticatedId })];
                case 5:
                    _e = _f.sent(), gasRequired_2 = _e.gasRequired, storageDeposit_2 = _e.storageDeposit, result_2 = _e.result, output_2 = _e.output;
                    // too much gas required?
                    if (gasRequired_2 > gasLimit) {
                        console.log(red("ACCESSNFT:").red.bold +
                            ' tx aborted, gas required is greater than the acceptable gas limit.');
                        socket.emit('setauthenticated-failure', notAuthenticatedId, message.wallet);
                        socket.disconnect();
                        console.log(blue("ACCESSNFT:").blue.bold +
                            " setAuthenticated socket disconnecting, ID " + cyan("".concat(socket.id)).cyan.bold);
                        process.exit();
                    }
                    // did the contract revert due to any errors?
                    if (result_2.toHuman().Ok.flags == 'Revert') {
                        error = output_2.toHuman().Err;
                        console.log(red("ACCESSNFT:").red.bold +
                            " setAuthenticated TX reverted due to: ".concat(error));
                        socket.emit('setauthenticated-failure', notAuthenticatedId, message.wallet);
                        console.log(blue("ACCESSNFT:").blue.bold +
                            " setAuthenticated socket disconnecting, ID " + cyan("".concat(socket.id)).cyan.bold);
                        socket.disconnect();
                        process.exit();
                    }
                    return [4 /*yield*/, contract.tx['setAuthenticated']({ storageDepositLimit: storageDepositLimit, gasLimit: gasLimit }, { u64: notAuthenticatedId })
                            .signAndSend(OWNER_PAIR, function (result) {
                            if (result.status.isInBlock) {
                                console.log('in a block');
                            }
                            else if (result.status.isFinalized) {
                                console.log(green("ACCESSNFT:").green.bold +
                                    " NFT ID " + "".concat(id).magenta.bold +
                                    " successfully authenticated for wallet " + magenta("".concat(message.wallet)).magenta.bold);
                                socket.emit('nft-authenticated', notAuthenticatedId, messsage.wallet);
                                socket.disconnect();
                                console.log(blue("ACCESSNFT:").blue.bold +
                                    " setAuthenticated socket disconnecting, ID " + cyan("".concat(socket.id)).cyan.bold);
                                process.exit();
                            }
                        })];
                case 6:
                    extrinsic = _f.sent();
                    _f.label = 7;
                case 7:
                    _i++;
                    return [3 /*break*/, 3];
                case 8: return [3 /*break*/, 10];
                case 9:
                    // no nfts present
                    console.log(red("ACCESSNFT:").red.bold +
                        " no nfts present for wallet " + "".concat(message.wallet).magenta.bold);
                    socket.emit('no-nfts', message.wallet);
                    console.log(blue("ACCESSNFT:").blue.bold +
                        " setAuthenticated socket disconnecting, ID " + cyan("".concat(socket.id)).cyan.bold);
                    socket.disconnect();
                    process.exit();
                    _f.label = 10;
                case 10: return [3 /*break*/, 12];
                case 11:
                    error_1 = _f.sent();
                    console.log(red("ACCESSNFT: ").red.bold + error_1);
                    console.log(blue("ACCESSNFT:").blue.bold +
                        " setAuthenticated socket disconnecting, ID " + cyan("".concat(socket.id)).cyan.bold);
                    socket.disconnect();
                    process.exit();
                    return [3 /*break*/, 12];
                case 12: return [2 /*return*/];
            }
        });
    });
}
process.on('message', function (message) {
    // setup socket connection with autheticateWallet script
    var socket = io.connect('http://localhost:3000', { reconnect: true });
    socket.on('connect', function () {
        console.log(blue("ACCESSNFT:").blue.bold +
            " setAuthenticated socket connected, ID " + cyan("".concat(socket.id)).cyan.bold);
        setAuthenticated(message, socket)["catch"](function (error) {
            console.error(error);
            process.exit(-1);
        });
    });
});
