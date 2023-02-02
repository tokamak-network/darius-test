// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");

async function main() {
  //deploy L1Token
  
  const L1Token = await hre.ethers.getContractFactory("L1Token");
  const l1token = await L1Token.deploy(
    "Tokamak L2 Token",
    "TON"
  );

  await l1token.deployed();

  console.log("L1Token deployed to:", l1token.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
