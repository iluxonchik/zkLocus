import {
    SmartContract,
    state,
    State,
    method,
    DeployArgs,
    Permissions,
    UInt64,
    PublicKey,
    Signature,
  } from 'o1js';
  
  const tokenSymbol = 'ZKL';
    
  /**
   * Token contract for the $ZKL token - the ecosystem token for zkLocus.
   * 
   * The token is being developed iteratively, including it's interface.
   */
  export class ZKLContract extends SmartContract {
    @state(UInt64) totalAmountInCirculation = State<UInt64>();
  
    deploy(args: DeployArgs) {
      super.deploy(args);
  
      const permissionToEdit = Permissions.proof();
  
      this.account.permissions.set({
        ...Permissions.default(),
        editState: permissionToEdit,
        setTokenSymbol: permissionToEdit,
        send: permissionToEdit,
        receive: permissionToEdit,
      });
    }

    @method init() {
        super.init();
        this.account.tokenSymbol.set(tokenSymbol);
        this.totalAmountInCirculation.set(UInt64.zero);
      }

}