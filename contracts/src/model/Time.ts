import { Field, Struct, Poseidon, UInt64 } from "o1js";


export class TimestampInterval extends Struct({
  start: UInt64,
  end: UInt64,
}) {
  hash() {
    return Poseidon.hash([this.start.value, this.end.value]);
  }

  toString(): string {
    return `Start: ${this.start.toString()}\nEnd: ${this.end.toString()}`;
  }

  assertIsValid(): void {
    this.end.assertLessThanOrEqual(this.start);
  }
}
;
  