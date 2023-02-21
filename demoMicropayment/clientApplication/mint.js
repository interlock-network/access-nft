"use strict";
//
// INTERLOCK NETWORK & ALEPH ZERO
// PSP34 UNIVERSAL ACCESS NFT - CLIENT MINT
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
// specify color formatting
var color = require("cli-color");
var red = color.red.bold;
var green = color.green.bold;
var blue = color.blue.bold;
var cyan = color.cyan;
var yellow = color.yellow.bold;
var magenta = color.magenta;
// utility functions
var utils_1 = require("./utils");
// constants
var WALLET = JSON.parse((0, fs_1.readFileSync)('.wallet.json').toString());
var CLIENT_MNEMONIC = WALLET.CLIENT_MNEMONIC;
var CLIENT_ADDRESS = WALLET.CLIENT_ADDRESS;
var OWNER_ADDRESS = process.env.OWNER_ADDRESS;
// setup socket connection with autheticateWallet script
var socket = (0, socket_io_client_1.io)('http://localhost:3000');
socket.on('connect', function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                console.log(blue("\nUA-NFT") + color.bold("|CLIENT-APP: ") +
                    "demoApp connect, SID " + cyan("".concat(socket.id, "\n")));
                // confirm mint process begining
                return [4 /*yield*/, (function () { return __awaiter(void 0, void 0, void 0, function () {
                        var responseChoice, choice;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, prompts({
                                        type: 'confirm',
                                        name: 'choice',
                                        message: "Proceed minting a universal access NFT to your account\n" +
                                            color.bold.magenta("".concat(CLIENT_ADDRESS)) + " ?"
                                    }, { onCancel: utils_1.onCancel })];
                                case 1:
                                    responseChoice = _a.sent();
                                    choice = responseChoice.choice;
                                    console.log('');
                                    // if cancel, exit
                                    if (choice == false) {
                                        process.send('done');
                                        process.exit();
                                    }
                                    socket.emit('mint-nft', [CLIENT_ADDRESS]);
                                    return [2 /*return*/];
                            }
                        });
                    }); })()];
            case 1:
                // confirm mint process begining
                _a.sent();
                return [2 /*return*/];
        }
    });
}); });
socket.onAny(function (message) {
    var args = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        args[_i - 1] = arguments[_i];
    }
    return __awaiter(void 0, void 0, void 0, function () {
        var price_1, adjustedPrice_1, price, adjustedPrice, nftId;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!(message == 'pay-to-mint')) return [3 /*break*/, 2];
                    price_1 = args[0][0];
                    adjustedPrice_1 = price_1 / 1000000000000;
                    console.log(red("UA-NFT") + color.bold("|CLIENT-APP: ") +
                        color.bold("Server is waiting on your payment.\n"));
                    console.log(yellow("UA-NFT") + color.bold("|CLIENT-APP: ") +
                        color.bold("The current price of one universal access NFT"));
                    console.log(yellow("UA-NFT") + color.bold("|CLIENT-APP: ") +
                        color.bold("to our restricted area is ") + red("".concat(adjustedPrice_1, " TZERO\n")));
                    console.log(yellow("UA-NFT") + color.bold("|CLIENT-APP: ") +
                        color.bold("Do you still wish to proceed, to purchase and"));
                    console.log(yellow("UA-NFT") + color.bold("|CLIENT-APP: ") +
                        color.bold("transfer") + red(" ".concat(adjustedPrice_1, " TZERO ")) +
                        color.bold("to NFT contract owner's account"));
                    console.log(yellow("UA-NFT") + color.bold("|CLIENT-APP: ") +
                        color.bold.magenta("".concat(OWNER_ADDRESS)) + color.bold(" ?\n"));
                    // verify mint intention, at given price
                    return [4 /*yield*/, (function () { return __awaiter(void 0, void 0, void 0, function () {
                            var choice, _a, api, contract, keyring, CLIENT_PAIR, transfer, hash;
                            return __generator(this, function (_b) {
                                switch (_b.label) {
                                    case 0: return [4 /*yield*/, prompts({
                                            type: 'select',
                                            name: 'return',
                                            message: 'Please confirm:',
                                            choices: [
                                                { title: "YES, transfer ".concat(adjustedPrice_1, " TZERO to mint my NFT.\n"), value: 'mint' },
                                                { title: 'NO, I do not wish to purchase an NFT for this price.\n', value: 'cancel' },
                                            ]
                                        }, { onCancel: utils_1.onCancel })];
                                    case 1:
                                        choice = _b.sent();
                                        if (choice["return"] == 'cancel') {
                                            process.send('done');
                                            process.exit();
                                        }
                                        if (!(choice["return"] == 'mint')) return [3 /*break*/, 4];
                                        return [4 /*yield*/, (0, utils_1.setupSession)('mint')];
                                    case 2:
                                        _a = _b.sent(), api = _a[0], contract = _a[1];
                                        keyring = new Keyring({ type: 'sr25519' });
                                        CLIENT_PAIR = keyring.addFromUri(CLIENT_MNEMONIC);
                                        transfer = api.tx.balances.transfer(OWNER_ADDRESS, price_1);
                                        return [4 /*yield*/, transfer.signAndSend(CLIENT_PAIR)];
                                    case 3:
                                        hash = _b.sent();
                                        console.log(green("UA-NFT") + color.bold("|CLIENT-APP: ") +
                                            color.bold("Transfer transaction finalized."));
                                        console.log(green("UA-NFT") + color.bold("|CLIENT-APP: ") +
                                            color.bold("Transaction hash for record: "));
                                        console.log(color.yellow("".concat(hash, "\n")));
                                        _b.label = 4;
                                    case 4: return [2 /*return*/];
                                }
                            });
                        }); })()];
                case 1:
                    // verify mint intention, at given price
                    _a.sent();
                    return [3 /*break*/, 5];
                case 2:
                    if (!(message == 'minting-nft')) return [3 /*break*/, 3];
                    price = args[0][0];
                    adjustedPrice = price / 1000000000000;
                    // minting tx is in progress
                    console.log(green("UA-NFT") + color.bold("|CLIENT-APP: ") +
                        color.bold("Payment received!!!") +
                        red(" ".concat(adjustedPrice, " TZERO")));
                    console.log(yellow("UA-NFT") + color.bold("|CLIENT-APP: ") +
                        color.bold("Please stand by while we mint your NFT...\n"));
                    return [3 /*break*/, 5];
                case 3:
                    if (!(message == 'mint-complete')) return [3 /*break*/, 5];
                    nftId = args[0][0].u64;
                    // success
                    console.log(green("\n\nUA-NFT") + color.bold("|CLIENT-APP: ") +
                        color.bold("Universal Access NFT successfully minted!!!"));
                    console.log(green("UA-NFT") + color.bold("|CLIENT-APP: ") +
                        color.bold("Your new Universal Access NFT is ") +
                        red("ID ".concat(nftId)) + color.bold("!\n"));
                    console.log(color.bold.magenta("\n\nUA-NFT") + color.bold("|CLIENT-APP: ") +
                        color.bold("Check out your collection to see NFT status.\n"));
                    return [4 /*yield*/, (0, utils_1.returnToMain)('return to main menu to authenticate or display NFT')];
                case 4:
                    _a.sent();
                    _a.label = 5;
                case 5: return [2 /*return*/];
            }
        });
    });
});
