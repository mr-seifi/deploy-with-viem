import { createPublicClient, createWalletClient, http, formatEther, toHex, hexToString, PublicClient, WalletClient } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { holesky, sepolia } from "viem/chains";
import { abi, bytecode } from "../artifacts/contracts/Ballot.sol/Ballot.json";
import process from 'process';

// npx ts-node ./scripts/DelegateVote.ts <contract_address> <to_address>
async function delegate(publicClient: any, voter: any){
    const parameters = process.argv.slice(2);
    if (!parameters || parameters.length < 2)
      throw new Error("Parameters not provided");
    const contractAddress = parameters[0] as `0x${string}`;
    if (!contractAddress) throw new Error("Contract address not provided");
    if (!/^0x[a-fA-F0-9]{40}$/.test(contractAddress))
      throw new Error("Invalid contract address");
    const toAddress = parameters[1];
    if (!toAddress) throw new Error("To address not provided");
    if (!/^0x[a-fA-F0-9]{40}$/.test(contractAddress))
        throw new Error("Invalid to address");

    console.log("Delegating your vote to: ", toAddress);
    console.log("Confirm? (Y/n)");

    process.stdin.addListener("data", async function (d: Buffer) {
      if (d.toString().trim().toLowerCase() != "n") {
        const hash = await voter.writeContract({
          address: contractAddress,
          abi,
          functionName: "delegate",
          args: [toAddress],
        });
        console.log("Transaction hash:", hash);
        console.log("Waiting for confirmations...");
        const receipt = await publicClient.waitForTransactionReceipt({ hash });
        console.log("Transaction confirmed");
      } else {
        console.log("Operation cancelled");
      }
      process.exit();
    });
}

export {delegate};