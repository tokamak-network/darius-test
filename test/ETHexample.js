#! /usr/local/bin/node

// Transfers between L1 and L2 using the Optimism SDK

const ethers = require("ethers")
const optimismSDK = require("@eth-optimism/sdk")
require('dotenv').config()


const mnemonic = process.env.MNEMONIC
const l1Url = `https://eth-goerli.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`
const l2Url = `https://goerli.optimism.tokamak.network`


// Global variable because we need them almost everywhere
let crossChainMessenger
let addr    // Our address

const getSigners = async () => {
    const l1RpcProvider = new ethers.providers.JsonRpcProvider(l1Url)
    const l2RpcProvider = new ethers.providers.JsonRpcProvider(l2Url)
    const hdNode = ethers.utils.HDNode.fromMnemonic(mnemonic)
    const privateKey = hdNode.derivePath(ethers.utils.defaultPath).privateKey
    const l1Wallet = new ethers.Wallet(privateKey, l1RpcProvider)
    const l2Wallet = new ethers.Wallet(privateKey, l2RpcProvider)

    return [l1Wallet, l2Wallet]
}   // getSigners


const setup = async() => {
  const [l1Signer, l2Signer] = await getSigners()
  addr = l1Signer.address
  l1ChainId = (await l1RpcProvider.getNetwork()).chainId
  l2ChainId = (await l2RpcProvider.getNetwork()).chainId
//   console.log("l1ChainId : ", l1ChainId)
//   console.log("l2ChainId : ", l2ChainId)
  crossChainMessenger = new optimismSDK.CrossChainMessenger({
      l1ChainId: l1ChainId,    // Goerli value, 1 for mainnet
      l2ChainId: l2ChainId,  // Goerli value, 10 for mainnet
      l1SignerOrProvider: l1Signer,
      l2SignerOrProvider: l2Signer
  })
}    // setup



const gwei = BigInt(1e9)
const eth = gwei * gwei   // 10^18
const centieth = eth/100n


const reportBalances = async () => {
  const l1Balance = (await crossChainMessenger.l1Signer.getBalance()).toString().slice(0,-9)
  const l2Balance = (await crossChainMessenger.l2Signer.getBalance()).toString().slice(0,-9)

  console.log(`On L1:${l1Balance} Gwei    On L2:${l2Balance} Gwei`)
}    // reportBalances


const depositETH = async () => {

  console.log("Deposit ETH")
  await reportBalances()
  const start = new Date()

  const response = await crossChainMessenger.depositETH(gwei)
  console.log(`Transaction hash (on L1): ${response.hash}`)
  await response.wait()
  console.log("Waiting for status to change to RELAYED")
  console.log(`Time so far ${(new Date()-start)/1000} seconds`)
  await crossChainMessenger.waitForMessageStatus(response.hash,
                                                  optimismSDK.MessageStatus.RELAYED)

  await reportBalances()
  console.log(`depositETH took ${(new Date()-start)/1000} seconds\n\n`)
}     // depositETH()





const withdrawETH = async () => { 
  
  console.log("Withdraw ETH")
  const start = new Date()  
  await reportBalances()

  const response = await crossChainMessenger.withdrawETH(centieth)
  console.log(`Transaction hash (on L2): ${response.hash}`)
  await response.wait()
  
  await reportBalances()   
  console.log(`withdrawETH took ${(new Date()-start)/1000} seconds\n\n\n`)  
}     // withdrawETH()


const main = async () => {
    await setup()
    await depositETH()
    await withdrawETH()
    // await depositERC20()
    // await withdrawERC20()
}  // main



main().then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })





