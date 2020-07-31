import { GkcRPCRaw } from "./GkcRPCRaw";
export interface IGetInfoResult {
    version: number;
    protocolversion: number;
    walletversion: number;
    balance: number;
    stake: number;
    blocks: number;
    timeoffset: number;
    connections: number;
    proxy: string;
    difficulty: {
        "proof-of-work": number;
        "proof-of-stake": number;
    };
    testnet: boolean;
    moneysupply: number;
    keypoololdest: number;
    keypoolsize: number;
    paytxfee: number;
    relayfee: number;
    errors: string;
}
export interface IRPCSendToContractRequest {
    /**
     * (required) The contract address that will receive the funds and data.
     */
    address: string;
    /**
     * (required) data to send
     */
    datahex: string;
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
export interface IRPCSendToContractResult {
    /**
     * The transaction id.
     */
    txid: string;
    /**
     * GKC address of the sender.
     */
    sender: string;
    /**
     * ripemd-160 hash of the sender.
     */
    hash160: string;
}
export interface IRPCCallContractRequest {
    /**
     * (required) The account address
     */
    address: string;
    /**
     * (required) The data hex string
     */
    datahex: string;
    /**
     * The sender address hex string
     */
    senderAddress?: string;
}
export interface IExecutionResult {
    gasUsed: number;
    excepted: string;
    newAddress: string;
    output: string;
    codeDeposit: number;
    gasRefunded: number;
    depositSize: number;
    gasForDeposit: number;
}
export interface IRPCCallContractResult {
    address: string;
    executionResult: IExecutionResult;
    transactionReceipt: {
        stateRoot: string;
        gasUsed: string;
        bloom: string;
        log: any[];
    };
}
export interface IRPCGetTransactionRequest {
    /**
     * The transaction id
     */
    txid: string;
    /**
     * (optional, default=false) Whether to include watch-only addresses in balance calculation and details[]
     */
    include_watchonly?: boolean;
    /**
     * (optional, default=0) Wait for enough confirmations before returning
     */
    waitconf?: number;
}
/**
 * Basic information about a transaction submitted to the network.
 */
export interface IRPCGetTransactionResult {
    amount: number;
    fee: number;
    confirmations: number;
    blockhash: string;
    blockindex: number;
    blocktime: number;
    txid: string;
    walletconflicts: any[];
    time: number;
    timereceived: number;
    "bip125-replaceable": "no" | "yes" | "unknown";
    details: any[];
    hex: string;
}
export interface IRPCGetTransactionReceiptRequest {
    /**
     * The transaction id
     */
    txid: string;
}
/**
 * Transaction receipt returned by gkcd
 */
export interface IRPCGetTransactionReceiptBase {
    blockHash: string;
    blockNumber: number;
    transactionHash: string;
    transactionIndex: number;
    from: string;
    to: string;
    cumulativeGasUsed: number;
    gasUsed: number;
    contractAddress: string;
}
export interface IRPCGetTransactionReceiptResult extends IRPCGetTransactionReceiptBase {
    log: ITransactionLog[];
}
export interface ITransactionLog {
    address: string;
    topics: string[];
    data: string;
}
export interface IRPCWaitForLogsRequest {
    /**
     * The block number to start looking for logs.
     */
    fromBlock?: number | "latest";
    /**
     * The block number to stop looking for logs. If null, will wait indefinitely into the future.
     */
    toBlock?: number | "latest";
    /**
     * Filter conditions for logs. Addresses and topics are specified as array of hexadecimal strings
     */
    filter?: ILogFilter;
    /**
     * Minimal number of confirmations before a log is returned
     */
    minconf?: number;
}
export interface ILogFilter {
    addresses?: string[];
    topics?: Array<string | null>;
}
/**
 * The raw log data returned by gkcd, not ABI decoded.
 */
export interface ILogEntry extends IRPCGetTransactionReceiptBase {
    /**
     * EVM log topics
     */
    topics: string[];
    /**
     * EVM log data, as hexadecimal string
     */
    data: string;
}
export interface IRPCWaitForLogsResult {
    entries: ILogEntry[];
    count: number;
    nextblock: number;
}
export interface IRPCSearchLogsRequest {
    /**
     * The number of the earliest block (latest may be given to mean the most recent block).
     * (default = "latest")
     */
    fromBlock?: number | "latest";
    /**
     * The number of the latest block (-1 may be given to mean the most recent block).
     * (default = -1)
     */
    toBlock?: number;
    /**
     * An address or a list of addresses to only get logs from particular account(s).
     */
    addresses?: string[];
    /**
     * An array of values which must each appear in the log entries.
     * The order is important, if you want to leave topics out use null, e.g. ["null", "0x00..."].
     */
    topics?: Array<string | null>;
    /**
     * Minimal number of confirmations before a log is returned
     * (default = 0)
     */
    minconf?: number;
}
export declare type IRPCSearchLogsResult = IRPCGetTransactionReceiptResult[];
export interface IPromiseCancel<T> extends Promise<T> {
    cancel: () => void;
}
export declare class GkcRPC extends GkcRPCRaw {
    private _hasTxWaitSupport;
    getInfo(): Promise<IGetInfoResult>;
    sendToContract(req: IRPCSendToContractRequest): Promise<IRPCSendToContractResult>;
    callContract(req: IRPCCallContractRequest): Promise<IRPCCallContractResult>;
    getTransaction(req: IRPCGetTransactionRequest): Promise<IRPCGetTransactionResult>;
    getTransactionReceipt(req: IRPCGetTransactionRequest): Promise<IRPCGetTransactionReceiptResult | null>;
    /**
     * Long-poll request to get logs. Cancel the returned promise to terminate polling early.
     */
    waitforlogs(req?: IRPCWaitForLogsRequest): IPromiseCancel<IRPCWaitForLogsResult>;
    searchlogs(_req?: IRPCSearchLogsRequest): Promise<IRPCSearchLogsResult>;
    checkTransactionWaitSupport(): Promise<boolean>;
    fromHexAddress(hexAddress: string): Promise<string>;
    getHexAddress(address: string): Promise<string>;
}
