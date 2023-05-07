// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");

async function main() {
  // deploy WTON on tokamak goerli

  // Goerli WTON 0xe86fCf5213C785AcF9a8BFfEeDEfA9a2199f7Da6
  const l2Bridge = '0x4200000000000000000000000000000000000010'
  const l1Token = '0xe86fCf5213C785AcF9a8BFfEeDEfA9a2199f7Da6'

  const L2WTONToken = await hre.ethers.getContractFactory("L2WTONERC20");
  const l2wton = await L2WTONToken.deploy(
    l2Bridge,
    l1Token
  );

  await l2wton.deployed();
  
  console.log("finished Deploy");
  console.log("L2 WTON Token deployed to:", l2wton.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });