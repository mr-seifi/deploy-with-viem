import { abi } from "../artifacts/contracts/Ballot.sol/Ballot.json";

async function getWinningProposal(publicClient: any) {

    const parameters = process.argv.slice(2);
    if (!parameters || parameters.length < 1)
        throw new Error("Parameters not provided");
    const contractAddress = parameters[0] as `0x${string}`;
    if (!contractAddress) throw new Error("Contract address not provided");
    if (!/^0x[a-fA-F0-9]{40}$/.test(contractAddress))
        throw new Error("Invalid contract address");

    const winningProposalNumber = await publicClient.readContract({
        address: contractAddress,
        abi: abi,
        functionName: 'winningProposal',
    })

    const proposal = await publicClient.readContract({
        address: contractAddress,
        abi,
        functionName: 'proposals',
        args: [BigInt(winningProposalNumber)],
    })

    return { winningProposalNumber, proposal };
}

export { getWinningProposal };