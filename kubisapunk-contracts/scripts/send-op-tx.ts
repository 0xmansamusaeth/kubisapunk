import hre from "hardhat";

async function main() {
  const [sender] = await hre.ethers.getSigners();

  console.log("Sending transaction using the OP chain type");

  console.log("Sending 1 wei from", sender.address, "to itself");

  console.log("Sending L2 transaction");
  const tx = await sender.sendTransaction({
    to: sender.address,
    value: BigInt(1),
  });

  await tx.wait();

  console.log("Transaction sent successfully");
}

main();
