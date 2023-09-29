import {
  Field,
  Experimental,
  SelfProof,
  SmartContract,
  state,
  State,
  method,
  Struct,
  Provable,
} from 'o1js';

export class Batch extends Struct({
  batch: Provable.Array(Field, 2),
}) {}

export class MyContract extends SmartContract {
  @state(Field) sum = State<Field>();

  @method
  processFields(my_args: Field[]) {
    const fieldSum = my_args.reduce((a, b) => a.add(b), Field(0));
    this.sum.set(my_args.reduce((a, b) => a.add(b), Field(0)));
  }
}
