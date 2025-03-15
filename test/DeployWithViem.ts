import { createPublicClient, createWalletClient, http, formatEther, toHex } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { holesky, sepolia } from "viem/chains";
import { abi, bytecode } from "../artifacts/contracts/Ballot.sol/Ballot.json";
import * as dotenv from "dotenv";

dotenv.config();

const alchemyApiKey: string = process.env.ALCHEMY_API_KEY || "";
const infuraApiKey: string = process.env.INFURA_API_KEY || "";
const infuraSecretKey: string = process.env.INFURA_SECRET_KEY || "";
const etherScanApiKey: string = process.env.ETHERSCAN_API_KEY || "";
const deployerPrivateKey = process.env.PRIVATE_KEY || "";


async function main(){
    const proposals = process.argv.slice(2);
    if (!proposals || proposals.length < 1) {
      throw new Error("Proposals not provided");
    }

    const rpc = http(`https://sepolia.infura.io/v3/${infuraApiKey}`);
    const rpc2 = http(`https://api-holesky.etherscan.io/api/${etherScanApiKey}`)
  
    const publicClient = createPublicClient({
        chain: sepolia,
        transport: rpc,
    });
    const blockNumber = await publicClient.getBlockNumber();
    console.log("Last block number:", blockNumber);

    const account = privateKeyToAccount(`0x${deployerPrivateKey}`);
    const deployer = createWalletClient({
      account,
      chain: sepolia,
      transport: rpc,
    });
    console.log("Deployer address:", deployer.account.address);
    const balance = await publicClient.getBalance({
      address: deployer.account.address,
    });
    console.log(
      "Deployer balance:",
      formatEther(balance),
      deployer.chain.nativeCurrency.symbol
    );
    
    console.log("\nDeploying Ballot contract");
    const hash = await deployer.deployContract({
      abi,
      bytecode: bytecode as `0x${string}`,
      args: [proposals.map((prop) => toHex(prop, { size: 32 }))],
    });
    console.log("Transaction hash:", hash);
    console.log("Waiting for confirmations...");
    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    console.log("Ballot contract deployed to:", receipt.contractAddress);
}

main().catch((error: Error) => {
  console.error(error);
  process.exitCode = 1;
});
