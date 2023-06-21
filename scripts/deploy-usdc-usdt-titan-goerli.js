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
  const USDC_l1Token = '0x07865c6e87b9f70255377e024ace6630c1eaa37f'
  const USDC_tokenName = 'USD Coin'
  const USDC_tokenSymbol = 'USDC'

  const USDT_l1Token = ''
  const USDT_tokenName = 'Tether USD'
  const USDT_tokenSymbol = 'USDT'


  const L2USDCToken = await hre.ethers.getContractFactory("L2ERC20Decimal6");
  const l2usdc = await L2USDCToken.deploy(
    l2Bridge,
    USDC_l1Token,
    USDC_tokenName,
    USDC_tokenSymbol
  );

  await (await l2usdc.deployed()).wait();

  console.log("L2 USDC Token deployed to:", l2usdc.address);

  const L2USDTToken = await hre.ethers.getContractFactory("L2ERC20Decimal6");
  const l2usdt = await L2USDTToken.deploy(
    l2Bridge,
    USDT_l1Token,
    USDT_tokenName,
    USDT_tokenSymbol
  );

  await (await l2usdt.deployed()).wait();

  console.log("L2 USDT Token deployed to:", l2usdt.address);

  if(chainId == 55004 || chainId == 5050) {
    await run("verify", {
      address: l2usdc.address,
      constructorArgsParams: [
        l2Bridge,
        USDC_l1Token,
        USDC_tokenName,
        USDC_tokenSymbol],
    });

    await run("verify", {
      address: l2usdt.address,
      constructorArgsParams: [
        l2Bridge,
        USDT_l1Token,
        USDT_tokenName,
        USDT_tokenSymbol
      ],
    });
  }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
