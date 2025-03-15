import { createPublicClient, createWalletClient, http, formatEther, toHex, hexToString } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { holesky, sepolia } from "viem/chains";
import { abi, bytecode } from "../artifacts/contracts/Ballot.sol/Ballot.json";
import process from 'process';
import * as dotenv from "dotenv";

dotenv.config();

const alchemyApiKey: string = process.env.ALCHEMY_API_KEY || "";
const infuraApiKey: string = process.env.INFURA_API_KEY || "";
const infuraSecretKey: string = process.env.INFURA_SECRET_KEY || "";
const etherScanApiKey: string = process.env.ETHERSCAN_API_KEY || "";
const deployerPrivateKey = process.env.PRIVATE_KEY || "";


async function main(){
    const parameters = process.argv.slice(2);
    if (!parameters || parameters.length < 2)
      throw new Error("Parameters not provided");
    const contractAddress = parameters[0] as `0x${string}`;
    if (!contractAddress) throw new Error("Contract address not provided");
    if (!/^0x[a-fA-F0-9]{40}$/.test(contractAddress))
      throw new Error("Invalid contract address");
    const proposalIndex = parameters[1];
    if (isNaN(Number(proposalIndex))) throw new Error("Invalid proposal index");

    const rpc = http(`https://sepolia.infura.io/v3/${infuraApiKey}`);
    const publicClient = createPublicClient({
        chain: sepolia,
        transport: rpc,
    });
    console.log("Proposal selected: ");
    const proposal = (await publicClient.readContract({
      address: contractAddress,
      abi,
      functionName: "proposals",
      args: [BigInt(proposalIndex)],
    })) as any[];
    const name = hexToString(proposal[0], { size: 32 });
    console.log("Voting to proposal", name);
    console.log("Confirm? (Y/n)");

    const account = privateKeyToAccount(`0x${deployerPrivateKey}`);
    const voter = createWalletClient({
        account,
        chain: sepolia,
        transport: rpc,
    });

    process.stdin.addListener("data", async function (d: Buffer) {
      if (d.toString().trim().toLowerCase() != "n") {
        const hash = await voter.writeContract({
          address: contractAddress,
          abi,
          functionName: "vote",
          args: [BigInt(proposalIndex)],
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

main().catch((error: Error) => {
  console.error(error);
  process.exitCode = 1;
});
