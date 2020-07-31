"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const { decodeParams, encodeMethod, logDecoder, configure: configureABI, } = require("qtumjs-ethjs-abi");
configureABI({ noHexStringPrefix: true });
function encodeInputs(method, args = []) {
    const calldata = encodeMethod(method, args);
    return calldata;
}
exports.encodeInputs = encodeInputs;
function decodeOutputs(method, outputData) {
    const types = method.outputs.map((output) => output.type);
    // FIXME: would be nice to explicitly request for Array result
    const result = decodeParams(types, outputData);
    // Convert result to normal array...
    const values = [];
    for (let i = 0; i < types.length; i++) {
        values[i] = result[i];
    }
    return values;
}
exports.decodeOutputs = decodeOutputs;
class ContractLogDecoder {
    constructor(abi) {
        this.abi = abi;
        this._decoder = logDecoder(abi);
    }
    decode(rawlog) {
        const result = this._decoder([rawlog]);
        if (result.length === 0) {
            return null;
        }
        const log = result[0];
        return log;
    }
}
exports.ContractLogDecoder = ContractLogDecoder;
