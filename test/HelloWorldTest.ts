// https://hardhat.org/hardhat-runner/docs/advanced/hardhat-runtime-environment
// https://hardhat.org/hardhat-runner/docs/advanced/using-viem
import { viem } from "hardhat";
// https://www.chaijs.com/guide/styles/#expect
import { expect } from "chai";
// https://hardhat.org/hardhat-network-helpers/docs/overview
// https://hardhat.org/hardhat-network-helpers/docs/reference#fixtures
import { loadFixture } from "@nomicfoundation/hardhat-toolbox-viem/network-helpers";

async function deployContractFixture() {
    // https://hardhat.org/hardhat-runner/docs/advanced/using-viem#clients
    const publicClient = await viem.getPublicClient();
    const [owner, otherAccount] = await viem.getWalletClients();
    // https://hardhat.org/hardhat-runner/docs/advanced/using-viem#contracts
    const helloWorldContract = await viem.deployContract("HelloWorld");

    console.log(publicClient)
    // https://www.typescriptlang.org/docs/handbook/2/functions.html#parameter-destructuring
    return {
      publicClient,
      owner,
      otherAccount,
      helloWorldContract,
    };
}

deployContractFixture().catch(error => {
    console.log(error);
})
