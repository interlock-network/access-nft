"use strict";
//
// INTERLOCK NETWORK & ALEPH ZERO
// PSP34 UNIVERSAL ACCESS NFT - CLIENT DELETE WALLET
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
var WALLET = JSON.parse(fs.readFileSync('.wallet.json').toString());
var CLIENT_ADDRESS = WALLET.CLIENT_ADDRESS;
function deleteWallet() {
    return __awaiter(this, void 0, void 0, function () {
        var _this = this;
        return __generator(this, function (_a) {
            try {
                console.log(red("\nUA-NFT") + color.bold("|CLIENT-APP: ") +
                    color.bold("Do you really wish to delete the wallet you"));
                console.log(red("UA-NFT") + color.bold("|CLIENT-APP: ") +
                    color.bold("associated with account address"));
                console.log(red("UA-NFT") + color.bold("|CLIENT-APP: ") +
                    magenta("".concat(CLIENT_ADDRESS, " ")) + color.bold("?\n"));
                // prompt
                //
                // proceed to delete wallet?
                (function () { return __awaiter(_this, void 0, void 0, function () {
                    var responseChoice, choice;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, prompts({
                                    type: 'confirm',
                                    name: 'choice',
                                    message: 'Delete wallet?'
                                })];
                            case 1:
                                responseChoice = _a.sent();
                                choice = responseChoice.choice;
                                console.log('');
                                if (choice == false) {
                                    process.send('done');
                                    process.exit();
                                }
                                fs.writeFileSync('.wallet.json', '');
                                console.log(green("UA-NFT") + color.bold("|CLIENT-APP: ") +
                                    color.bold("You deleted your wallet.\n"));
                                console.log(green("UA-NFT") + color.bold("|CLIENT-APP: ") +
                                    color.bold("You will need to re-add a wallet if you"));
                                console.log(green("UA-NFT") + color.bold("|CLIENT-APP: ") +
                                    color.bold("want to continue using this application.\n"));
                                return [4 /*yield*/, (0, utils_1.returnToMain)('return to main menu to add new wallet or quit')];
                            case 2:
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
deleteWallet();
