"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
const eventemitter3_1 = require("eventemitter3");
const { logDecoder, } = require("qtumjs-ethjs-abi");
const abi_1 = require("./abi");
const sleep_1 = require("./sleep");
const TxReceiptPromise_1 = require("./TxReceiptPromise");
const MethodMap_1 = require("./MethodMap");
/**
 * Contract represents a Smart Contract deployed on the blockchain.
 */
class Contract {
    /**
     * Create a Contract
     *
     * @param rpc - The RPC object used to access the blockchain.
     * @param info - The deployment information about this contract. It includes the contract
     *      address, owner address, and ABI definition for methods and types.
     * @param opts - init options
     */
    constructor(rpc, info, opts = {}) {
        this.rpc = rpc;
        this.info = info;
        this.methodMap = new MethodMap_1.MethodMap(info.abi);
        this.address = info.address;
        this._logDecoder = opts.logDecoder || new abi_1.ContractLogDecoder(this.info.abi);
        this._useBigNumber = false;
    }
    encodeParams(method, args = []) {
        const methodABI = this.methodMap.findMethod(method, args);
        if (!methodABI) {
            throw new Error(`Unknown method to call: ${method}`);
        }
        return abi_1.encodeInputs(methodABI, args);
    }
    /**
     * Call a contract method using ABI encoding, and return the RPC result as is.
     * This does not create a transaction. It is useful for gas estimation or
     * getting results from read-only methods.
     *
     * @param method name of contract method to call
     * @param args arguments
     */
    async rawCall(method, args = [], opts = {}) {
        const calldata = this.encodeParams(method, args);
        return this.rpc.callContract(Object.assign({ address: this.address, datahex: calldata, senderAddress: opts.senderAddress || this.info.sender }, opts));
    }
    /**
     * Executes contract method on your own local gkcd node as a "simulation"
     * using `callcontract`. It is free, and does not actually modify the
     * blockchain.
     *
     * @param method Name of the contract method
     * @param args Arguments for calling the method
     * @param opts call options
     */
    async call(method, args = [], opts = {}) {
        const r = await this.rawCall(method, args, opts);
        const exception = r.executionResult.excepted;
        if (exception !== "None") {
            throw new Error(`Call exception: ${exception}`);
        }
        const output = r.executionResult.output;
        let decodedOutputs = [];
        if (output !== "") {
            const methodABI = this.methodMap.findMethod(method, args);
            decodedOutputs = abi_1.decodeOutputs(methodABI, output);
        }
        const decodedLogs = r.transactionReceipt.log.map((rawLog) => {
            return this.logDecoder.decode(rawLog);
        });
        return Object.assign(r, {
            outputs: decodedOutputs,
            logs: decodedLogs,
        });
    }
    /**
     * Call a method, and return only the first return value of the method. This
     * is a convenient syntatic sugar to get the return value when there is only
     * one.
     *
     * @param method Name of the contract method
     * @param args Arguments for calling the method
     * @param opts call options
     */
    async return(method, args = [], opts = {}) {
        const result = await this.call(method, args, opts);
        return result.outputs[0];
    }
    async returnNumber(method, args = [], opts = {}) {
        const result = await this.call(method, args, opts);
        const val = result.outputs[0];
        // Convert big number to JavaScript number
        if (typeof val.toNumber !== "function") {
            throw new Error("Cannot convert result to a number");
        }
        return val.toNumber();
    }
    /**
     * Call a method, and return the first return value as Date. It is assumed
     * that the returned value is unix second.
     *
     * @param method
     * @param args
     * @param opts
     */
    async returnDate(method, args = [], opts = {}) {
        const result = await this.return(method, args, opts);
        if (typeof result !== "number") {
            throw Error("Cannot convert return value to Date. Expect return value to be a number.");
        }
        return new Date(result * 1000);
    }
    /**
     * Call a method, and return the first return value (a uint). Convert the value to
     * the desired currency unit.
     *
     * @param targetBase The currency unit to convert to. If a number, it is
     * treated as the power of 10. -8 is satoshi. 0 is the canonical unit.
     * @param method
     * @param args
     * @param opts
     */
    async returnCurrency(targetBase, method, args = [], opts = {}) {
        const value = await this.return(method, args, opts);
        if (typeof value !== "number") {
            throw Error("Cannot convert return value to currency unit. Expect return value to be a number.");
        }
        let base = 0;
        if (typeof targetBase === "number") {
            base = targetBase;
        }
        else {
            switch (targetBase) {
                case "gkc":
                case "btc":
                    base = 0;
                    break;
                case "sat":
                case "satoshi":
                    base = -8;
                default:
                    throw Error(`Unknown base currency unit: ${targetBase}`);
            }
        }
        const satoshi = 1e-8;
        return value * satoshi / (10 ** base);
    }
    async returnAs(converter, method, args = [], opts = {}) {
        const value = await this.return(method, args, opts);
        return await converter(value);
    }
    /**
     * Create a transaction that calls a method using ABI encoding, and return the
     * RPC result as is. A transaction will require network consensus to confirm,
     * and costs you gas.
     *
     * @param method name of contract method to call
     * @param args arguments
     */
    async rawSend(method, args, opts = {}) {
        // TODO opts: gas limit, gas price, sender address
        const methodABI = this.methodMap.findMethod(method, args);
        if (methodABI == null) {
            throw new Error(`Unknown method to send: ${method}`);
        }
        if (methodABI.constant) {
            throw new Error(`cannot send to a constant method: ${method}`);
        }
        const calldata = abi_1.encodeInputs(methodABI, args);
        return this.rpc.sendToContract(Object.assign({ address: this.address, datahex: calldata, senderAddress: opts.senderAddress || this.info.sender }, opts));
    }
    /**
     * Confirms an in-wallet transaction, and return the receipt.
     *
     * @param txid transaction id. Must be an in-wallet transaction
     * @param confirm how many confirmations to ensure
     * @param onConfirm callback that receives the receipt for each additional confirmation
     */
    async confirm(txid, confirm, onConfirm) {
        const txrp = new TxReceiptPromise_1.TxReceiptPromise(this.rpc, txid);
        if (onConfirm) {
            txrp.onConfirm((tx2, receipt2) => {
                const sendTxReceipt = this._makeSendTxReceipt(receipt2);
                onConfirm(tx2, sendTxReceipt);
            });
        }
        const receipt = await txrp.confirm(confirm);
        return this._makeSendTxReceipt(receipt);
    }
    /**
     * Returns the receipt for a transaction, with decoded event logs.
     *
     * @param txid transaction id. Must be an in-wallet transaction
     * @returns The receipt, or null if transaction is not yet confirmed.
     */
    async receipt(txid) {
        const receipt = await this.rpc.getTransactionReceipt({ txid });
        if (!receipt) {
            return null;
        }
        return this._makeSendTxReceipt(receipt);
    }
    async send(method, args = [], opts = {}) {
        const methodABI = this.methodMap.findMethod(method, args);
        if (methodABI == null) {
            throw new Error(`Unknown method to send: ${method}`);
        }
        if (methodABI.constant) {
            throw new Error(`cannot send to a constant method: ${method}`);
        }
        const calldata = abi_1.encodeInputs(methodABI, args);
        const sent = await this.rpc.sendToContract(Object.assign({ datahex: calldata, address: this.address, senderAddress: opts.senderAddress || this.info.sender }, opts));
        const txid = sent.txid;
        const txinfo = await this.rpc.getTransaction({ txid });
        const sendTx = Object.assign({}, txinfo, { method, confirm: (n, handler) => {
                return this.confirm(txid, n, handler);
            } });
        return sendTx;
    }
    /**
     * Get contract event logs, up to the latest block. By default, it starts looking
     * for logs from the beginning of the blockchain.
     * @param req
     */
    async logs(req = {}) {
        return this.waitLogs(Object.assign({ fromBlock: 0, toBlock: -1 }, req));
    }
    /**
     * Get contract event logs. Long-poll wait if no log is found.
     * @param req (optional) IRPCWaitForLogsRequest
     */
    async waitLogs(req = {}) {
        // const filter = req.filter || {}
        let addresses = req.addresses;
        if (!addresses) {
            addresses = [this.address];
        }
        const loop = async () => {
            let currCount = 0;
            while (true) {
                const count = await this.rpc.rawCall("getblockcount");
                if (currCount > 0 && count > currCount) {
                    return;
                }
                currCount = count;
                await sleep_1.sleep(1000);
            }
        };
        await loop();
        const result = await this.rpc.searchlogs(Object.assign({}, req, { addresses }));
        let lastBlock = 0;
        const entries = result.map((entry) => {
            const parsedLog = this.logDecoder.decode(entry.log[0]);
            lastBlock = entry.blockNumber > lastBlock ? entry.blockNumber : lastBlock;
            return Object.assign({}, entry, { event: parsedLog });
        });
        return {
            entries,
            count: entries.length,
            nextblock: lastBlock + 1
        };
    }
    /**
     * Subscribe to contract's events, using callback interface.
     */
    onLog(fn, opts = {}) {
        let nextblock = opts.fromBlock || "latest";
        const loop = async () => {
            while (true) {
                const result = await this.waitLogs(Object.assign({}, opts, { fromBlock: nextblock }));
                for (const entry of result.entries) {
                    fn(entry);
                }
                nextblock = result.nextblock;
            }
        };
        loop();
    }
    /**
     * Subscribe to contract's events, use EventsEmitter interface.
     */
    logEmitter(opts = {}) {
        const emitter = new eventemitter3_1.EventEmitter();
        this.onLog((entry) => {
            const key = (entry.event && entry.event.type) || "?";
            emitter.emit(key, entry);
        }, opts);
        return emitter;
    }
    get logDecoder() {
        return this._logDecoder;
    }
    _makeSendTxReceipt(receipt) {
        // https://stackoverflow.com/a/34710102
        // ...receiptNoLog will be a copy of receipt, without the `log` property
        const { log: rawlogs } = receipt, receiptNoLog = __rest(receipt, ["log"]);
        const logs = rawlogs.map((rawLog) => this.logDecoder.decode(rawLog));
        return Object.assign({}, receiptNoLog, { logs,
            rawlogs });
    }
}
exports.Contract = Contract;
