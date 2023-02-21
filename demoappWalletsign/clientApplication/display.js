"use strict";
//
// INTERLOCK NETWORK & ALEPH ZERO
// PSP34 UNIVERSAL ACCESS NFT - CLIENT DISPLAY COLLECTION
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
var fs_1 = require("fs");
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
function display() {
    return __awaiter(this, void 0, void 0, function () {
        var _a, api, contract, keyring, CLIENT_PAIR, _b, gasRequired, storageDeposit, RESULT_collection, OUTPUT_collection, collection, nfts, nft, _i, nfts_1, _c, gasRequired, storageDeposit, RESULT_authenticated, OUTPUT_authenticated, authenticated, error_1;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    _d.trys.push([0, 11, , 12]);
                    return [4 /*yield*/, (0, utils_1.setupSession)('setAuthenticated')];
                case 1:
                    _a = _d.sent(), api = _a[0], contract = _a[1];
                    keyring = new Keyring({ type: 'sr25519' });
                    CLIENT_PAIR = keyring.addFromUri(CLIENT_MNEMONIC);
                    console.log(color.bold.magenta("UA-NFT") + color.bold("|CLIENT-APP: ") +
                        color.bold("Reminder..."));
                    console.log(color.bold.magenta("UA-NFT") + color.bold("|CLIENT-APP: ") +
                        color.bold("You are responsible for remembering the"));
                    console.log(color.bold.magenta("UA-NFT") + color.bold("|CLIENT-APP: ") +
                        color.bold("username/password pairs associated with"));
                    console.log(color.bold.magenta("UA-NFT") + color.bold("|CLIENT-APP: ") +
                        color.bold("each authenticated universal access NFT.\n"));
                    console.log(color.bold.magenta("UA-NFT") + color.bold("|CLIENT-APP: ") +
                        color.bold("This is because username/password pairs"));
                    console.log(color.bold.magenta("UA-NFT") + color.bold("|CLIENT-APP: ") +
                        color.bold("are not stored in a traditional database."));
                    console.log(color.bold.magenta("UA-NFT") + color.bold("|CLIENT-APP: ") +
                        color.bold("We only store the obfuscated anonymized"));
                    console.log(color.bold.magenta("UA-NFT") + color.bold("|CLIENT-APP: ") +
                        color.bold("username/password hashes on the blockchain"));
                    console.log(color.bold.magenta("UA-NFT") + color.bold("|CLIENT-APP: ") +
                        color.bold("for the purpose of comparing the hashes of"));
                    console.log(color.bold.magenta("UA-NFT") + color.bold("|CLIENT-APP: ") +
                        color.bold("credentials you provide to our secure server"));
                    console.log(color.bold.magenta("UA-NFT") + color.bold("|CLIENT-APP: ") +
                        color.bold("each time you log in to restricted access area.\n"));
                    return [4 /*yield*/, (0, utils_1.hasCollection)(api, contract, CLIENT_ADDRESS)];
                case 2:
                    if (!!(_d.sent())) return [3 /*break*/, 4];
                    console.log(red("UA-NFT") + color.bold("|CLIENT-APP: ") +
                        color.bold("This wallet has no universal access NFT collection.") +
                        color.bold("  Please return to main menu to mint.\n"));
                    // if no collection propmt to return to main menu      
                    return [4 /*yield*/, (0, utils_1.returnToMain)('return to main menu to mint NFT')];
                case 3:
                    // if no collection propmt to return to main menu      
                    _d.sent();
                    _d.label = 4;
                case 4: return [4 /*yield*/, (0, utils_1.contractGetter)(api, contract, CLIENT_PAIR, 'Authenticate', 'getCollection', CLIENT_ADDRESS)];
                case 5:
                    _b = _d.sent(), gasRequired = _b[0], storageDeposit = _b[1], RESULT_collection = _b[2], OUTPUT_collection = _b[3];
                    collection = JSON.parse(JSON.stringify(OUTPUT_collection));
                    nfts = Array.from(collection.ok.ok);
                    // print table of NFTs and their authentication status
                    console.log(color.bold("\n YOUR UNIVERSAL ACCESS NFT COLLECTION:\n"));
                    console.log(color.bold("\tNFT ID\t\t\t\tSTATUS\n"));
                    nft = void 0;
                    _i = 0, nfts_1 = nfts;
                    _d.label = 6;
                case 6:
                    if (!(_i < nfts_1.length)) return [3 /*break*/, 9];
                    nft = nfts_1[_i];
                    return [4 /*yield*/, (0, utils_1.contractGetter)(api, contract, CLIENT_PAIR, 'display', 'isAuthenticated', { u64: nft.u64 })];
                case 7:
                    _c = _d.sent(), gasRequired = _c[0], storageDeposit = _c[1], RESULT_authenticated = _c[2], OUTPUT_authenticated = _c[3];
                    authenticated = JSON.parse(JSON.stringify(OUTPUT_authenticated));
                    // record nft id of one that is waiting and ready to authenticate
                    if (authenticated.ok.ok == false) {
                        console.log(red("\t".concat(nft.u64, "\t\t\t\tNEEDS AUTHENTICATION\n")));
                    }
                    else {
                        console.log(green("\t".concat(nft.u64, "\t\t\t\tSUCCESSFULLY AUTHENTICATED!\n")));
                    }
                    _d.label = 8;
                case 8:
                    _i++;
                    return [3 /*break*/, 6];
                case 9: return [4 /*yield*/, (0, utils_1.returnToMain)('return to register NFTs or login to restricted area')];
                case 10:
                    _d.sent();
                    return [3 /*break*/, 12];
                case 11:
                    error_1 = _d.sent();
                    console.log(red("UA-NFT") + color.bold("|CLIENT-APP: ") + error_1);
                    process.send('display-process-error');
                    process.exit();
                    return [3 /*break*/, 12];
                case 12: return [2 /*return*/];
            }
        });
    });
}
display();
