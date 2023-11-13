var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Field, SmartContract, state, State, method, Struct, Provable, } from 'o1js';
export class Batch extends Struct({
    batch: Provable.Array(Field, 2),
}) {
}
export class MyContract extends SmartContract {
    constructor() {
        super(...arguments);
        this.sum = State();
    }
    processFields(my_args) {
        const fieldSum = my_args.reduce((a, b) => a.add(b), Field(0));
        this.sum.set(my_args.reduce((a, b) => a.add(b), Field(0)));
    }
}
__decorate([
    state(Field),
    __metadata("design:type", Object)
], MyContract.prototype, "sum", void 0);
__decorate([
    method,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array]),
    __metadata("design:returntype", void 0)
], MyContract.prototype, "processFields", null);
//# sourceMappingURL=Recursion.js.map