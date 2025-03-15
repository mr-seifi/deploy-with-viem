import { sepolia } from "viem/chains";
import { http, createWalletClient } from "viem";
import { abi, bytecode } from "../artifacts/contracts/Ballot.sol/Ballot.json";
import { privateKeyToAccount } from "viem/accounts";

// To call use
// npx ts-node --files ./scripts/GiveVotingRights.ts "contract_address" "voter_account"
async function giveVotingRights(publicClient: any, walletClient: any) {

    const parameters = process.argv.slice(2, 4);
    console.log(parameters)
    if (!parameters || parameters.length < 2)
        throw new Error("Incorrect parameters [contract, voter]");
    const contractAddress = parameters[0] as `0x${string}`;
    if (!contractAddress) throw new Error("Contract address not provided");
    const newVoter = parameters[1] as `0x${string}`;
    if (!newVoter) throw new Error("New Voter address not provided");
    if (!/^0x[a-fA-F0-9]{40}$/.test(contractAddress))
        throw new Error("Invalid contract address");
    if (!/^0x[a-fA-F0-9]{40}$/.test(newVoter))
        throw new Error("Invalid new voter address");

    const hash = await walletClient.writeContract({
        address: contractAddress,
        abi: abi,
        functionName: 'giveRightToVote',
        args: [newVoter],
    })
    console.log("Transaction hash:", hash);
    console.log("Waiting for confirmations...");
    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    console.log("Transaction confirmed");
}

export { giveVotingRights };