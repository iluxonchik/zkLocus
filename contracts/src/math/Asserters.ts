import { Bool, Int64 } from "o1js";
import { Int64Prover } from "./Provers.js";


export class Int64Asserter {
    static assertInt64XNotEqualsInt64Y(x: Int64, y: Int64): void {
        const isXEqualToY: Bool = Int64Prover.provableIsInt64XEqualToInt64Y(x, y);
        isXEqualToY.assertFalse();
    }
}


