import { Bool, Int64, Provable } from 'o1js';
export class AssertiveInt64 extends Int64 {
    /*
   * Asserts that x is greater than y, i.e. x > y.
   * Properly uses provable code with assertions.
   */
    isGreaterThan(other) {
        /*
          if both signs are Positive:
              the largest maginitude is greater
          if both signs are Negative:
              the smallest maginitude is greater
         
          if signs are different:
              the postivie number is greater
    
          special case for 0: always false
        */
        // 1. Are the signs the same?
        // if they're the same, the their multiplication's result is a positive sign
        const signMuliplictaion = this.sgn.mul(other.sgn);
        const isSignsEqual = Provable.if(signMuliplictaion.isPositive(), Bool(true), Bool(false));
        // 2. For the case of the signs begin equal, we need to decide wether the one with the largest magintude
        const isXiMagnitudeLargerThanY = Provable.if(this.magnitude.greaterThan(other.magnitude), Bool(true), Bool(false));
        const isXMagitudeSmallerThanY = Provable.if(this.magnitude.lessThan(other.magnitude), Bool(true), Bool(false));
        const isXandYZero = Provable.if(this.equals(Int64.from(0)).and(other.equals(Int64.from(0))), Bool(true), Bool(false));
        let isXGreaterThanYIfXandYAreEqual = Provable.if(this.sgn.isPositive(), isXiMagnitudeLargerThanY, isXMagitudeSmallerThanY);
        // spcial case for 0: always false
        isXGreaterThanYIfXandYAreEqual = Provable.if(isXandYZero, Bool(false), isXGreaterThanYIfXandYAreEqual);
        // 3. For the case of the signs being different, the positive number is always greater.
        const isXGreaterThanYIfTheSignsAreDifferent = Provable.if(this.sgn.isPositive(), Bool(true), Bool(false));
        // 4. If the sings are equal, we return the result o 2. (isXGreaterThanYIfXandYAreEqual), otherwise we return the result of 3. (isXGreaterThanYIfTheSignsAreDifferent).
        const isXGreaterThanY = Provable.if(isSignsEqual, isXGreaterThanYIfXandYAreEqual, isXGreaterThanYIfTheSignsAreDifferent);
        return isXGreaterThanY;
    }
}
//# sourceMappingURL=Types.js.map