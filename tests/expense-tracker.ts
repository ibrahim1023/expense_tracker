import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { ExpenseTracker } from "../target/types/expense_tracker";
import { BN } from "bn.js";

describe("expense-tracker", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  let merchantName = "test";
  let amount = 100;
  let id = 1;

  let authority = anchor.web3.Keypair.generate();

  const program = anchor.workspace.ExpenseTracker as Program<ExpenseTracker>;

  const [expense_account, _] = anchor.web3.PublicKey.findProgramAddressSync(
    [
      Buffer.from("expense"),
      authority.publicKey.toBuffer(),
      new BN(id).toArrayLike(Buffer, "le", 8),
    ],
    program.programId
  );

  it("Initialize expense", async () => {
    const airdropSignature = await program.provider.connection.requestAirdrop(
      authority.publicKey,
      anchor.web3.LAMPORTS_PER_SOL // 1 SOL
    );
    await program.provider.connection.confirmTransaction(airdropSignature);

    const tx = await program.methods
      .initializeExpense(new anchor.BN(id), merchantName, new anchor.BN(amount))
      .accounts({
        expenseAccount: expense_account,
        authority: authority.publicKey,
      })
      .signers([authority])
      .rpc();
  });

  it("Modify Expense", async () => {
    await program.methods
      .modifyExpense(new anchor.BN(id), "test2", new anchor.BN(200))
      .accounts({
        expenseAccount: expense_account,
        authority: authority.publicKey,
      })
      .signers([authority])
      .rpc();
  });

  it("Delete Expense", async () => {
    await program.methods
      .deleteExpense(new anchor.BN(id))
      .accounts({
        expenseAccount: expense_account,
        authority: authority.publicKey,
      })
      .signers([authority])
      .rpc();
  });
});
