"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFilteredTransactions = getFilteredTransactions;
const axios_1 = __importDefault(require("axios"));
function getFilteredTransactions(address, apiKey) {
    return __awaiter(this, void 0, void 0, function* () {
        const url = `https://api-sepolia.basescan.org/api?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&page=1&offset=10000&sort=asc&apikey=${apiKey}`;
        try {
            const response = yield axios_1.default.get(url);
            console.log('Full API response:', response.data);
            if (response.data.status !== '1' && response.data.status !== 1) {
                console.error('API Error:', response.data.message);
                throw new Error(`API Error: ${response.data.message}`);
            }
            const filteredTransactions = response.data.result.filter(tx => tx.isError === '0' && tx.txreceipt_status === '1');
            console.log('Filtered transactions count:', filteredTransactions.length);
            return filteredTransactions.length;
        }
        catch (error) {
            console.error('Error fetching or processing transactions:', error.message);
            console.log('Error details:', error.response ? error.response.data : error);
            return 0;
        }
    });
}
const address = '0x6f83585Ec485FE6bcDB7e4080eB6731C11813A65';
const apiKey = 'H4TPWFCD9FCZIVSPRVF3RBZFYASMBBSQ6Y';
getFilteredTransactions(address, apiKey)
    .then(count => console.log(`Number of successful transactions: ${count}`))
    .catch(error => console.error('Error:', error));
//# sourceMappingURL=Base.js.map