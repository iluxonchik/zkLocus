import { Bool, Int64 } from "o1js";
export declare class Int64Prover {
    static provableIsInt64XGreaterThanY(x: Int64, y: Int64): Bool;
    static provableIsInt64XEqualToZero(x: Int64): Bool;
    static provableIsInt64XEqualToInt64Y(x: Int64, y: Int64): Bool;
    /**
     * Proves wether x is less than y and returns the result.
     * The logic is defiend in terms of greaterThan and Equality:
     * x is less than y only if not(x is more than y) and not(x is equal to y)
     * @param x left operatnd Int64
     * @param y right operand Int64
     */
    static provableIsInt64XLessThanY(x: Int64, y: Int64): Bool;
    static provableIsInt64XLessThanOrEqualY(x: Int64, y: Int64): Bool;
}
