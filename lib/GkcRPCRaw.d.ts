import { CancelToken, CancelTokenSource } from "axios";
export interface IJSONRPCRequest {
    id: any;
    method: string;
    params: any[];
    auth?: string;
}
export interface IAuthorization {
    id: string;
    state: "pending" | "accepted" | "denied" | "consumed";
    request: IJSONRPCRequest;
    createdAt: string;
}
export interface IRPCCallOption {
    cancelToken?: CancelToken;
}
export declare class GkcRPCRaw {
    private _baseURL;
    private idNonce;
    private _api;
    constructor(_baseURL: string);
    cancelTokenSource(): CancelTokenSource;
    rawCall(method: string, params?: any[], opts?: IRPCCallOption): Promise<any>;
    private makeRPCCall;
    private authCall;
}
