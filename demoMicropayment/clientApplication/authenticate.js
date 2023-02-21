"use strict";
//
// INTERLOCK NETWORK & ALEPH ZERO
// PSP34 UNIVERSAL ACCESS NFT - CLIENT AUTHENTICATE
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
var WeightV2 = require('@polkadot/types/interfaces');
// imports
var socket_io_client_1 = require("socket.io-client");
var fs_1 = require("fs");
var prompts = require("prompts");
// environment constants
var dotenv = require("dotenv");
dotenv.config();
// child process paths
var path = require("path");
var menu = path.resolve('main.js');
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
var WALLET = JSON.parse((0, fs_1.readFileSync)('.wallet.json').toString());
var CLIENT_MNEMONIC = WALLET.CLIENT_MNEMONIC;
var CLIENT_ADDRESS = WALLET.CLIENT_ADDRESS;
var OWNER_ADDRESS = process.env.OWNER_ADDRESS;
var username;
var password;
var passwordVerify;
// setup socket connection with autheticateWallet script
var socket = (0, socket_io_client_1.io)('http://localhost:3000');
socket.on('connect', function () { return __awaiter(void 0, void 0, void 0, function () {
    var _a, api, contract;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                console.log(blue("\nUA-NFT") + color.bold("|CLIENT-APP: ") +
                    color.bold("demoApp, SID" + cyan(" ".concat(socket.id))));
                console.log(blue("UA-NFT") + color.bold("|CLIENT-APP: ") +
                    color.bold("connected to the secure registration server.\n"));
                return [4 /*yield*/, (0, utils_1.setupSession)('setAuthenticated')];
            case 1:
                _a = _b.sent(), api = _a[0], contract = _a[1];
                return [4 /*yield*/, (0, utils_1.hasCollection)(api, contract, CLIENT_ADDRESS)];
            case 2:
                if (!!(_b.sent())) return [3 /*break*/, 4];
                console.log(red("UA-NFT") + color.bold("|CLIENT-APP: ") +
                    color.bold("Your have no universal access NFTs."));
                console.log(red("UA-NFT") + color.bold("|CLIENT-APP: ") +
                    color.bold("Please return to main menu to mint.\n"));
                // if no collection propmt to return to main menu      
                return [4 /*yield*/, (0, utils_1.returnToMain)('goto main menu to mint universal access NFT')];
            case 3:
                // if no collection propmt to return to main menu      
                _b.sent();
                _b.label = 4;
            case 4: 
            // second prompt: username
            return [4 /*yield*/, (function () { return __awaiter(void 0, void 0, void 0, function () {
                    var isAvailable, responseUsername;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                console.clear();
                                console.log(red("\n\nUA-NFT") + color.bold("|CLIENT-APP: ") +
                                    color.bold("!!! WARNING !!!\n"));
                                console.log(red("UA-NFT") + color.bold("|CLIENT-APP: ") +
                                    color.bold("Because your credentials are anonymized, "));
                                console.log(red("UA-NFT") + color.bold("|CLIENT-APP: ") +
                                    color.bold("it is impossible for us to reveal your"));
                                console.log(red("UA-NFT") + color.bold("|CLIENT-APP: ") +
                                    color.bold("username or password if you forget.\n"));
                                console.log(red("UA-NFT") + color.bold("|CLIENT-APP: ") +
                                    color.bold("If you forget your username or password, you"));
                                console.log(red("UA-NFT") + color.bold("|CLIENT-APP: ") +
                                    color.bold("must repeat this registration process with"));
                                console.log(red("UA-NFT") + color.bold("|CLIENT-APP: ") +
                                    color.bold("a DIFFERENT username.\n"));
                                console.log(red("UA-NFT") + color.bold("|CLIENT-APP: ") +
                                    color.bold("(This is the only way we can ensure access"));
                                console.log(red("UA-NFT") + color.bold("|CLIENT-APP: ") +
                                    color.bold("credentials are anonymized and secure in a"));
                                console.log(red("UA-NFT") + color.bold("|CLIENT-APP: ") +
                                    color.bold("transparent blockchain environment.)\n"));
                                console.log(red("UA-NFT") + color.bold("|CLIENT-APP: ") +
                                    color.bold("Maybe WRITE THEM DOWN somewhere...?\n"));
                                console.log(color.bold.magenta("UA-NFT") + color.bold("|CLIENT-APP: ") +
                                    color.bold("CREDENTIALS ARE NEVER STORED IN A DATABASE."));
                                console.log(color.bold.magenta("UA-NFT") + color.bold("|CLIENT-APP: ") +
                                    color.bold("THEY ARE ANONYMIZED & STORED ON BLOCKCHAIN.\n\n"));
                                isAvailable = false;
                                _a.label = 1;
                            case 1:
                                if (!(isAvailable == false)) return [3 /*break*/, 4];
                                return [4 /*yield*/, prompts({
                                        type: 'text',
                                        name: 'username',
                                        message: 'Please choose username, 5+ characters of any type but no space.\n',
                                        validate: function (username) { return !isValidUsername(username) ?
                                            red("UA-NFT") + color.bold("|CLIENT-APP: ") + "Too short / contains spaces." : true; }
                                    }, { onCancel: utils_1.onCancel })];
                            case 2:
                                responseUsername = _a.sent();
                                username = responseUsername.username;
                                console.log('');
                                return [4 /*yield*/, isAvailableUsername(api, contract, (0, utils_1.getHash)(username))];
                            case 3:
                                // if valid, check if username is available
                                if (_a.sent()) {
                                    // break the prompt loop
                                    isAvailable = true;
                                }
                                else {
                                    console.log(red("UA-NFT") + color.bold("|CLIENT-APP: ") +
                                        color.bold("Username taken. Choose different username.\n"));
                                }
                                return [3 /*break*/, 1];
                            case 4:
                                // third prompt: password
                                (function () { return __awaiter(void 0, void 0, void 0, function () {
                                    var responsePassword;
                                    var _a, _b;
                                    return __generator(this, function (_c) {
                                        switch (_c.label) {
                                            case 0: return [4 /*yield*/, prompts([
                                                    {
                                                        type: 'password',
                                                        name: 'password',
                                                        message: 'Please choose password with 8+ characters.\n  Whitespace ok, no length limit.\n',
                                                        validate: function (password) { return (password.length < 8) ?
                                                            red("UA-NFT") + color.bold("|CLIENT-APP: ") + color.bold("Password too short.\n") : true; }
                                                    },
                                                    {
                                                        type: 'password',
                                                        name: 'passwordVerify',
                                                        message: 'Please verify your password.\n'
                                                    }
                                                ], { onCancel: utils_1.onCancel })];
                                            case 1:
                                                responsePassword = _c.sent();
                                                passwordVerify = (_a = responsePassword.passwordVerify) !== null && _a !== void 0 ? _a : 'passwordVerify';
                                                password = (_b = responsePassword.password) !== null && _b !== void 0 ? _b : 'password';
                                                console.log('');
                                                if (password != passwordVerify) {
                                                    console.log(red("UA-NFT") + color.bold("|CLIENT-APP: ") + color.bold("Password mismatch.\n"));
                                                }
                                                _c.label = 2;
                                            case 2:
                                                if (password != passwordVerify) return [3 /*break*/, 0];
                                                _c.label = 3;
                                            case 3:
                                                console.log(green("UA-NFT") + color.bold("|CLIENT-APP: ") +
                                                    color.bold("You successfully entered new credentials."));
                                                console.log(yellow("UA-NFT") + color.bold("|CLIENT-APP: ") +
                                                    color.bold("Wait while we transfer a micropayment of"));
                                                console.log(yellow("UA-NFT") + color.bold("|CLIENT-APP: ") +
                                                    color.bold("1 pico TZERO to your address.\n"));
                                                socket.emit('authenticate-nft', [CLIENT_ADDRESS, (0, utils_1.getHash)(username), (0, utils_1.getHash)(password)]);
                                                return [2 /*return*/];
                                        }
                                    });
                                }); })()["catch"](function (error) { return otherError(); });
                                return [2 /*return*/];
                        }
                    });
                }); })()["catch"](function (error) { return otherError(); })];
            case 5:
                // second prompt: username
                _b.sent();
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
        var nftId, transactionHash, nftId, nftId, nftId, nftId, userhash, passhash;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!(message == 'return-transfer-waiting')) return [3 /*break*/, 2];
                    nftId = args[0][0];
                    transactionHash = args[0][1];
                    console.log(green("UA-NFT") + color.bold("|CLIENT-APP: ") +
                        color.bold("We transfered a verification micropayment of"));
                    console.log(green("UA-NFT") + color.bold("|CLIENT-APP: ") +
                        color.bold("1 pico TZERO to your address at"));
                    console.log(green("UA-NFT") + color.bold("|CLIENT-APP: ") +
                        magenta("".concat(CLIENT_ADDRESS) + "\n"));
                    console.log(yellow("UA-NFT") + color.bold("|CLIENT-APP: ") +
                        color.bold("You may confirm this via transaction hash"));
                    console.log(color.yellow("0x".concat(transactionHash, "\n")));
                    console.log(green("UA-NFT") + color.bold("|CLIENT-APP: ") +
                        color.bold("Please return 1 pico TZERO to fully"));
                    console.log(green("UA-NFT") + color.bold("|CLIENT-APP: ") +
                        color.bold("authenticate universal access NFT ") +
                        red("ID ".concat(nftId)) + color.bold(" to"));
                    console.log(green("UA-NFT") + color.bold("|CLIENT-APP: ") +
                        magenta("".concat(OWNER_ADDRESS, "\n")));
                    console.log(red("UA-NFT") + color.bold("|CLIENT-APP: ") +
                        color.bold("The purpose of this is to make sure you actually"));
                    console.log(red("UA-NFT") + color.bold("|CLIENT-APP: ") +
                        color.bold("own the address (and NFT) you claim.\n"));
                    // authorize micropayment?
                    return [4 /*yield*/, (function () { return __awaiter(void 0, void 0, void 0, function () {
                            var responseChoice, choice, _a, api, contract;
                            return __generator(this, function (_b) {
                                switch (_b.label) {
                                    case 0: return [4 /*yield*/, prompts({
                                            type: 'confirm',
                                            name: 'choice',
                                            message: 'Do you authorize this application to transfer\n  1 pico TZERO for verification purposes?'
                                        }, { onCancel: utils_1.onCancel })];
                                    case 1:
                                        responseChoice = _b.sent();
                                        choice = responseChoice.choice;
                                        console.log('');
                                        if (choice == false) {
                                            console.clear();
                                            console.log(red("\n ABORTING REGISTRATION.\n"));
                                            console.log(red(" WE NEED YOU TO RETURN THE VERIFICATION "));
                                            console.log(red(" MICROPAYMENT BEFORE REGISTERING A DIFFERENT NFT."));
                                            console.log(red(" REPEAT THE REGISTRATION PROCESS WHEN READY."));
                                            console.log(red(" YOU MAY CHOOSE A DIFFERENT USERNAME"));
                                            console.log(red(" AND PASSWORD IF YOU PLEASE."));
                                            setTimeout(function () {
                                                process.send('done');
                                                process.exit();
                                            }, 7500);
                                        }
                                        if (!(choice == true)) return [3 /*break*/, 4];
                                        return [4 /*yield*/, (0, utils_1.setupSession)('authenticated')];
                                    case 2:
                                        _a = _b.sent(), api = _a[0], contract = _a[1];
                                        return [4 /*yield*/, transferMicropayment(api)];
                                    case 3:
                                        _b.sent();
                                        _b.label = 4;
                                    case 4: return [2 /*return*/];
                                }
                            });
                        }); })()];
                case 1:
                    // authorize micropayment?
                    _a.sent();
                    return [3 /*break*/, 10];
                case 2:
                    if (!(message == 'already-waiting')) return [3 /*break*/, 4];
                    nftId = args[0][0];
                    console.log(red("UA-NFT") + color.bold("|CLIENT-APP: ") +
                        color.bold("Waiting on NFT ") + red("ID ".concat(nftId)) + color.bold(" micropayment"));
                    console.log(yellow("UA-NFT") + color.bold("|CLIENT-APP: ") +
                        color.bold("Please authorize transfer of 1 pico TZERO."));
                    console.log(yellow("UA-NFT") + color.bold("|CLIENT-APP: ") +
                        magenta("".concat(OWNER_ADDRESS, "\n")));
                    // authorize micropayment?
                    return [4 /*yield*/, (function () { return __awaiter(void 0, void 0, void 0, function () {
                            var responseChoice, choice, _a, api, contract;
                            return __generator(this, function (_b) {
                                switch (_b.label) {
                                    case 0: return [4 /*yield*/, prompts({
                                            type: 'confirm',
                                            name: 'choice',
                                            message: 'Do you authorize this application to transfer\n  1 pico TZERO for verification purposes?'
                                        }, { onCancel: utils_1.onCancel })];
                                    case 1:
                                        responseChoice = _b.sent();
                                        choice = responseChoice.choice;
                                        console.log('');
                                        if (choice == false) {
                                            console.clear();
                                            console.log(red("\n ABORTING REGISTRATION.\n"));
                                            console.log(red(" WE NEED YOU TO RETURN THE VERIFICATION "));
                                            console.log(red(" MICROPAYMENT BEFORE REGISTERING A DIFFERENT NFT."));
                                            console.log(red(" REPEAT THE REGISTRATION PROCESS WHEN READY."));
                                            console.log(red(" YOU MAY CHOOSE A DIFFERENT USERNAME"));
                                            console.log(red(" AND PASSWORD IF YOU PLEASE."));
                                            setTimeout(function () {
                                                process.send('done');
                                                process.exit();
                                            }, 7500);
                                        }
                                        if (!(choice == true)) return [3 /*break*/, 4];
                                        return [4 /*yield*/, (0, utils_1.setupSession)('authenticated')];
                                    case 2:
                                        _a = _b.sent(), api = _a[0], contract = _a[1];
                                        return [4 /*yield*/, transferMicropayment(api)];
                                    case 3:
                                        _b.sent();
                                        _b.label = 4;
                                    case 4: return [2 /*return*/];
                                }
                            });
                        }); })()];
                case 3:
                    // authorize micropayment?
                    _a.sent();
                    return [3 /*break*/, 10];
                case 4:
                    if (!(message == 'payment-received')) return [3 /*break*/, 5];
                    nftId = args[0][0];
                    console.log(green("UA-NFT") + color.bold("|CLIENT-APP: ") +
                        color.bold("Your micropayment was received!!!\n"));
                    console.log(yellow("UA-NFT") + color.bold("|CLIENT-APP: ") +
                        color.bold("Stand by while we set your NFT ") + red("ID ".concat(nftId, " ")));
                    console.log(yellow("UA-NFT") + color.bold("|CLIENT-APP: ") +
                        color.bold("to 'authenticated' then store your"));
                    console.log(yellow("UA-NFT") + color.bold("|CLIENT-APP: ") +
                        color.bold("anonymized credentials on the blockchain!\n"));
                    return [3 /*break*/, 10];
                case 5:
                    if (!(message == 'setAuthenticated-complete')) return [3 /*break*/, 6];
                    nftId = args[0][0];
                    console.log(green("UA-NFT") + color.bold("|CLIENT-APP: ") +
                        color.bold("Your NFT ") + red("ID ".concat(nftId)) + color.bold(" has been set"));
                    console.log(green("UA-NFT") + color.bold("|CLIENT-APP: ") +
                        color.bold("'authenticated' on the blockchain.\n"));
                    console.log(yellow("UA-NFT") + color.bold("|CLIENT-APP: ") +
                        color.bold("Stand by while we store your anonymized"));
                    console.log(yellow("UA-NFT") + color.bold("|CLIENT-APP: ") +
                        color.bold("credentials on the blockchain.\n"));
                    return [3 /*break*/, 10];
                case 6:
                    if (!(message == 'credential-set')) return [3 /*break*/, 8];
                    nftId = args[0][0];
                    userhash = args[0][1];
                    passhash = args[0][2];
                    console.clear();
                    console.log(green("\n\nUA-NFT") + color.bold("|CLIENT-APP: ") +
                        color.bold("Your anonymized NFT access credentials have"));
                    console.log(green("UA-NFT") + color.bold("|CLIENT-APP: ") +
                        color.bold("been stored on the blockchain.\n\n\n\n\n"));
                    console.log(green("UA-NFT") + color.bold("|CLIENT-APP: ") +
                        color.bold("Universal access NFT") + red(" ID ".concat(nftId)) + color.bold(" authenticated!!!"));
                    console.log(green("UA-NFT") + color.bold("|CLIENT-APP: ") +
                        color.bold("You may now login to the restricted access area!!!\n\n"));
                    console.log(red("UA-NFT") + color.bold("|CLIENT-APP: ") +
                        color.bold("!!! REMINDER WARNING !!!\n"));
                    console.log(red("UA-NFT") + color.bold("|CLIENT-APP: ") +
                        color.bold("Because your credentials are anonymized, "));
                    console.log(red("UA-NFT") + color.bold("|CLIENT-APP: ") +
                        color.bold("it is impossible for us to reveal your"));
                    console.log(red("UA-NFT") + color.bold("|CLIENT-APP: ") +
                        color.bold("username or password if you forget.\n"));
                    console.log(red("UA-NFT") + color.bold("|CLIENT-APP: ") +
                        color.bold("If you forget your username or password, you"));
                    console.log(red("UA-NFT") + color.bold("|CLIENT-APP: ") +
                        color.bold("must repeat this registration process with"));
                    console.log(red("UA-NFT") + color.bold("|CLIENT-APP: ") +
                        color.bold("a DIFFERENT username.\n"));
                    console.log(red("UA-NFT") + color.bold("|CLIENT-APP: ") +
                        color.bold("(This is the only way we can ensure access"));
                    console.log(red("UA-NFT") + color.bold("|CLIENT-APP: ") +
                        color.bold("credentials are anonymized and secure in a"));
                    console.log(red("UA-NFT") + color.bold("|CLIENT-APP: ") +
                        color.bold("transparent blockchain environment.\n"));
                    console.log(red("UA-NFT") + color.bold("|CLIENT-APP: ") +
                        color.bold("Maybe WRITE THEM DOWN somewhere...?\n\n"));
                    console.log(color.bold.magenta("UA-NFT") + color.bold("|CLIENT-APP: ") +
                        color.bold("USERNAME STORED ON BLOCKCHAIN AS SHA256 HASH"));
                    console.log(color.yellow("0x".concat(userhash)));
                    console.log(color.bold.magenta("UA-NFT") + color.bold("|CLIENT-APP: ") +
                        color.bold("PASSWORD STORED ON BLOCKCHAIN AS SHA256 HASH "));
                    console.log(color.yellow("0x".concat(passhash)));
                    console.log(green("UA-NFT") + color.bold("|CLIENT-APP: ") +
                        color.bold("You do not need to record these hash numbers."));
                    console.log(green("UA-NFT") + color.bold("|CLIENT-APP: ") +
                        color.bold("They are provided in case you wish to verify"));
                    console.log(green("UA-NFT") + color.bold("|CLIENT-APP: ") +
                        color.bold("their presence on-chain via contract explorer, or"));
                    console.log(green("UA-NFT") + color.bold("|CLIENT-APP: ") +
                        color.bold("if you would like to verify SHA256 hashes yourself.\n\n"));
                    console.log(color.bold.magenta("UA-NFT") + color.bold("|CLIENT-APP: ") +
                        color.bold("USERNAME/PASSWORD IMPOSSIBLE TO DERIVE FROM HASH. "));
                    console.log(color.bold.magenta("UA-NFT") + color.bold("|CLIENT-APP: ") +
                        color.bold("SHA256 HASHES VERIFY YOU POSSESS CREDENTIALS"));
                    console.log(color.bold.magenta("UA-NFT") + color.bold("|CLIENT-APP: ") +
                        color.bold("BY COMPARING LOCAL HASH OF CREDENTIALS YOU PROVIDE"));
                    console.log(color.bold.magenta("UA-NFT") + color.bold("|CLIENT-APP: ") +
                        color.bold("ON LOGIN WITH THE HASHES WE JUST GENERATED"));
                    console.log(color.bold.magenta("UA-NFT") + color.bold("|CLIENT-APP: ") +
                        color.bold("AND STORED ON THE BLOCKCHAIN.\n"));
                    console.log(green("UA-NFT") + color.bold("|CLIENT-APP: ") +
                        color.bold("YOUR CREDENTIALS ARE NEVER STORED IN A DATABASE."));
                    console.log(green("UA-NFT") + color.bold("|CLIENT-APP: ") +
                        color.bold("THEY ARE ANONYMIZED & STORED ON BLOCKCHAIN.\n"));
                    return [4 /*yield*/, (0, utils_1.returnToMain)('return to main menu')];
                case 7:
                    _a.sent();
                    return [3 /*break*/, 10];
                case 8:
                    if (!(message == 'all-nfts-authenticated')) return [3 /*break*/, 10];
                    console.log(red("UA-NFT") + color.bold("|CLIENT-APP: ") +
                        color.bold("All your NFTs are already authenticated."));
                    console.log(red("UA-NFT") + color.bold("|CLIENT-APP: ") +
                        color.bold("You need to buy a new universal access NFT"));
                    console.log(red("UA-NFT") + color.bold("|CLIENT-APP: ") +
                        color.bold("to register and gain access to restricted area.\n"));
                    return [4 /*yield*/, (0, utils_1.returnToMain)('return to main menu to mint new nft')];
                case 9:
                    _a.sent();
                    _a.label = 10;
                case 10: return [2 /*return*/];
            }
        });
    });
});
// Check if valid username.
var isValidUsername = function (username) {
    try {
        // search for any whitespace
        if (/\s/.test(username)) {
            // username not valid
            return false;
            // make sure not too short
        }
        else if (username.length < 5) {
            // username not valid
            return false;
        }
        // username valid
        return true;
    }
    catch (error) {
        return false;
    }
};
// Check if username is available
var isAvailableUsername = function (api, contract, usernameHash) { return __awaiter(void 0, void 0, void 0, function () {
    var keyring, CLIENT_PAIR, gasLimit, _a, gasRequired, storageDeposit, result, output, RESULT, OUTPUT, error, error_1;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                keyring = new Keyring({ type: 'sr25519' });
                CLIENT_PAIR = keyring.addFromUri(CLIENT_MNEMONIC);
                gasLimit = api.registry.createType('WeightV2', {
                    refTime: Math.pow(2, 53) - 1,
                    proofSize: Math.pow(2, 53) - 1
                });
                return [4 /*yield*/, contract.query['checkCredential'](CLIENT_PAIR.address, { gasLimit: gasLimit }, '0x' + usernameHash)];
            case 1:
                _a = _b.sent(), gasRequired = _a.gasRequired, storageDeposit = _a.storageDeposit, result = _a.result, output = _a.output;
                RESULT = JSON.parse(JSON.stringify(result));
                OUTPUT = JSON.parse(JSON.stringify(output));
                // if this call reverts, then only possible error is 'credential nonexistent'
                if (RESULT.ok.flags == 'Revert') {
                    error = OUTPUT.ok.err.custom.toString().replace(/0x/, '');
                    console.log(green("UA-NFT") + color.bold("|CLIENT-APP: ") +
                        color.bold("username available!\n"));
                    // username is available
                    return [2 /*return*/, true];
                }
                // username is not available
                return [2 /*return*/, false];
            case 2:
                error_1 = _b.sent();
                console.log(red("UA-NFT") + color.bold("|CLIENT-APP: ") + error_1);
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
// Check if username is available
var transferMicropayment = function (api) { return __awaiter(void 0, void 0, void 0, function () {
    var keyring, CLIENT_PAIR, transfer, hash, error_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                keyring = new Keyring({ type: 'sr25519' });
                CLIENT_PAIR = keyring.addFromUri(CLIENT_MNEMONIC);
                transfer = api.tx.balances.transfer(OWNER_ADDRESS, 1);
                return [4 /*yield*/, transfer.signAndSend(CLIENT_PAIR)];
            case 1:
                hash = _a.sent();
                return [2 /*return*/, hash];
            case 2:
                error_2 = _a.sent();
                console.log(red("UA-NFT") + color.bold("|CLIENT-APP: ") + error_2);
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
// handle misc error
var otherError = function () {
    console.log(red("UA-NFT") + color.bold("|CLIENT-APP: ") +
        color.bold('Failed to register credentials.\n'));
    process.send('error');
    process.exit();
};
