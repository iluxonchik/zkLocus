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
   * 
   */
  export class ZKLContract extends SmartContract {
    SUPPLY_CAP: UInt64 = UInt64.from(1n**18n);
    @state(UInt64) circulatingSupply = State<UInt64>();
  
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
        this.circulatingSupply.set(UInt64.zero);
    }

    @method mint(
        receiverAddress: PublicKey,
        amount: UInt64,
        adminSignature: Signature
      ) {
        let totalCirculatingSupply: UInt64 = this.circulatingSupply.get();
        this.circulatingSupply.requireEquals(totalCirculatingSupply);
    
        const newTotalAmountInCirculation: UInt64 = totalCirculatingSupply.add(amount);
        newTotalAmountInCirculation.assertLessThanOrEqual(this.SUPPLY_CAP, "Cannot mint above the supply cap.")

        adminSignature
          .verify(
            this.address,
            amount.toFields().concat(receiverAddress.toFields())
          )
          .assertTrue();
    
        this.token.mint({
          address: receiverAddress,
          amount,
        });
    
        this.circulatingSupply.set(newTotalAmountInCirculation);
      }

}