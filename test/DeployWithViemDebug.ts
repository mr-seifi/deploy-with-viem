// https://hardhat.org/hardhat-runner/docs/advanced/hardhat-runtime-environment
// https://hardhat.org/hardhat-runner/docs/advanced/using-viem
import { viem } from "hardhat";
// https://www.chaijs.com/guide/styles/#expect
import { expect } from "chai";
// https://hardhat.org/hardhat-network-helpers/docs/overview
// https://hardhat.org/hardhat-network-helpers/docs/reference#fixtures
import { loadFixture } from "@nomicfoundation/hardhat-toolbox-viem/network-helpers";
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

// https://mochajs.org/#getting-started
describe("Deploy With Viem", function () {
  async function deployContractFixture() {
    // https://hardhat.org/hardhat-runner/docs/advanced/using-viem#clients
    const publicClient = await viem.getPublicClient();
    const [owner, otherAccount] = await viem.getWalletClients();
    // https://hardhat.org/hardhat-runner/docs/advanced/using-viem#contracts
    const helloWorldContract = await viem.deployContract("HelloWorld");
    // https://www.typescriptlang.org/docs/handbook/2/functions.html#parameter-destructuring
    return {
      publicClient,
      owner,
      otherAccount,
      helloWorldContract,
    };
  }

  it("Test Deployment", async function () {
    const proposals = ["prop1", "prop2", "prop3"]

    const rpc = http(`https://holesky.infura.io/v3/${infuraApiKey}`);
    const rpc2 = http(`https://api-holesky.etherscan.io/api/${etherScanApiKey}`)
  
    const publicClient = createPublicClient({
        chain: holesky,
        transport: rpc,
    });
    const blockNumber = await publicClient.getBlockNumber();
    console.log("Last block number:", blockNumber);

    const account = privateKeyToAccount(`0x${deployerPrivateKey}`);
    const deployer = createWalletClient({
      account,
      chain: holesky,
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
  });
});