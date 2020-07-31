import { IABIMethod } from "./ethjs-abi";
import { EventEmitter } from "eventemitter3";
import { ContractLogDecoder } from "./abi";
import { IDecodedSolidityEvent, ITransactionLog } from "./index";
import { IRPCCallContractResult, IRPCGetTransactionReceiptBase, IRPCGetTransactionReceiptResult, IRPCGetTransactionResult, IRPCSendToContractResult, GkcRPC, ILogEntry, IRPCSearchLogsRequest } from "./GkcRPC";
export interface IContractSendTx {
    method: string;
    txid: string;
}
/**
 * The callback function invoked for each additional confirmation
 */
export declare type IContractSendConfirmationHandler = (tx: IRPCGetTransactionResult, receipt: IContractSendReceipt) => any;
/**
 * @param n Number of confirmations to wait for
 * @param handler The callback function invoked for each additional confirmation
 */
export declare type IContractSendConfirmFunction = (n?: number, handler?: IContractSendConfirmationHandler) => Promise<IContractSendReceipt>;
/**
 * Result of contract send.
 */
export interface IContractSendResult extends IRPCGetTransactionResult {
    /**
     * Name of contract method invoked.
     */
    method: string;
    /**
     * Wait for transaction confirmations.
     */
    confirm: IContractSendConfirmFunction;
}
/**
 * The minimal deployment information necessary to interact with a
 * deployed contract.
 */
export interface IContractInfo {
    /**
     * Contract's ABI definitions, produced by solc.
     */
    abi: IABIMethod[];
    /**
     * Contract's address
     */
    address: string;
    /**
     * The owner address of the contract
     */
    sender?: string;
}
/**
 * Deployment information stored
 */
export interface IDeployedContractInfo extends IContractInfo {
    name: string;
    deployName: string;
    txid: string;
    bin: string;
    binhash: string;
    createdAt: string;
    confirmed: boolean;
}
/**
 * The result of calling a contract method, with decoded outputs.
 */
export interface IContractCallResult extends IRPCCallContractResult {
    /**
     * ABI-decoded outputs
     */
    outputs: any[];
    /**
     * ABI-decoded logs
     */
    logs: Array<IDecodedSolidityEvent | null>;
}
/**
 * Options for `send` to a contract method.
 */
export interface IContractSendRequestOptions {
    /**
     * The amount in GKC to send. eg 0.1, default: 0
     */
    amount?: number | string;
    /**
     * gasLimit, default: 200000, max: 40000000
     */
    gasLimit?: number;
    /**
     * Gkc price per gas unit, default: 0.00000001, min:0.00000001
     */
    gasPrice?: number | string;
    /**
     * The quantum address that will be used as sender.
     */
    senderAddress?: string;
}
/**
 * Options for `call` to a contract method.
 */
export interface IContractCallRequestOptions {
    /**
     * The quantum address that will be used as sender.
     */
    senderAddress?: string;
}
/**
 * The transaction receipt for a `send` to a contract method, with the event
 * logs decoded.
 */
export interface IContractSendReceipt extends IRPCGetTransactionReceiptBase {
    /**
     * logs decoded using ABI
     */
    logs: IDecodedSolidityEvent[];
    /**
     * undecoded logs
     */
    rawlogs: ITransactionLog[];
}
export interface IContractLog<T> extends ILogEntry {
    event: T;
}
/**
 * A decoded contract event log.
 */
export interface IContractEventLog extends IRPCGetTransactionReceiptResult {
    /**
     * Solidity event, ABI decoded. Null if no ABI definition is found.
     */
    event?: IDecodedSolidityEvent | null;
}
/**
 * Query result of a contract's event logs.
 */
export interface IContractEventLogs {
    /**
     * Event logs, ABI decoded.
     */
    entries: IContractEventLog[];
    /**
     * Number of event logs returned.
     */
    count: number;
    /**
     * The block number to start query for new event logs.
     */
    nextblock: number;
}
export interface IContractInitOptions {
    /**
     * event logs decoder. It may know how to decode logs not whose types are not
     * defined in this particular contract's `info`. Typically ContractsRepo would
     * pass in a logDecoder that knows about all the event definitions.
     */
    logDecoder?: ContractLogDecoder;
    /**
     * If a contract's use case requires numbers more than 53 bits, use bn.js to
     * represent numbers instead of native JavaScript numbers. (default = false)
     */
    useBigNumber?: boolean;
}
/**
 * Contract represents a Smart Contract deployed on the blockchain.
 */
export declare class Contract {
    private rpc;
    info: IContractInfo;
    /**
     * The contract's address as hex160
     */
    address: string;
    private methodMap;
    private _logDecoder;
    private _useBigNumber;
    /**
     * Create a Contract
     *
     * @param rpc - The RPC object used to access the blockchain.
     * @param info - The deployment information about this contract. It includes the contract
     *      address, owner address, and ABI definition for methods and types.
     * @param opts - init options
     */
    constructor(rpc: GkcRPC, info: IContractInfo, opts?: IContractInitOptions);
    encodeParams(method: string, args?: any[]): string;
    /**
     * Call a contract method using ABI encoding, and return the RPC result as is.
     * This does not create a transaction. It is useful for gas estimation or
     * getting results from read-only methods.
     *
     * @param method name of contract method to call
     * @param args arguments
     */
    rawCall(method: string, args?: any[], opts?: IContractCallRequestOptions): Promise<IRPCCallContractResult>;
    /**
     * Executes contract method on your own local gkcd node as a "simulation"
     * using `callcontract`. It is free, and does not actually modify the
     * blockchain.
     *
     * @param method Name of the contract method
     * @param args Arguments for calling the method
     * @param opts call options
     */
    call(method: string, args?: any[], opts?: IContractCallRequestOptions): Promise<IContractCallResult>;
    /**
     * Call a method, and return only the first return value of the method. This
     * is a convenient syntatic sugar to get the return value when there is only
     * one.
     *
     * @param method Name of the contract method
     * @param args Arguments for calling the method
     * @param opts call options
     */
    return(method: string, args?: any[], opts?: IContractCallRequestOptions): Promise<any>;
    returnNumber(method: string, args?: any[], opts?: IContractCallRequestOptions): Promise<number>;
    /**
     * Call a method, and return the first return value as Date. It is assumed
     * that the returned value is unix second.
     *
     * @param method
     * @param args
     * @param opts
     */
    returnDate(method: string, args?: any[], opts?: IContractCallRequestOptions): Promise<Date>;
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
    returnCurrency(targetBase: number | string, method: string, args?: any[], opts?: IContractCallRequestOptions): Promise<number>;
    returnAs<T>(converter: (val: any) => T | Promise<T>, method: string, args?: any[], opts?: IContractCallRequestOptions): Promise<T>;
    /**
     * Create a transaction that calls a method using ABI encoding, and return the
     * RPC result as is. A transaction will require network consensus to confirm,
     * and costs you gas.
     *
     * @param method name of contract method to call
     * @param args arguments
     */
    rawSend(method: string, args: any[], opts?: IContractSendRequestOptions): Promise<IRPCSendToContractResult>;
    /**
     * Confirms an in-wallet transaction, and return the receipt.
     *
     * @param txid transaction id. Must be an in-wallet transaction
     * @param confirm how many confirmations to ensure
     * @param onConfirm callback that receives the receipt for each additional confirmation
     */
    confirm(txid: string, confirm?: number, onConfirm?: IContractSendConfirmationHandler): Promise<IContractSendReceipt>;
    /**
     * Returns the receipt for a transaction, with decoded event logs.
     *
     * @param txid transaction id. Must be an in-wallet transaction
     * @returns The receipt, or null if transaction is not yet confirmed.
     */
    receipt(txid: string): Promise<IContractSendReceipt | null>;
    send(method: string, args?: any[], opts?: IContractSendRequestOptions): Promise<IContractSendResult>;
    /**
     * Get contract event logs, up to the latest block. By default, it starts looking
     * for logs from the beginning of the blockchain.
     * @param req
     */
    logs(req?: IRPCSearchLogsRequest): Promise<IContractEventLogs>;
    /**
     * Get contract event logs. Long-poll wait if no log is found.
     * @param req (optional) IRPCWaitForLogsRequest
     */
    waitLogs(req?: IRPCSearchLogsRequest): Promise<IContractEventLogs>;
    /**
     * Subscribe to contract's events, using callback interface.
     */
    onLog(fn: (entry: IContractEventLog) => void, opts?: IRPCSearchLogsRequest): void;
    /**
     * Subscribe to contract's events, use EventsEmitter interface.
     */
    logEmitter(opts?: IRPCSearchLogsRequest): EventEmitter;
    private readonly logDecoder;
    private _makeSendTxReceipt;
}
