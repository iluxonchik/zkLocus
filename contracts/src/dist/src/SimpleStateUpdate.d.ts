import { Field, SmartContract, State } from 'o1js';
export declare class SimpleStateUpdate extends SmartContract {
    num: State<import("o1js/dist/node/lib/field").Field>;
    init(): void;
    incrementBy(value: Field): void;
}
