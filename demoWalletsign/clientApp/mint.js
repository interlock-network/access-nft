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
var child_process_1 = require("child_process");
var fs_1 = require("fs");
var prompts = require("prompts");
// child process paths
var path = require("path");
var mintTx = path.resolve('mintTx.js');
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
var CLIENT_ADDRESS = WALLET.CLIENT_ADDRESS;
var OWNER_MNEMONIC = process.env.OWNER_MNEMONIC;
var OWNER_ADDRESS = process.env.OWNER_ADDRESS;
console.log(magenta("This mint transaction is signed using the contract owner's"));
console.log(magenta("keypair for convenience in this demo app. In production,"));
console.log(magenta("the restricted access server would serve as transaction relay"));
console.log(magenta("for UANFT mint in exchange for client transfering token to"));
console.log(magenta("contract owner's address. Or, transfer will occur within"));
console.log(magenta("an NFT exchange. Or, client app may be configured to"));
console.log(magenta("self-mint using ILOCK token held in client wallet. See docs"));
console.log(magenta("for more information about self-mint feature of UANFT contract.\n"));
function mint() {
    return __awaiter(this, void 0, void 0, function () {
        var _a, api_1, contract_1, keyring, OWNER_PAIR_1, error_1;
        var _this = this;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, (0, utils_1.setupSession)('mint')];
                case 1:
                    _a = _b.sent(), api_1 = _a[0], contract_1 = _a[1];
                    keyring = new Keyring({ type: 'sr25519' });
                    OWNER_PAIR_1 = keyring.addFromUri(OWNER_MNEMONIC);
                    // confirm mint process begining
                    return [4 /*yield*/, (function () { return __awaiter(_this, void 0, void 0, function () {
                            var responseChoice, choice, mintTxChild;
                            var _this = this;
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
                                        if (choice == true) {
                                            mintTxChild = (0, child_process_1.fork)(mintTx);
                                            mintTxChild.send(CLIENT_ADDRESS);
                                            // listen for results of mint tx
                                            mintTxChild.on('message', function (message) { return __awaiter(_this, void 0, void 0, function () {
                                                var _a, gasRequired, storageDeposit, RESULT_collection, OUTPUT_collection, collection, nftId;
                                                return __generator(this, function (_b) {
                                                    switch (_b.label) {
                                                        case 0:
                                                            if (!(message == 'mint-complete')) return [3 /*break*/, 3];
                                                            return [4 /*yield*/, (0, utils_1.contractGetter)(api_1, contract_1, OWNER_PAIR_1, 'mint', 'getCollection', CLIENT_ADDRESS)];
                                                        case 1:
                                                            _a = _b.sent(), gasRequired = _a[0], storageDeposit = _a[1], RESULT_collection = _a[2], OUTPUT_collection = _a[3];
                                                            collection = JSON.parse(JSON.stringify(OUTPUT_collection));
                                                            nftId = Array.from(collection.ok.ok).pop();
                                                            // success
                                                            console.log(green("\n\nUA-NFT") + color.bold("|CLIENT-APP: ") +
                                                                color.bold("Universal Access NFT successfully minted!!!"));
                                                            console.log(green("UA-NFT") + color.bold("|CLIENT-APP: ") +
                                                                color.bold("Your new Universal Access NFT is ") +
                                                                red("ID ".concat(nftId.u64)) + color.bold("!\n"));
                                                            console.log(color.bold.magenta("\n\nUA-NFT") + color.bold("|CLIENT-APP: ") +
                                                                color.bold("Check out your collection to see NFT status.\n"));
                                                            return [4 /*yield*/, (0, utils_1.returnToMain)('return to main menu to register or display NFT')];
                                                        case 2:
                                                            _b.sent();
                                                            return [3 /*break*/, 5];
                                                        case 3:
                                                            // failure
                                                            console.log(red("\n\nUA-NFT") + color.bold("|CLIENT-APP: ") +
                                                                color.bold("Something went wrong minting UANFT."));
                                                            return [4 /*yield*/, (0, utils_1.returnToMain)('return to main menu')];
                                                        case 4:
                                                            _b.sent();
                                                            _b.label = 5;
                                                        case 5: return [2 /*return*/];
                                                    }
                                                });
                                            }); });
                                        }
                                        return [2 /*return*/];
                                }
                            });
                        }); })()];
                case 2:
                    // confirm mint process begining
                    _b.sent();
                    return [3 /*break*/, 4];
                case 3:
                    error_1 = _b.sent();
                    console.log(red("UA-NFT") + color.bold("|CLIENT-APP: ") + error_1);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    });
}
mint();
