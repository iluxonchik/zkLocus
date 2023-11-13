import { Bool, Int64, Provable } from "o1js";
export class Int64Prover {
    /*
  * Asserts that x is greater than y, i.e. x > y.
  * Properly uses provable code with assertions.
  */
    static provableIsInt64XGreaterThanY(x, y) {
        /*
          if both signs are Positive:
              the largest maginitude is greater
          if both signs are Negative:
              the smallest maginitude is greater
         
          if signs are different:
              the postivie number is greater
      
          special case for x == y: always false
        */
        // 1. Are the signs the same?
        // if they're the same, the their multiplication's result is a positive sign
        const signMuliplictaion = x.sgn.mul(y.sgn);
        const isSignsEqual = Provable.if(signMuliplictaion.isPositive(), Bool(true), Bool(false));
        // 2. For the case of the signs begin equal, we need to decide wether the one with the largest magintude
        const isXiMagnitudeLargerThanY = Provable.if(x.magnitude.greaterThan(y.magnitude), Bool(true), Bool(false));
        const isXMagitudeSmallerThanY = Provable.if(x.magnitude.lessThan(y.magnitude), Bool(true), Bool(false));
        const isXandYEqual = Provable.if(x.equals(y), Bool(true), Bool(false));
        let isXGreaterThanYIfXandYAreEqual = Provable.if(x.sgn.isPositive(), isXiMagnitudeLargerThanY, isXMagitudeSmallerThanY);
        // spcial case for x == y: always false
        isXGreaterThanYIfXandYAreEqual = Provable.if(isXandYEqual, Bool(false), isXGreaterThanYIfXandYAreEqual);
        // 3. For the case of the signs being different, the positive number is always greater.
        const isXGreaterThanYIfTheSignsAreDifferent = Provable.if(x.sgn.isPositive(), Bool(true), Bool(false));
        // 4. If the sings are equal, we return the result o 2. (isXGreaterThanYIfXandYAreEqual), otherwise we return the result of 3. (isXGreaterThanYIfTheSignsAreDifferent).
        const isXGreaterThanY = Provable.if(isSignsEqual, isXGreaterThanYIfXandYAreEqual, isXGreaterThanYIfTheSignsAreDifferent);
        return isXGreaterThanY;
    }
    static provableIsInt64XEqualToZero(x) {
        const isXZero = Provable.if(x.magnitude.equals(Int64.zero.magnitude), Bool(true), Bool(false));
        return isXZero;
    }
    static provableIsInt64XEqualToInt64Y(x, y) {
        const isXandYZero = Provable.if(this.provableIsInt64XEqualToZero(x).and(this.provableIsInt64XEqualToZero(y)), Bool(true), Bool(false));
        const isMaginitudeEqual = Provable.if(x.magnitude.equals(y.magnitude), Bool(true), Bool(false));
        const isSignEqual = Provable.if(x.sgn.equals(y.sgn), Bool(true), Bool(false));
        const isSignAndMaginitudeEqual = Provable.if(isMaginitudeEqual.and(isSignEqual), Bool(true), Bool(false));
        const isXEqualToY = Provable.if(isXandYZero, Bool(true), isSignAndMaginitudeEqual);
        return isXEqualToY;
    }
    /**
     * Proves wether x is less than y and returns the result.
     * The logic is defiend in terms of greaterThan and Equality:
     * x is less than y only if not(x is more than y) and not(x is equal to y)
     * @param x left operatnd Int64
     * @param y right operand Int64
     */
    static provableIsInt64XLessThanY(x, y) {
        const isXGreaterThanY = Int64Prover.provableIsInt64XGreaterThanY(x, y);
        const isXEqualToY = Provable.if(x.equals(y), Bool(true), Bool(false));
        const isXLessThanY = Provable.if(isXGreaterThanY.not().and(isXEqualToY.not()), Bool(true), Bool(false));
        return isXLessThanY;
    }
    static provableIsInt64XLessThanOrEqualY(x, y) {
        const isXGreaterThanY = Int64Prover.provableIsInt64XGreaterThanY(x, y);
        return isXGreaterThanY.not();
    }
}
//# sourceMappingURL=Provers.js.map