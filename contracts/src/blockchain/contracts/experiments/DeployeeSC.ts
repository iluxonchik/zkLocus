import { DeployArgs, PublicKey, SmartContract, State, state , Permissions, method, Field} from "o1js";

export class DeployeeSC extends SmartContract {
    @method deployDeployee(deployeeAddr: PublicKey) {
        
        const deployeeSC: DeployeeSC = new DeployeeSC();
    }
}