import { Field, SmartContract, state, State, method } from 'o1js';

export class SimpleStateUpdate extends SmartContract {
  @state(Field) num = State<Field>();

  init() {
    super.init();
    this.num.set(Field(1));
  }

  @method incrementBy(value: Field) {
    const currentNum: Field = this.num.get();
    this.num.assertEquals(currentNum);

    // perform state update
    this.num.set(currentNum.add(value));
    // ensure that the state update was actually performed to the expected value
    this.num.assertEquals(currentNum.add(value));
  }
}
