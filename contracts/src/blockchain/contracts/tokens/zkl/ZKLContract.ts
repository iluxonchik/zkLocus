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
    SUPPLY_CAP: UInt64 = UInt64.from(10n**18n);
    @state(UInt64) circulatingSupply = State<UInt64>();
  
    deploy(args: DeployArgs) {
      super.deploy(args);
  
      const permissionToEdit = Permissions.proof();
      

    // Temporarily all set to proof, will be refined later
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

      @method sendTo(
        senderAddress: PublicKey,
        receiverAddress: PublicKey,
        amount: UInt64
      ) {
        this.token.send({
          from: senderAddress,
          to:receiverAddress,
          amount: amount,
        });
      }

      /**
       * ⚠️ WARNING: ITERATIVE PROTOTYPE
       * 
       * $ZKL is being developed iteratively, and this is a part of its developing functionality.
       * For now, this method has not protections.
       *
       *  Move $ZKL from one address to another.
       * @param senderAddress 
       * @param receiverAddress 
       * @param amount 
       */
      @method sendFromTo(
        senderAddress: PublicKey,
        receiverAddress: PublicKey,
        amount: UInt64
      ) {
        this.token.send({
          from: senderAddress,
          to:receiverAddress,
          amount: amount,
        });
      }
}