import { Int64Prover } from "./Provers.js";
export class Int64Asserter {
    static assertInt64XNotEqualsInt64Y(x, y) {
        const isXEqualToY = Int64Prover.provableIsInt64XEqualToInt64Y(x, y);
        isXEqualToY.assertFalse();
    }
}
//# sourceMappingURL=Asserters.js.map