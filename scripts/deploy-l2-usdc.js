// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");

async function main() {
  // deploy USDC on tokamak goerli

  // Goerli USDC 0x07865c6e87b9f70255377e024ace6630c1eaa37f
  const l2Bridge = '0x4200000000000000000000000000000000000010'
  const l1Token = '0x07865c6e87b9f70255377e024ace6630c1eaa37f'
  const tokenName = 'USDC'
  const tokenSymbol = 'USDC'

  const L2USDCToken = await hre.ethers.getContractFactory("L2ERC20Decimal6");
  const l2usdc = await L2USDCToken.deploy(
    l2Bridge,
    l1Token,
    tokenName,
    tokenSymbol
  );

  await l2usdc.deployed();

  console.log("L2 USDC Token deployed to:", l2usdc.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
