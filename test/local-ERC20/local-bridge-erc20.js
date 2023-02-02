const ethers = require("ethers")
const optimismSDK = require("@eth-optimism/sdk")

const mnemonic = process.env.MNEMONIC

const words = process.env.MNEMONIC.match(/[a-zA-Z]+/g).length
validLength = [12, 15, 18, 24]
if (!validLength.includes(words)) {
   console.log(`The mnemonic (${process.env.MNEMONIC}) is the wrong number of words`)
   process.exit(-1)
}

require('dotenv').config()

const l1Url = `http://localhost:9545`
const l2Url = `http://localhost:8545`


const bridge = {
    l1Bridge: "0x8A791620dd6260079BF849Dc5567aDC3F2FdC318",
    l2Bridge: "0x4200000000000000000000000000000000000010"
  }

// 배포해야함
const erc20Addrs = {
  l1Addr: "0xa85233C63b9Ee964Add6F2cffe00Fd84eb32338f",
  l2Addr: "0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9"
}

let crossChainMessenger
let l1ERC20, l2ERC20
let ourAddr             

const getSigners = async () => {
  const l1RpcProvider = new ethers.providers.JsonRpcProvider(l1Url)
  const l2RpcProvider = new ethers.providers.JsonRpcProvider(l2Url)
  const hdNode = ethers.utils.HDNode.fromMnemonic(mnemonic)
  const privateKey = hdNode.derivePath(ethers.utils.defaultPath).privateKey
  // const privateKey = process.env.PRIVATE_KEY
  const l1Wallet = new ethers.Wallet(privateKey, l1RpcProvider)
  const l2Wallet = new ethers.Wallet(privateKey, l2RpcProvider)

  return [l1Wallet, l2Wallet]
}   // getSigners

const erc20ABI = [
  // balanceOf
  {
    constant: true,
    inputs: [{ name: "_owner", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "balance", type: "uint256" }],
    type: "function",
  },
  // approve
  {
    constant: true,
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" }],
    name: "approve",
    outputs: [{ name: "", type: "bool" }],
    type: "function",
  },
  // faucet
  {
    inputs: [],
    name: "faucet",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  }
]    // erc20ABI


const setup = async() => {
  const [l1Signer, l2Signer] = await getSigners()
  ourAddr = l1Signer.address

  crossChainMessenger = new optimismSDK.CrossChainMessenger({
      l1ChainId: 31337,    // local value, 1 for mainnet
      l2ChainId: 17,  // local-L2 value, 10 for mainnet
      l1SignerOrProvider: l1Signer,
      l2SignerOrProvider: l2Signer
  })

  // console.log('crossChainMessenger',crossChainMessenger);

  l1ERC20 = new ethers.Contract(erc20Addrs.l1Addr, erc20ABI, l1Signer)
  l2ERC20 = new ethers.Contract(erc20Addrs.l2Addr, erc20ABI, l2Signer)
}    // setup

const reportERC20Balances = async () => {
  const l1Balance = (await l1ERC20.balanceOf(ourAddr)).toString().slice(0,-18)
  const l2Balance = (await l2ERC20.balanceOf(ourAddr)).toString().slice(0,-18)

  console.log(`ourAddr:${ourAddr} `)
  console.log(`OUTb on L1:${l1Balance}     OUTb on L2:${l2Balance}`)

  if (l1Balance != 0) {
    return
  }

  console.log("you don't have a token")
  const tx = (await l1ERC20.faucet())
  console.log(`Faucet tx: ${tx.hash}`)
  await tx.wait()
  const newBalance = (await l1ERC20.balanceOf(ourAddr)).toString().slice(0,-18)
  console.log(`New L1 OUTb balance: ${newBalance}`)
}    // reportERC20Balances

const depositAmount = ethers.utils.parseEther("1")

const depositERC20 = async () => {

  console.log("Deposit ERC20")
  await reportERC20Balances()
  const start = new Date()

  // Need the l2 address to know which bridge is responsible
  const allowanceResponse = await crossChainMessenger.approveERC20(
    erc20Addrs.l1Addr, erc20Addrs.l2Addr, depositAmount)
  await allowanceResponse.wait()
  console.log(`Allowance given by tx ${allowanceResponse.hash}`)
  console.log(`Time so far ${(new Date()-start)/1000} seconds`)

  const response = await crossChainMessenger.depositERC20(
    erc20Addrs.l1Addr, erc20Addrs.l2Addr, depositAmount)
  console.log(`Deposit transaction hash (on L1): ${response.hash}`)
  await response.wait()
  console.log("Waiting for status to change to RELAYED")
  console.log(`Time so far ${(new Date()-start)/1000} seconds`)
  await crossChainMessenger.waitForMessageStatus(response.hash,
                                                  optimismSDK.MessageStatus.RELAYED)

  await reportERC20Balances()
  console.log(`depositERC20 took ${(new Date()-start)/1000} seconds\n\n`)

}     // depositERC20()

const withdrawERC20 = async () => {

  console.log("Withdraw ERC20")
  const start = new Date()
  await reportERC20Balances()

  const response = await crossChainMessenger.withdrawERC20(
    erc20Addrs.l1Addr, erc20Addrs.l2Addr, depositAmount)
  console.log(`Transaction hash (on L2): ${response.hash}`)
  await response.wait()

  console.log("Waiting for status to change to IN_CHALLENGE_PERIOD")
  console.log(`Time so far ${(new Date()-start)/1000} seconds`)
  await crossChainMessenger.waitForMessageStatus(response.hash,
    optimismSDK.MessageStatus.IN_CHALLENGE_PERIOD)
  console.log("In the challenge period, waiting for status READY_FOR_RELAY")
  console.log(`Time so far ${(new Date()-start)/1000} seconds`)
  await crossChainMessenger.waitForMessageStatus(response.hash,
                                                optimismSDK.MessageStatus.READY_FOR_RELAY)
  console.log("Ready for relay, finalizing message now")
  console.log(`Time so far ${(new Date()-start)/1000} seconds`)
  await crossChainMessenger.finalizeMessage(response)
  console.log("Waiting for status to change to RELAYED")
  console.log(`Time so far ${(new Date()-start)/1000} seconds`)
  await crossChainMessenger.waitForMessageStatus(response,
    optimismSDK.MessageStatus.RELAYED)
  await reportERC20Balances()
  console.log(`withdrawERC20 took ${(new Date()-start)/1000} seconds\n\n\n`)

}     // withdrawERC20()


const main = async () => {
  await setup()
  await reportERC20Balances()
  await depositERC20()
  // await withdrawERC20()
}  // main

main().then(() => process.exit(0))
.catch((error) => {
  console.error(error)
  process.exit(1)
})