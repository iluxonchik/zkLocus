
import { Account, AccountUpdate, Field, Mina, PrivateKey, PublicKey, Signature, UInt64 } from "o1js";
import { ZKLContract } from "../../../../blockchain/contracts/tokens/zkl/ZKLContract";
import { BountyBulletinBoardContract } from "../../../../blockchain/contracts/bounty/BountyBulletinBoardContract";
import path from "path";
import fs from "fs";
import { fileURLToPath } from 'url';
import { dirname } from 'path';

describe('ZKL Token Smart Contract', async () => {
  const Local = await Mina.LocalBlockchain();
  Local.setProofsEnabled(false);
  // let Berkeley = Mina.Network('https://proxy.berkeley.minaexplorer.com/graphql');
  let zklSC: ZKLContract;
  const deployerPrivateKey: PrivateKey = Local.testAccounts[0].key;
  //const feePayer: PrivateKey = PrivateKey.fromBase58(PRIVATE_KEY)
  const deployerPublicKey: PublicKey = deployerPrivateKey.toPublicKey();

  const interactor1PrivateKey: PrivateKey = Local.testAccounts[1].key;
  const interactor1PublicKey: PublicKey = interactor1PrivateKey.toPublicKey();

  const interactor2PrivateKey: PrivateKey = Local.testAccounts[2].key;
  const interactor2PublicKey: PublicKey = interactor2PrivateKey.toPublicKey();

  const transactionFee: number = 100_000_000;

  const zklAppPrivateKey: PrivateKey = PrivateKey.random();
  const zklAppAddress: PublicKey = zklAppPrivateKey.toPublicKey();

  const bbbAppprivateKey: PrivateKey = PrivateKey.random();
  const bbbAppAddress: PublicKey = bbbAppprivateKey.toPublicKey();

  zklSC = new ZKLContract(zklAppAddress);
  const bbbSC: BountyBulletinBoardContract = new BountyBulletinBoardContract(bbbAppAddress);
  
  const firstFundedAddr: PublicKey = bbbSC.deriveBountyAccountAddress(interactor1PublicKey, UInt64.from(1));


  const publicKeyToName = {
  [interactor1PublicKey.toBase58()]: { publicKey: interactor1PublicKey, name: 'Interactor 1' },
  [interactor2PublicKey.toBase58()]: { publicKey: interactor2PublicKey, name: 'Interactor 2' },
  [deployerPublicKey.toBase58()]: { publicKey: deployerPublicKey, name: 'Deployer' },
  [zklAppAddress.toBase58()]: { publicKey: zklAppAddress, name: 'ZKL App' },
  [bbbAppAddress.toBase58()]: { publicKey: bbbAppAddress, name: 'BBB App' },
  [firstFundedAddr.toBase58()]: { publicKey: firstFundedAddr, name: 'First Funded Public Key' },
};

  beforeAll(async () => {
    console.log("Compiling circuits...");
    const startTime = Date.now();
    // Empty here for now
    const endTime = Date.now();
    console.log("Compilation complete!");
    console.log(`Proofs compilation took ${endTime - startTime} milliseconds.`);

    Mina.setActiveInstance(Local);
    //Mina.setActiveInstance(Berkeley);

    console.log("Compiling smart contracts...");
    const startTimeSC = Date.now();
    const zklContractVerificationKey: { data: string, hash: Field } = (await ZKLContract.compile()).verificationKey;
    const bbbContractVerificationKey: { data: string, hash: Field } = (await BountyBulletinBoardContract.compile()).verificationKey;
    const endTimeSC = Date.now();
    console.log("Compilation complete!");
    console.log(`Smart contract compilation took ${endTimeSC - startTimeSC} milliseconds.`);

    console.log("Deploying $ZKL smart contract...");
    const txn1 = await Mina.transaction({ sender: deployerPublicKey, fee: transactionFee }, async () => {
      AccountUpdate.fundNewAccount(deployerPublicKey);
      await zklSC.deploy({ verificationKey: zklContractVerificationKey});
    });
    await txn1.prove();
    txn1.sign([deployerPrivateKey, zklAppPrivateKey]);
    await txn1.send();
    console.log("$ZKL smart contract deployed!");

    console.log(txn1.toGraphqlQuery());
    console.log();
    console.log(txn1.toJSON());

    console.log("Deploying $BBB smart contract...");
    const txn2 = await Mina.transaction({ sender: deployerPublicKey, fee: transactionFee }, async () => {
      AccountUpdate.fundNewAccount(deployerPublicKey);
      await bbbSC.deploy({ verificationKey: bbbContractVerificationKey });
    });
    await txn2.prove();
    txn2.sign([deployerPrivateKey, bbbAppprivateKey]);
    await txn2.send();
    console.log("$BBB smart contract deployed!");
  });

type PublicKeyWithName = {
  publicKey: PublicKey;
  name: string;
};

async function printBalances(publicKeyToName: Record<string, PublicKeyWithName>, label: string) {
  const balances = [];

  for (const { publicKey, name } of Object.values(publicKeyToName)) {
    const balance: Record<string, string> = { 'Address': publicKey.toBase58()};
    balance['Account Name'] = name;

    try {
      const zklBalance = Mina.getBalance(publicKey, zklSC.deriveTokenId()).value.toBigInt();
      balance['$ZKL'] = zklBalance.toString();
    } catch (error) {
      balance['$ZKL'] = '-';
    }

    try {
      const bbbBalance = Mina.getBalance(publicKey, bbbSC.deriveTokenId()).value.toBigInt();
      balance['$BBB'] = bbbBalance.toString();
    } catch (error) {
      balance['$BBB'] = '-';
    }

    balances.push(balance);
  }

  console.log(label);
  console.table(balances);
}

  describe('Initial state checks', () => {
    it('Initial supply is zero', async () => {
      const totalSupply: UInt64 = zklSC.circulatingSupply.get();
      expect(totalSupply.equals(UInt64.zero).toBoolean()).toBe(true);
    });
  });

  describe('Minting checks', () => {
    it('Minting tokens to own zkApp succeeds', async () => {
      const mintAmount: UInt64 = UInt64.from(1);

      const mintTxn = await Mina.transaction(
        deployerPrivateKey.toPublicKey(), async () => {
          AccountUpdate.fundNewAccount(deployerPrivateKey.toPublicKey());
          await zklSC.mint(zklAppAddress, mintAmount);
        });

      console.log("Proving mint transaction...")
      await mintTxn.prove();
      await mintTxn.sign([deployerPrivateKey]).send();
      console.log("Mint transaction proved!");

      // Ensure the tokens got sent to the desired address
      const zkAppBalance: bigint = Mina.getBalance(zklAppAddress, zklSC.deriveTokenId()).value.toBigInt();
      const expectedZkAppBalance: bigint = mintAmount.toBigInt();
      expect(zkAppBalance).toEqual(expectedZkAppBalance);

      // Ensure the total supply has been correctly updated
      const obtainedTotalSupply: bigint = zklSC.circulatingSupply.get().toBigInt();
      const expectedTotalSupply: bigint = mintAmount.toBigInt();
      expect(obtainedTotalSupply).toEqual(expectedTotalSupply);
    });

    describe('Bounty Bulletin Board Integration Basics', () => {

      it('Minting $BBL_ZKL from $ZKL works', async () => {
        const mintAmount: UInt64 = UInt64.from(100000);

        const mintTxn = await Mina.transaction(
          interactor1PublicKey, async () => {
            AccountUpdate.fundNewAccount(interactor1PublicKey);
            await zklSC.mint(deployerPublicKey, mintAmount);
          });
        console.log(`Proving mint of ${mintAmount} of $ZKL...`);
        await mintTxn.prove();
        await mintTxn.sign([interactor1PrivateKey]).send();
        console.log(`Mint of ${mintAmount} of $ZKL proved!`);

        // At this point, the feePayerPublicKey should `mintAmount` of $ZKL
        // Now, let's mint $BBB_ZKL from $ZKL
        console.log(`Minting ${mintAmount} of $BBB_ZKL from $ZKL...`);
        const mintAmountBBB: UInt64 = UInt64.from(10);
        const mintFromZKLtxn = await Mina.transaction(
          deployerPublicKey, async () => {
            AccountUpdate.fundNewAccount(deployerPublicKey, 2);
            await bbbSC.mintFromZKL(zklSC.address, mintAmountBBB);
          });

        console.log("\t - Proving mint transaction...");

        await mintFromZKLtxn.prove();
        await mintFromZKLtxn.sign([deployerPrivateKey]).send();

        console.log("\tMint transaction proved!");

        // Confirm balances are correct
        const zkAppBalance: bigint = Mina.getBalance(deployerPublicKey, zklSC.deriveTokenId()).value.toBigInt();
        const expectedZkAppBalance: bigint = mintAmount.toBigInt() - mintAmountBBB.toBigInt();
        expect(zkAppBalance).toEqual(expectedZkAppBalance);

        const bbbAppBalance: bigint = Mina.getBalance(deployerPublicKey, bbbSC.deriveTokenId()).value.toBigInt();
        const expectedBbbAppBalance: bigint = mintAmountBBB.toBigInt();
        expect(bbbAppBalance).toEqual(expectedBbbAppBalance);
      });


      it('Funding a bounty with $ZKL works as epxected', async () => {
        // TODO: this is the test method that I'm currently developing
        const mintAmount: UInt64 = UInt64.from(100000);

        const mintTxn = await Mina.transaction(
          interactor2PublicKey, async () => {
            AccountUpdate.fundNewAccount(interactor2PublicKey);
            await zklSC.mint(interactor1PublicKey, mintAmount);
          });

        console.log(`Proving mint of ${mintAmount} of $ZKL...`);
        await mintTxn.prove();
        await mintTxn.sign([interactor2PrivateKey]).send();
        console.log(`Mint of ${mintAmount} of $ZKL proved!`);

        // At this point, the feePayerPublicKey should `mintAmount` of $ZKL
        // Now, let's mint $BBB_ZKL from $ZKL
        console.log(`Minting ${mintAmount} of $BBB_ZKL from $ZKL...`);
        const mintAmountBBB: UInt64 = UInt64.from(10);
        const mintFromZKLtxn = await Mina.transaction(
          interactor1PublicKey, async () => {
            AccountUpdate.fundNewAccount(interactor1PublicKey, 2);
            await bbbSC.mintFromZKL(zklSC.address, mintAmountBBB);
          });

        console.log("\t - Proving mint transaction...");

        await mintFromZKLtxn.prove();
        await mintFromZKLtxn.sign([interactor1PrivateKey]).send();

        console.log("\tMint transaction proved!");

        // Confirm balances are correct
        const zklInteractor1Balance: bigint = Mina.getBalance(interactor1PublicKey, zklSC.deriveTokenId()).value.toBigInt();
        const expectedZKLInteractor1Balance: bigint = mintAmount.toBigInt() - mintAmountBBB.toBigInt();
        expect(zklInteractor1Balance).toEqual(expectedZKLInteractor1Balance);

        const bbbInteractor1Balance: bigint = Mina.getBalance(interactor1PublicKey, bbbSC.deriveTokenId()).value.toBigInt();
        const expectedBBBInteractor1Balance: bigint = mintAmountBBB.toBigInt();
        expect(bbbInteractor1Balance).toEqual(expectedBBBInteractor1Balance);

        console.log("Funding bounty with $BBB");

        let fundedPubKey = bbbSC.deriveBountyAccountAddress(interactor1PublicKey, UInt64.from(1));
        const fundBountyTxn = await Mina.transaction(
          interactor1PublicKey, async () => {
            AccountUpdate.fundNewAccount(interactor1PublicKey, 1);
            fundedPubKey = await bbbSC.fundBounty(
              interactor1PublicKey,
              UInt64.from(1),
              mintAmountBBB,
            )
          });

        console.log("\t - Proving fundBounty() transaction...");

        await fundBountyTxn.prove();
        await fundBountyTxn.sign([interactor1PrivateKey]).send();

        // Confirm balances are correct
        const fundedPubKeyBlanace: bigint = Mina.getBalance(fundedPubKey, bbbSC.deriveTokenId()).value.toBigInt();
        const expectedPubKeyBalance: bigint = mintAmountBBB.toBigInt();
        expect(fundedPubKeyBlanace).toEqual(expectedPubKeyBalance);
      });

      it.only('Claiming a bounty with $ZKL works as epxected', async () => {
        // TODO: this is the test method that I'm currently developing
        const mintAmount: UInt64 = UInt64.from(100000);


        await printBalances(publicKeyToName, "Initial state");

        const mintTxn = await Mina.transaction(
          interactor1PublicKey, async () => {
            AccountUpdate.fundNewAccount(interactor1PublicKey);
            await zklSC.mint(interactor1PublicKey, mintAmount);
          });

        console.log(`Proving mint of ${mintAmount} of $ZKL to ${interactor1PublicKey.toBase58()}...`);
        await mintTxn.prove();
        await mintTxn.sign([interactor1PrivateKey]).send();
        console.log(`Mint of ${mintAmount} of $ZKL proved!`);


        await printBalances(publicKeyToName, "After $ZKL Mint");


        // At this point, the feePayerPublicKey should `mintAmount` of $ZKL
        // Now, let's mint $BBB_ZKL from $ZKL
        console.log(`Minting ${mintAmount} of $BBB_ZKL from $ZKL for ${interactor1PublicKey.toBase58()}...`);
        const mintAmountBBB: UInt64 = UInt64.from(10);
        const mintFromZKLtxn = await Mina.transaction(
          interactor1PublicKey, async () => {
            AccountUpdate.fundNewAccount(interactor1PublicKey, 2);
            await bbbSC.mintFromZKL(zklSC.address, mintAmountBBB);
          });

        console.log("\t - Proving mint transaction...");

        await mintFromZKLtxn.prove();
        await mintFromZKLtxn.sign([interactor1PrivateKey]).send();


        await printBalances(publicKeyToName, "After $BBB Mint from $ZKL");

        console.log("\tMint transaction proved!");

        console.log(`Funding bounty with $BBB from ${interactor1PublicKey.toBase58()}...`);

        let fundedPubKey: PublicKey | undefined = undefined;
        const fundBountyTxn = await Mina.transaction(
          interactor1PublicKey, async () => {
            AccountUpdate.fundNewAccount(interactor1PublicKey, 1);
            fundedPubKey = await bbbSC.fundBounty(
              interactor1PublicKey,
              UInt64.from(1),
              mintAmountBBB,
            )
          });

        if (fundedPubKey === undefined) {
          throw new Error("fundedPubKey is undefined");
        }
        fundedPubKey = fundedPubKey as PublicKey;
        
        const confirmedFundedPubKey = fundedPubKey as PublicKey;

        console.log("\t - Proving fundBounty() transaction...");

        await fundBountyTxn.prove();
        await fundBountyTxn.sign([interactor1PrivateKey]).send();

        console.log("\t - fundBounty() transaction proved and sent to network!");

        // Burn $BBB_ZKL to $ZKL
        console.log(`Claiming bounty by ${interactor2PublicKey.toBase58()}...`);



        await printBalances(publicKeyToName, "After Fund Bounty");

        const claimBountyTxn = await Mina.transaction(
          interactor2PublicKey, async () => {
            AccountUpdate.fundNewAccount(interactor2PublicKey, 1);
            await bbbSC.claimBounty(interactor1PublicKey, UInt64.from(1));
          });

        // const claimBountyTxn: Mina.Transaction = await Mina.transaction(
        //   interactor2PublicKey, () => {
        //     AccountUpdate.fundNewAccount(interactor2PublicKey, 1);
            
        //     let au1 = AccountUpdate.create(confirmedFundedPubKey, bbbSC.deriveTokenId());
            
        //     let balance: UInt64 = au1.account.balance.getAndRequireEquals();
        //     au1.balance.subInPlace(balance);
        //     bbbSC.approveUpdate(au1);

        //     let au2 = AccountUpdate.create(interactor2PublicKey, bbbSC.deriveTokenId());
        //     au2.balance.addInPlace(balance);
        //     bbbSC.approveUpdate(au2);
        //   });

        console.log("\t - Proving claimBounty() transaction...");

        await claimBountyTxn.prove();
        claimBountyTxn.sign([interactor2PrivateKey]);
          
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = dirname(__filename);

        const jsonData = JSON.stringify(JSON.parse(claimBountyTxn.toJSON()), null, 2);
        fs.writeFileSync(path.join(__dirname, 'output.json'), jsonData);
        await claimBountyTxn.send();

        console.log("\t - claimBounty() transaction proved and sent to network!");
        
        await printBalances(publicKeyToName, "After Claim Bounty");

        // Confirm balances are correct:
        // 1. The bounty $BBB_ZKL balance should be zero
        // 2. The $ZKL amount of claimer is incremented by the bounty amount

        const bountyBalance: bigint = Mina.getBalance(fundedPubKey, bbbSC.deriveTokenId()).value.toBigInt();
        expect(bountyBalance).toEqual(0);

        const claimerBalance: bigint = Mina.getBalance(interactor2PublicKey, zklSC.deriveTokenId()).value.toBigInt();
        const expectedClaimerBalance: bigint = mintAmountBBB.toBigInt();
        expect(claimerBalance).toEqual(expectedClaimerBalance);


      });

      it('Account without balance raises exception', async () => {
        const newAccount = Local.testAccounts[2].key;
        expect(Mina.getBalance(newAccount.toPublicKey(), zklSC.deriveTokenId())).rejects.toThrow();

      });
    });

  })
}
);
