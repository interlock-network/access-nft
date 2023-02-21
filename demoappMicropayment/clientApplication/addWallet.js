"use strict";
//
// INTERLOCK NETWORK & ALEPH ZERO
// PSP34 UNIVERSAL ACCESS NFT - CLIENT CREATE WALLET
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
var prompts = require("prompts");
var fs = require("fs");
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
var mnemonic;
var address;
function addWallet() {
    return __awaiter(this, void 0, void 0, function () {
        var _this = this;
        return __generator(this, function (_a) {
            try {
                console.log(green("\nUA-NFT") + color.bold("|CLIENT-APP: ") +
                    color.bold("We need a wallet to sign transactions."));
                console.log(green("UA-NFT") + color.bold("|CLIENT-APP: ") +
                    color.bold("This wallet will be the simplest kind:"));
                console.log(green("UA-NFT") + color.bold("|CLIENT-APP: ") +
                    color.bold("local file with address-mnemonic pair.\n\n"));
                console.log(red("UA-NFT") + color.bold("|CLIENT-APP: ") +
                    color.bold("THIS APP IS FOR DEMO PURPOSES ONLY."));
                console.log(red("UA-NFT") + color.bold("|CLIENT-APP: ") +
                    color.bold("WE RECOMMEND YOU USE THROW-AWAY ACCOUNT"));
                console.log(red("UA-NFT") + color.bold("|CLIENT-APP: ") +
                    color.bold("IF YOU WITH TO CREATE A NEW WALLET.\n"));
                console.log(green("UA-NFT") + color.bold("|CLIENT-APP: ") +
                    color.bold("OR, YOU MAY USE DEFAULT CLIENT WALLET."));
                console.log(green("UA-NFT") + color.bold("|CLIENT-APP: ") +
                    color.bold("PROVIDED BY US FOR DEMO PURPOSES.\n"));
                console.log(color.bold.magenta("\nUA-NFT") + color.bold("|CLIENT-APP: ") +
                    color.bold("Create a new account here:"));
                console.log(color.bold.magenta("UA-NFT") + color.bold("|CLIENT-APP: ") +
                    color.bold.cyan("https://test.azero.dev/#/accounts\n"));
                console.log(color.bold.magenta("UA-NFT") + color.bold("|CLIENT-APP: ") +
                    color.bold("And if so, add TZERO by visiting faucet:"));
                console.log(color.bold.magenta("UA-NFT") + color.bold("|CLIENT-APP: ") +
                    color.bold.cyan("https://faucet.test.azero.dev\n\n"));
                console.log(red("UA-NFT") + color.bold("|CLIENT-APP: ") +
                    color.bold("Please only add wallet holding real assets"));
                console.log(red("UA-NFT") + color.bold("|CLIENT-APP: ") +
                    color.bold("if you trust the machine or device"));
                console.log(red("UA-NFT") + color.bold("|CLIENT-APP: ") +
                    color.bold("that this application is running on.\n"));
                // prompt
                //
                // proceed to create new wallet?
                (function () { return __awaiter(_this, void 0, void 0, function () {
                    var responseChoice, choice;
                    var _this = this;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, prompts({
                                    type: 'confirm',
                                    name: 'choice',
                                    message: 'Add your own account instead of default?'
                                }, { onCancel: utils_1.onCancel })];
                            case 1:
                                responseChoice = _a.sent();
                                choice = responseChoice.choice;
                                console.log('');
                                if (choice == false) {
                                    process.send('done');
                                    process.exit();
                                }
                                // first prompt: address
                                return [4 /*yield*/, (function () { return __awaiter(_this, void 0, void 0, function () {
                                        var responseAddress;
                                        var _this = this;
                                        return __generator(this, function (_a) {
                                            switch (_a.label) {
                                                case 0: return [4 /*yield*/, prompts({
                                                        type: 'text',
                                                        name: 'address',
                                                        message: 'Please enter account address.\n',
                                                        validate: function (address) { return !(0, utils_1.isValidSubstrateAddress)(address) ?
                                                            red("UA-NFT") + color.bold("|CLIENT-APP: ") + "Invalid address" : true; }
                                                    }, { onCancel: utils_1.onCancel })];
                                                case 1:
                                                    responseAddress = _a.sent();
                                                    address = responseAddress.address;
                                                    console.log('');
                                                    // second prompt: mnemonic
                                                    return [4 /*yield*/, (function () { return __awaiter(_this, void 0, void 0, function () {
                                                            var responseMnemonic;
                                                            return __generator(this, function (_a) {
                                                                switch (_a.label) {
                                                                    case 0: return [4 /*yield*/, prompts({
                                                                            type: 'text',
                                                                            name: 'mnemonic',
                                                                            message: 'Please enter account address mnemonic.\n',
                                                                            validate: function (mnemonic) { return !(0, utils_1.isValidMnemonic)(mnemonic) ?
                                                                                red("UA-NFT") + color.bold("|CLIENT-APP: ") + "Invalid mnemonic" : true; }
                                                                        }, { onCancel: utils_1.onCancel })];
                                                                    case 1:
                                                                        responseMnemonic = _a.sent();
                                                                        mnemonic = responseMnemonic.mnemonic;
                                                                        console.log('');
                                                                        fs.writeFileSync('.wallet.json', "{\"CLIENT_ADDRESS\":\"".concat(address, "\",\n") +
                                                                            "\"CLIENT_MNEMONIC\":\"".concat(mnemonic, "\"}"));
                                                                        console.log(green("UA-NFT") + color.bold("|CLIENT-APP: ") +
                                                                            color.bold("You entered a valid address and mnemonic,"));
                                                                        console.log(green("UA-NFT") + color.bold("|CLIENT-APP: ") +
                                                                            color.bold("stored locally to sign transactions."));
                                                                        console.log(green("UA-NFT") + color.bold("|CLIENT-APP: ") +
                                                                            color.bold("At no point will your mnemonic be"));
                                                                        console.log(green("UA-NFT") + color.bold("|CLIENT-APP: ") +
                                                                            color.bold("transmitted beyond this device.\n"));
                                                                        console.log(yellow("UA-NFT") + color.bold("|CLIENT-APP: ") +
                                                                            color.bold("If you would like to purge your address"));
                                                                        console.log(yellow("UA-NFT") + color.bold("|CLIENT-APP: ") +
                                                                            color.bold("and mnemonic information from this app,"));
                                                                        console.log(yellow("UA-NFT") + color.bold("|CLIENT-APP: ") +
                                                                            color.bold("you may do so from the main menu.\n"));
                                                                        return [4 /*yield*/, (0, utils_1.returnToMain)('return to mint universal access NFT')];
                                                                    case 2:
                                                                        _a.sent();
                                                                        return [2 /*return*/];
                                                                }
                                                            });
                                                        }); })()];
                                                case 2:
                                                    // second prompt: mnemonic
                                                    _a.sent();
                                                    return [2 /*return*/];
                                            }
                                        });
                                    }); })()];
                            case 2:
                                // first prompt: address
                                _a.sent();
                                return [2 /*return*/];
                        }
                    });
                }); })();
            }
            catch (error) {
                console.log(red("UA-NFT") + color.bold("|CLIENT-APP: ") + error);
                process.send('program-error');
                process.exit();
            }
            return [2 /*return*/];
        });
    });
}
addWallet();
