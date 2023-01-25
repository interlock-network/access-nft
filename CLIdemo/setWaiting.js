//
// INTERLOCK NETWORK - SET WAITING
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
var io = require('socket.io-client');
var colors = require('colors');
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
function setWaiting(message, socket) {
    return __awaiter(this, void 0, void 0, function () {
        var wsProvider, keyring, api, contract, OWNER_pair, _a, gasRequired, storageDeposit, result, output, error, extrinsic, error_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 4, , 5]);
                    // setup session
                    console.log('');
                    console.log(blue("ACCESSNFT:") +
                        " establishing setWaiting websocket connection with Aleph Zero blockchain...");
                    wsProvider = new WsProvider(WEB_SOCKET);
                    keyring = new Keyring({ type: 'sr25519' });
                    return [4 /*yield*/, ApiPromise.create({ provider: wsProvider })];
                case 1:
                    api = _b.sent();
                    console.log(blue("ACCESSNFT:") +
                        " established setWaiting websocket connection with Aleph Zero blockchain " +
                        cyan("".concat(WEB_SOCKET)));
                    console.log('');
                    contract = new ContractPromise(api, ACCESS_METADATA, ACCESS_CONTRACT);
                    OWNER_pair = keyring.addFromUri(OWNER_MNEMONIC);
                    return [4 /*yield*/, contract.query['setWaiting'](OWNER_pair.address, {}, { u64: message.id })];
                case 2:
                    _a = _b.sent(), gasRequired = _a.gasRequired, storageDeposit = _a.storageDeposit, result = _a.result, output = _a.output;
                    // too much gas required?
                    if (gasRequired > gasLimit) {
                        console.log(red("ACCESSNFT:") +
                            ' tx aborted, gas required is greater than the acceptable gas limit.');
                        socket.emit('setwaiting-failure', message.id, message.wallet);
                        socket.disconnect();
                        console.log(blue("ACCESSNFT:") +
                            " setWaiting socket disconnecting, ID " + cyan("".concat(socket.id)));
                        process.exit();
                    }
                    // did the contract revert due to any errors?
                    if (result.toHuman().Ok.flags == 'Revert') {
                        error = output.toHuman().Err;
                        console.log(red("ACCESSNFT:") +
                            " setWaiting TX reverted due to: ".concat(error));
                        socket.emit('setwaiting-failure', message.id, message.wallet);
                        socket.disconnect();
                        console.log(blue("ACCESSNFT:") +
                            " setWaiting socket disconnecting, ID " + cyan("".concat(socket.id)));
                        process.exit();
                    }
                    return [4 /*yield*/, contract.tx['setWaiting']({ storageDepositLimit: storageDepositLimit, gasLimit: gasLimit }, { u64: message.id })
                            .signAndSend(OWNER_pair, function (result) {
                            if (result.status.isInBlock) {
                                console.log('in a block');
                            }
                            else if (result.status.isFinalized) {
                                console.log(green("ACCESSNFT:") +
                                    " setWaiting successful");
                                socket.emit('awaiting-transfer', message.id, message.wallet);
                                socket.disconnect();
                                console.log(blue("ACCESSNFT:") +
                                    " setWaiting socket disconnecting, ID " + cyan("".concat(socket.id)));
                                process.exit();
                            }
                        })];
                case 3:
                    extrinsic = _b.sent();
                    return [3 /*break*/, 5];
                case 4:
                    error_1 = _b.sent();
                    console.log(red("ACCESSNFT: ") + error_1);
                    console.log(blue("ACCESSNFT:") +
                        " setAuthenticated socket disconnecting, ID " + cyan("".concat(socket.id)));
                    socket.disconnect();
                    process.exit();
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    });
}
process.on('message', function (message) {
    // setup socket connection with autheticateWallet script
    var socket = io.connect('http://localhost:3000', { reconnect: true });
    socket.on('connect', function () {
        console.log(blue("ACCESSNFT:") +
            " setWaiting socket connected, ID " + cyan("".concat(socket.id)));
        setWaiting(message, socket)["catch"](function (error) {
            console.error(error);
            process.exit(-1);
        });
    });
});
