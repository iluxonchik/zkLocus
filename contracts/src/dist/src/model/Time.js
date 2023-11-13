import { Field, Struct, Poseidon } from "o1js";
export class IntervalTimestamp extends Struct({
    start: Field,
    end: Field,
}) {
    hash() {
        return Poseidon.hash([this.start, this.end]);
    }
    assertIsValid() {
        this.start.assertLessThanOrEqual(this.end);
    }
}
;
class IntervalTimeStamp extends Struct({
    start: Field,
    end: Field,
}) {
}
//# sourceMappingURL=Time.js.map