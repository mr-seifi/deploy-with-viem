import { createPublicClient, createWalletClient, http, formatEther, toHex, hexToString } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { holesky, sepolia } from "viem/chains";
import { abi, bytecode } from "../artifacts/contracts/Ballot.sol/Ballot.json";
import process from 'process';
import * as dotenv from "dotenv";
import { delegate } from "./DelegateVote";
import { giveVotingRights } from "./GiveVotingRights";
import { castVote } from "./CastVote";
import { getWinningProposal } from "./GetWinningProposal";

dotenv.config();

const alchemyApiKey: string = process.env.ALCHEMY_API_KEY || "";
const infuraApiKey: string = process.env.INFURA_API_KEY || "";
const infuraSecretKey: string = process.env.INFURA_SECRET_KEY || "";
const etherScanApiKey: string = process.env.ETHERSCAN_API_KEY || "";
const deployerPrivateKey = process.env.PRIVATE_KEY || "";
const rpc = http(`https://sepolia.infura.io/v3/${infuraApiKey}`);

// npx ts-node ./scripts/DelegateVote.ts <contract_address> <to_address>
async function main(){

    console.log("Welcome to Ballot!\n");
    console.log("Enter 'r' for GiveRightVote [<contract_address>, <voter_address>]\nEnter 'c' for CastVote [<contract_address>, <proposal_number>]\nEnter 'd' for DelegateVote [<contract_address>, <delegete_address>]\nEnter 'w' for GetWinningProposal [<contract_address>]");

    const publicClient = createPublicClient({
        chain: sepolia,
        transport: rpc,
    });
    const account = privateKeyToAccount(`0x${deployerPrivateKey}`);
    const walletClient = createWalletClient({
        account,
        chain: sepolia,
        transport: rpc,
    });

    process.stdin.addListener("data", async function (d: Buffer) {
        if (d.toString().trim().toLowerCase() == "r") {
            await giveVotingRights(publicClient, walletClient);
        } else if (d.toString().trim().toLowerCase() == "d") {
            await delegate(publicClient, walletClient);
        } else if (d.toString().trim().toLowerCase() == "c") {
            await castVote(publicClient, walletClient);
        } else if (d.toString().trim().toLowerCase() == "w") {
            const { winningProposalNumber, proposal } = await getWinningProposal(publicClient);
            console.log("Winning proposal is number: ", winningProposalNumber, ", which is: ", hexToString(proposal[0], { size: 32 }));
        }
        process.exit();
    });
}

main().catch((error: Error) => {
  console.error(error);
  process.exitCode = 1;
});
