import { Int64 } from "o1js";
import { ZKNumber } from "../../api/models/ZKNumber";

describe('ZKNumber Class Tests', () => {
    it('testZKNumberConstructionWithValueTypeNumber', () => {
        const value = 123;
        const zkNumber = new ZKNumber(value);
        expect(zkNumber.raw).toBe(value);
        expect(zkNumber.normalized).toBe(Math.round(value));
    });

    it('testZKNumberConstructionWithValueTypeString', () => {
        const value = "456";
        const zkNumber = new ZKNumber(value);
        expect(zkNumber.raw).toBe(value);
        expect(zkNumber.normalized).toBe(Math.round(Number(value)));
    });

    it('testZKNumberToRawValue', () => {
        const value = 789;
        const zkNumber = new ZKNumber(value);
        expect(zkNumber.rawValue()).toBe(value);
    });

    it('testZKNumberToNormalizedValue', () => {
        const value = 101112;
        const zkNumber = new ZKNumber(value);
        expect(zkNumber.normalizedValue()).toBe(Math.round(value));
    });

    it('testZKNumberToZKValue', () => {
        const value = 131415;
        const zkNumber = new ZKNumber(value) as any; // Type casting to use extended methods
        expect(zkNumber.toZKValue()).toEqual(Int64.from(Math.round(value)));
    });
});
    