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
var child_process_1 = require("child_process");
var fs_1 = require("fs");
var prompts = require("prompts");
// environment constants
var dotenv = require("dotenv");
dotenv.config();
// child process paths
var path = require("path");
var register = path.resolve('register.js');
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
var username;
var password;
var passwordVerify;
function authenticate() {
    return __awaiter(this, void 0, void 0, function () {
        var _a, api_1, contract_1, keyring, CLIENT_PAIR, _b, gasRequired, storageDeposit, RESULT_collection, OUTPUT_collection, collection, nfts, nft, ids_1, _i, nfts_1, _c, gasRequired, storageDeposit, RESULT_authenticated, OUTPUT_authenticated, authenticated, error_1;
        var _this = this;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    _d.trys.push([0, 11, , 12]);
                    return [4 /*yield*/, (0, utils_1.setupSession)('authenticate')];
                case 1:
                    _a = _d.sent(), api_1 = _a[0], contract_1 = _a[1];
                    keyring = new Keyring({ type: 'sr25519' });
                    CLIENT_PAIR = keyring.addFromUri(CLIENT_MNEMONIC);
                    return [4 /*yield*/, (0, utils_1.hasCollection)(api_1, contract_1, CLIENT_ADDRESS)];
                case 2:
                    if (!!(_d.sent())) return [3 /*break*/, 4];
                    console.log(red("UA-NFT") + color.bold("|CLIENT-APP: ") +
                        color.bold("Your have no universal access NFTs."));
                    console.log(red("UA-NFT") + color.bold("|CLIENT-APP: ") +
                        color.bold("Please return to main menu to mint.\n"));
                    // if no collection propmt to return to main menu      
                    return [4 /*yield*/, (0, utils_1.returnToMain)('goto main menu to mint universal access NFT')];
                case 3:
                    // if no collection propmt to return to main menu      
                    _d.sent();
                    _d.label = 4;
                case 4: return [4 /*yield*/, (0, utils_1.contractGetter)(api_1, contract_1, CLIENT_PAIR, 'Authenticate', 'getCollection', CLIENT_ADDRESS)];
                case 5:
                    _b = _d.sent(), gasRequired = _b[0], storageDeposit = _b[1], RESULT_collection = _b[2], OUTPUT_collection = _b[3];
                    collection = JSON.parse(JSON.stringify(OUTPUT_collection));
                    nfts = Array.from(collection.ok.ok);
                    // print table of NFTs and their authentication status
                    console.log(color.bold("AVAILABLE UANFTs TO REGISTER\n"));
                    nft = void 0;
                    ids_1 = [];
                    _i = 0, nfts_1 = nfts;
                    _d.label = 6;
                case 6:
                    if (!(_i < nfts_1.length)) return [3 /*break*/, 9];
                    nft = nfts_1[_i];
                    return [4 /*yield*/, (0, utils_1.contractGetter)(api_1, contract_1, CLIENT_PAIR, 'Authenticate', 'isAuthenticated', { u64: nft.u64 })];
                case 7:
                    _c = _d.sent(), gasRequired = _c[0], storageDeposit = _c[1], RESULT_authenticated = _c[2], OUTPUT_authenticated = _c[3];
                    authenticated = JSON.parse(JSON.stringify(OUTPUT_authenticated));
                    // record nft id of one that is waiting and ready to authenticate
                    if (authenticated.ok.ok == true) {
                        console.log(red("\t".concat(nft.u64, "\n")));
                    }
                    else {
                        console.log(green("\t".concat(nft.u64, "\n")));
                    }
                    ids_1.push(nft.u64);
                    _d.label = 8;
                case 8:
                    _i++;
                    return [3 /*break*/, 6];
                case 9:
                    console.log(red("UA-NFT") + color.bold("|CLIENT-APP: ") +
                        color.bold("NFT IDs in red already have access credentials"));
                    console.log(red("UA-NFT") + color.bold("|CLIENT-APP: ") +
                        color.bold("that you registered with them."));
                    console.log(red("UA-NFT") + color.bold("|CLIENT-APP: ") +
                        color.bold("If you proceed to register new credentials with"));
                    console.log(red("UA-NFT") + color.bold("|CLIENT-APP: ") +
                        color.bold("the NFT IDs in red, you will overwrite the old.\n"));
                    // prompt, NFT ID
                    return [4 /*yield*/, (function () { return __awaiter(_this, void 0, void 0, function () {
                            var responseId, id;
                            var _this = this;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, prompts({
                                            type: 'number',
                                            name: 'id',
                                            message: 'Enter the ID of the UANFT you wish to register credentials for.\n',
                                            validate: function (id) { return !ids_1.includes(id) ?
                                                red("UA-NFT") + color.bold("|CLIENT-APP: ") + "NFT ID not in your collection." : true; }
                                        }, { onCancel: utils_1.onCancel })];
                                    case 1:
                                        responseId = _a.sent();
                                        id = responseId.id;
                                        console.log('');
                                        if (!(id != undefined)) return [3 /*break*/, 3];
                                        // prompt: username
                                        return [4 /*yield*/, (function () { return __awaiter(_this, void 0, void 0, function () {
                                                var isAvailable, responseUsername;
                                                var _this = this;
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
                                                                    validate: function (username) { return !(0, utils_1.isValidUsername)(username) ?
                                                                        red("UA-NFT") + color.bold("|CLIENT-APP: ") + "Too short / contains spaces." : true; }
                                                                }, { onCancel: utils_1.onCancel })];
                                                        case 2:
                                                            responseUsername = _a.sent();
                                                            username = responseUsername.username;
                                                            console.log('');
                                                            return [4 /*yield*/, (0, utils_1.isAvailableUsername)(api_1, contract_1, (0, utils_1.getHash)(username))];
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
                                                            // prompt: password
                                                            (function () { return __awaiter(_this, void 0, void 0, function () {
                                                                var responsePassword, registerChild;
                                                                var _this = this;
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
                                                                                color.bold("You successfully entered new credentials.\n"));
                                                                            console.log(yellow("UA-NFT") + color.bold("|CLIENT-APP: ") +
                                                                                color.bold("Stand by while we register your UANFT."));
                                                                            registerChild = (0, child_process_1.fork)(register);
                                                                            registerChild.send({
                                                                                id: id,
                                                                                userhash: (0, utils_1.getHash)(username),
                                                                                passhash: (0, utils_1.getHash)(password)
                                                                            });
                                                                            // listen for results of registration tx
                                                                            registerChild.on('message', function (message) { return __awaiter(_this, void 0, void 0, function () {
                                                                                return __generator(this, function (_a) {
                                                                                    switch (_a.label) {
                                                                                        case 0:
                                                                                            if (!(message == 'register-complete')) return [3 /*break*/, 2];
                                                                                            console.clear();
                                                                                            console.log(green("\n\nUA-NFT") + color.bold("|CLIENT-APP: ") +
                                                                                                color.bold("Your anonymized NFT access credentials have"));
                                                                                            console.log(green("UA-NFT") + color.bold("|CLIENT-APP: ") +
                                                                                                color.bold("been stored on the blockchain.\n\n\n\n\n"));
                                                                                            console.log(green("UA-NFT") + color.bold("|CLIENT-APP: ") +
                                                                                                color.bold("Universal access NFT") + red(" ID ".concat(id)) + color.bold(" authenticated!!!"));
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
                                                                                                color.bold("This is the only way we can ensure access"));
                                                                                            console.log(red("UA-NFT") + color.bold("|CLIENT-APP: ") +
                                                                                                color.bold("credentials are anonymized and secure in a"));
                                                                                            console.log(red("UA-NFT") + color.bold("|CLIENT-APP: ") +
                                                                                                color.bold("transparent blockchain environment.\n"));
                                                                                            console.log(red("UA-NFT") + color.bold("|CLIENT-APP: ") +
                                                                                                color.bold("Maybe WRITE THEM DOWN somewhere...?\n\n"));
                                                                                            console.log(color.bold.magenta("UA-NFT") + color.bold("|CLIENT-APP: ") +
                                                                                                color.bold("USERNAME STORED ON BLOCKCHAIN AS SHA256 HASH"));
                                                                                            console.log(color.yellow("0x".concat((0, utils_1.getHash)(username))));
                                                                                            console.log(color.bold.magenta("UA-NFT") + color.bold("|CLIENT-APP: ") +
                                                                                                color.bold("PASSWORD STORED ON BLOCKCHAIN AS SHA256 HASH "));
                                                                                            console.log(color.yellow("0x".concat((0, utils_1.getHash)(password))));
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
                                                                                            return [4 /*yield*/, (0, utils_1.returnToMain)('return to main menu to login to restricted access area')];
                                                                                        case 1:
                                                                                            _a.sent();
                                                                                            return [3 /*break*/, 4];
                                                                                        case 2:
                                                                                            console.log(red("UA-NFT") + color.bold("|CLIENT-APP: ") +
                                                                                                color.bold("Whoops...something went wrong registering your UANFT!\n"));
                                                                                            console.log(red("UA-NFT") + color.bold("|CLIENT-APP: ") +
                                                                                                color.bold("Error: ".concat(message, "\n")));
                                                                                            return [4 /*yield*/, (0, utils_1.returnToMain)('return to main menu to retry registration')];
                                                                                        case 3:
                                                                                            _a.sent();
                                                                                            _a.label = 4;
                                                                                        case 4: return [2 /*return*/];
                                                                                    }
                                                                                });
                                                                            }); });
                                                                            return [2 /*return*/];
                                                                    }
                                                                });
                                                            }); })();
                                                            return [2 /*return*/];
                                                    }
                                                });
                                            }); })()];
                                    case 2:
                                        // prompt: username
                                        _a.sent();
                                        _a.label = 3;
                                    case 3: return [2 /*return*/];
                                }
                            });
                        }); })()];
                case 10:
                    // prompt, NFT ID
                    _d.sent();
                    return [3 /*break*/, 12];
                case 11:
                    error_1 = _d.sent();
                    console.log(red("UA-NFT") + color.bold("|CLIENT-APP: ") + error_1);
                    process.send('authenticate-process-error');
                    process.exit();
                    return [3 /*break*/, 12];
                case 12: return [2 /*return*/];
            }
        });
    });
}
authenticate();
