import hardhat from "hardhat";
import type { Contract } from "ethers";

const { ethers } = hardhat;

async function main() {
  console.log("🚀 Deploying KubisaPunk contract...\n");

  // Get deployer information
  const [deployer] = await ethers.getSigners();
  console.log("📝 Deploying with account:", deployer.address);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", ethers.formatEther(balance), "ETH\n");

  // Verify we're on Base Sepolia
  const network = await ethers.provider.getNetwork();
  console.log("🔗 Network chainId:", network.chainId.toString());
  console.log("📡 Network name:", network.name);

  if (network.chainId !== 84532n) {
    throw new Error(
      "❌ Not connected to Base Sepolia (chainId 84532). Check your RPC URL and hardhat.config.ts network settings."
    );
  }

  console.log("✅ Confirmed: Connected to Base Sepolia\n");

  // Get the contract factory
  console.log("⏳ Deploying KubisaPunk contract...");
  const KubisaPunk = await ethers.getContractFactory("KubisaPunk");

  // Deploy the contract
  const kubisaPunk = await KubisaPunk.deploy();

  // Wait for deployment to complete
  await kubisaPunk.waitForDeployment();

  const deployedAddress = await kubisaPunk.getAddress();

  console.log("\n✅ KubisaPunk contract deployed successfully!");
  console.log("📍 Contract Address:", deployedAddress);
  console.log("👤 Deployer Address:", deployer.address);
  console.log("🔗 Network: Base Sepolia");

  // Log deployment info
  console.log("\n📋 Deployment Summary:");
  console.log("------------------------");
  console.log(`Contract Name: KubisaPunk`);
  console.log(`Contract Address: ${deployedAddress}`);
  console.log(`Deployer: ${deployer.address}`);
  console.log(`Network: Base Sepolia (chainId: 84532)`);
  console.log(`RPC: Base Sepolia`);
  console.log("------------------------\n");

  // Provide verification link
  console.log("🔍 View on Block Explorer:");
  console.log(
    `https://sepolia.basescan.org/address/${deployedAddress}`
  );
  console.log("\n✨ Deployment complete! Contract is ready to use.\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed!");
    console.error(error);
    process.exit(1);
  });
