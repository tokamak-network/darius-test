require("@nomiclabs/hardhat-waffle");
require('dotenv').config()

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */

// const optimismGoerliUrl =
//   process.env.ALCHEMY_API_KEY ?
//     `https://opt-goerli.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}` :
//     process.env.OPTIMISM_GOERLI_URL

// const words = process.env.MNEMONIC.match(/[a-zA-Z]+/g).length
// validLength = [12, 15, 18, 24]
// if (!validLength.includes(words)) {
//    console.log(`The mnemonic (${process.env.MNEMONIC}) is the wrong number of words`)
//    process.exit(-1)
// }

module.exports = {
  solidity: {
    compilers: [
      {
        version: '0.8.9',
        settings: {
          optimizer: { enabled: true, runs: 10_000 },
        },
      },
      {
        version: '0.5.17', // Required for WETH9
        settings: {
          optimizer: { enabled: true, runs: 10_000 },
        },
      },
    ],
  },
  networks: {
    "hardhat": {
      accounts: { mnemonic: "test test test test test test test test test test test junk" }
    },
    "l1chain-local": {
      // url: `http://127.0.0.1:9545`,
      // url: `http://l1_chain:8545`,
      url: `http://localhost:9545`,
      accounts: { mnemonic: "test test test test test test test test test test test junk" }
    },
    "optimism-local": {
      //  url: `http://127.0.0.1:8545`,
      //  url: `http://l2geth:8545`,
      url: `http://localhost:8545`,
      accounts: { mnemonic: "test test test test test test test test test test test junk" }
    },
    // "optimism-goerli": {
    //    url: optimismGoerliUrl,
    //    accounts: { mnemonic: process.env.MNEMONIC }
    // },
    // "optimism-goerli": {
    //   url: optimismGoerliUrl,
    //   accounts: [`${process.env.PRIVATE_KEY}`]
    // },
    "optimism-goerli": {
      url: `https://opt-goerli.g.alchemy.com/v2/${process.env.OPTIMISM_GOERLI_ALCHEMY_KEY}`,
      accounts: [`${process.env.PRIVATE_KEY}`]
    },
    "goerli": {
      url: `https://eth-goerli.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
      accounts: [`${process.env.PRIVATE_KEY}`]
    },
    "tokamak-optimism-goerli" : {
      url: `https://goerli.optimism.tokamak.network`,
      accounts: [`${process.env.PRIVATE_KEY}`]
    },
    "optimism-bedrock": {
       url: 'https://bedrock-beta-1-replica-0.optimism.io/',
       accounts: [`${process.env.PRIVATE_KEY}`]
    },
    "tokamakgoerli": {
      url: 'https://goerli.optimism.tokamak.network',
      accounts: [`${process.env.PRIVATE_KEY}`]
   },
  }
};
