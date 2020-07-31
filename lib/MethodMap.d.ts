import { IABIMethod } from "./index";
/**
 * Build an index of a contract's ABI definitions.
 */
export declare class MethodMap {
    private methods;
    constructor(_methods: IABIMethod[]);
    /**
     * Solidity allows method name overloading. If there's no ambiguity, allow
     * the name of the method as selector. If there is ambiguity (same number
     * of arguments, different types), must use the method signature.
     *
     * Example:
     *
     *   foo(uint a, uint b)
     *
     *   The method name is `foo`.
     *   The method signature is `foo(uint, uint)`
     */
    findMethod(selector: string, args?: any[]): IABIMethod | undefined;
}
