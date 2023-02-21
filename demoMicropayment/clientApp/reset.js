"use strict";
//
// INTERLOCK NETWORK & ALEPH ZERO
// PSP34 UNIVERSAL ACCESS NFT - CLIENT RESET
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
exports.__esModule = true;
// imports (anything polkadot with node-js must be required)
var _a = require('@polkadot/api'), ApiPromise = _a.ApiPromise, WsProvider = _a.WsProvider, Keyring = _a.Keyring;
var _b = require('@polkadot/api-contract'), ContractPromise = _b.ContractPromise, CodePromise = _b.CodePromise;
var _c = require('@polkadot/keyring'), decodeAddress = _c.decodeAddress, encodeAddress = _c.encodeAddress;
var WeightV2 = require('@polkadot/types/interfaces');
// imports
var socket_io_client_1 = require("socket.io-client");
var fs_1 = require("fs");
var prompts = require("prompts");
// environment constants
var dotenv = require("dotenv");
dotenv.config();
// utility functions
var utils_1 = require("./utils");
// specify color formatting
var color = require("cli-color");
var red = color.red.bold;
var green = color.green.bold;
var blue = color.blue.bold;
var cyan = color.cyan;
var yellow = color.yellow.bold;
var magenta = color.magenta;
// constants
var OWNER_MNEMONIC = process.env.OWNER_MNEMONIC;
var ISAUTHENTICATED = '0x697361757468656e74696361746564';
var TRUE = '0x74727565';
var WALLET = JSON.parse((0, fs_1.readFileSync)('.wallet.json').toString());
var CLIENT_MNEMONIC = WALLET.CLIENT_MNEMONIC;
var CLIENT_ADDRESS = WALLET.CLIENT_ADDRESS;
// constants
//
// null === no limit
// refTime and proofSize determined by contracts-ui estimation plus fudge-factor
var refTimeLimit = 12000000000;
var proofSizeLimit = 150000;
var storageDepositLimit = null;
// setup socket connection with autheticateWallet script
var socket = (0, socket_io_client_1.io)('http://localhost:3000');
socket.on('connect', function () { return __awaiter(void 0, void 0, void 0, function () {
    var _a, api, contract, _b, gasRequired, storageDeposit, RESULT_collection, OUTPUT_collection, collection, nfts, nft, reset, _i, nfts_1, _c, gasRequired, storageDeposit, RESULT_authenticated, OUTPUT_authenticated, authenticated;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                console.log('');
                return [4 /*yield*/, (0, utils_1.setupSession)('setAuthenticated')];
            case 1:
                _a = _d.sent(), api = _a[0], contract = _a[1];
                console.log(green("UA-NFT") + color.bold("|CLIENT-APP: ") +
                    color.bold("In order to reset your universal access"));
                console.log(green("UA-NFT") + color.bold("|CLIENT-APP: ") +
                    color.bold("NFT credentials, you MUST know the NFT ID.\n"));
                console.log(green("UA-NFT") + color.bold("|CLIENT-APP: ") +
                    color.bold("Resetting credentials is a two step process:"));
                console.log(green("UA-NFT") + color.bold("|CLIENT-APP: ") +
                    color.bold("Step 1 - Reset your universal access NFT here."));
                console.log(green("UA-NFT") + color.bold("|CLIENT-APP: ") +
                    color.bold("Step 2 - Repeat authenticate/registration.\n\n"));
                return [4 /*yield*/, (0, utils_1.hasCollection)(api, contract, CLIENT_ADDRESS)];
            case 2:
                if (!!(_d.sent())) return [3 /*break*/, 4];
                console.log(red("UA-NFT") + color.bold("|CLIENT-APP: ") +
                    color.bold("This CLIENT_ADDRESS has no universal access NFT collection. ") +
                    color.bold("Please return to main menu to mint.\n"));
                // if no collection propmt to return to main menu
                return [4 /*yield*/, (0, utils_1.returnToMain)('return to main to restart the reset process with the correct CLIENT_ADDRESS')];
            case 3:
                // if no collection propmt to return to main menu
                _d.sent();
                _d.label = 4;
            case 4: return [4 /*yield*/, (0, utils_1.contractGetter)(api, socket, contract, 'Authenticate', 'getCollection', CLIENT_ADDRESS)];
            case 5:
                _b = _d.sent(), gasRequired = _b[0], storageDeposit = _b[1], RESULT_collection = _b[2], OUTPUT_collection = _b[3];
                collection = JSON.parse(JSON.stringify(OUTPUT_collection));
                nfts = Array.from(collection.ok.ok);
                // print table of NFTs and their authentication status
                console.log(color.bold("AVAILABLE NFTs TO RESET\n"));
                reset = [];
                _i = 0, nfts_1 = nfts;
                _d.label = 6;
            case 6:
                if (!(_i < nfts_1.length)) return [3 /*break*/, 9];
                nft = nfts_1[_i];
                return [4 /*yield*/, (0, utils_1.contractGetter)(api, socket, contract, 'Authenticate', 'psp34Metadata::getAttribute', { u64: nft.u64 }, ISAUTHENTICATED)];
            case 7:
                _c = _d.sent(), gasRequired = _c[0], storageDeposit = _c[1], RESULT_authenticated = _c[2], OUTPUT_authenticated = _c[3];
                authenticated = JSON.parse(JSON.stringify(OUTPUT_authenticated));
                // record nft id of one that is waiting and ready to authenticate
                if (authenticated.ok == TRUE) {
                    console.log(green("\t".concat(nft.u64, "\n")));
                    reset.push(nft.u64);
                }
                _d.label = 8;
            case 8:
                _i++;
                return [3 /*break*/, 6];
            case 9:
                if (!(reset.length == 0)) return [3 /*break*/, 11];
                console.log(red("UA-NFT") + color.bold("|CLIENT-APP: ") +
                    color.bold("This collection has no universal access."));
                console.log(red("UA-NFT") + color.bold("|CLIENT-APP: ") +
                    color.bold("NFTs available to reset."));
                console.log(red("UA-NFT") + color.bold("|CLIENT-APP: ") +
                    color.bold("They are all not authenticated.\n"));
                // if no collection propmt to return to main menu
                return [4 /*yield*/, (0, utils_1.returnToMain)('return to main menu to mint or authenticate NFTs')];
            case 10:
                // if no collection propmt to return to main menu
                _d.sent();
                _d.label = 11;
            case 11: 
            // second prompt, get NFT ID
            return [4 /*yield*/, (function () { return __awaiter(void 0, void 0, void 0, function () {
                    var responseId, id, keyring, CLIENT_PAIR, gasLimit, extrinsic;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, prompts({
                                    type: 'number',
                                    name: 'id',
                                    message: 'Now, enter the ID of the NFT credentials you would like to reset.\n',
                                    validate: function (id) { return !reset.includes(id) ?
                                        red("UA-NFT") + color.bold("|CLIENT-APP: ") + "Not a NFT you can reset right now." : true; }
                                }, { onCancel: utils_1.onCancel })];
                            case 1:
                                responseId = _a.sent();
                                id = responseId.id;
                                console.log('');
                                if (!(id != undefined)) return [3 /*break*/, 3];
                                keyring = new Keyring({ type: 'sr25519' });
                                CLIENT_PAIR = keyring.addFromUri(CLIENT_MNEMONIC);
                                gasLimit = api.registry.createType('WeightV2', {
                                    refTime: refTimeLimit,
                                    proofSize: proofSizeLimit
                                });
                                // too much gas required?
                                if (1 /* gasRequired*/ > gasLimit) { // need to fix dry run.
                                    // logging and terminate
                                    console.log(red("UA-NFT") + color.bold("|CLIENT-APP: ") +
                                        'gas needed is more than limit.');
                                }
                                return [4 /*yield*/, contract.tx['psp34::transfer']({ storageDepositLimit: storageDepositLimit, gasLimit: gasLimit }, CLIENT_ADDRESS, { u64: id }, [0])
                                        .signAndSend(CLIENT_PAIR, function (result) { return __awaiter(void 0, void 0, void 0, function () {
                                        return __generator(this, function (_a) {
                                            switch (_a.label) {
                                                case 0:
                                                    if (!result.status.isInBlock) return [3 /*break*/, 1];
                                                    // logging
                                                    console.log(yellow("UA-NFT") + color.bold("|CLIENT-APP: ") + "NFT reset in a block");
                                                    return [3 /*break*/, 3];
                                                case 1:
                                                    if (!result.status.isFinalized) return [3 /*break*/, 3];
                                                    // logging and terminate
                                                    console.log(green("UA-NFT") + color.bold("|CLIENT-APP: ") +
                                                        color.bold("NFT reset successful\n"));
                                                    console.log(color.bold.magenta("UA-NFT") + color.bold("|CLIENT-APP: ") +
                                                        color.bold("To create new credentials for universal access"));
                                                    console.log(color.bold.magenta("UA-NFT") + color.bold("|CLIENT-APP: ") +
                                                        color.bold("NFT ") + red("ID ".concat(id, " ")) +
                                                        color.bold("you must reauthenticate and register.\n"));
                                                    return [4 /*yield*/, (0, utils_1.returnToMain)('return to main menu to reregister NFT ' + red("ID ".concat(id)))];
                                                case 2:
                                                    _a.sent();
                                                    _a.label = 3;
                                                case 3: return [2 /*return*/];
                                            }
                                        });
                                    }); })];
                            case 2:
                                extrinsic = _a.sent();
                                _a.label = 3;
                            case 3: return [2 /*return*/];
                        }
                    });
                }); })()];
            case 12:
                // second prompt, get NFT ID
                _d.sent();
                return [2 /*return*/];
        }
    });
}); });
