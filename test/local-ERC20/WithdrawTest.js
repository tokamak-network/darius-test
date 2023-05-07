const ethers = require("ethers")
const optimismSDK = require("@eth-optimism/sdk")

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

const erc20Addrs = {
    l1Addr: "0x68c1F9620aeC7F2913430aD6daC1bb16D8444F00",
    l2Addr: "0x7c6b91D9Be155A6Db01f749217d76fF02A7227F2"
}

// let useAddr
let l1RpcProvider, l2RpcProvider
let l1Contract, l2Contract
let crossChainMessenger

const withdrawAmount = ethers.utils.parseEther("1")

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

//get L1,L2 Wallet
const getSigners = async () => {
    l1RpcProvider = new ethers.providers.JsonRpcProvider(l1Url)
    l2RpcProvider = new ethers.providers.JsonRpcProvider(l2Url)
    const hdNode = ethers.utils.HDNode.fromMnemonic(process.env.MNEMONIC)
    const privateKey = hdNode.derivePath(ethers.utils.defaultPath).privateKey
    const l1Wallet = new ethers.Wallet(privateKey, l1RpcProvider)
    const l2Wallet = new ethers.Wallet(privateKey, l2RpcProvider)
  
    return [l1Wallet, l2Wallet]
}

const setupCrossMessengerAndContract = async () => {
  const [l1Signer, l2Signer] = await getSigners()
  l1ChainId = (await l1RpcProvider.getNetwork()).chainId
  console.log("l1ChainId : ", l1ChainId)
  l2ChainId = (await l2RpcProvider.getNetwork()).chainId
  console.log("l2ChainId : ", l2ChainId)

  crossChainMessenger = new optimismSDK.CrossChainMessenger({
     l1ChainId: l1ChainId,
     l2ChainId: l2ChainId,
     l1SignerOrProvider: l1Signer,
     l2SignerOrProvider: l2Signer,
     bedrock: true
  })

  l1Contract = new ethers.Contract(erc20Addrs.l1Addr, erc20ABI, l1Signer)
  l2Contract = new ethers.Contract(erc20Addrs.l2Addr, erc20ABI, l2Signer)
  console.log("setup finish")
}

const withdrawERC20 = async () => {
  const [l1Signer, l2Signer] = await getSigners()
  console.log("Withdraw ERC20");
  tx = (await l1Contract.balanceOf(l1Signer.address)).toString().slice(0,-18)
  tx2 = (await l2Contract.balanceOf(l2Signer.address)).toString().slice(0,-18)
  console.log('before withdraw');
  console.log(`TON on L1:${tx}     TON on L2:${tx2}`)
  // console.log("tx : ",Number(tx))
  // console.log("tx2 :",Number(tx2))

  withdrawalTx1 = await crossChainMessenger.withdrawERC20(l1Contract.address, erc20Addrs.l2Addr, withdrawAmount)
  console.log(`\ttransaction hash (on L2): ${withdrawalTx1.hash}`)
  console.log(`\tFor more information: https://goerli.explorer.tokamak.network/tx/${withdrawalTx1.hash}`)
  await withdrawalTx1.wait()


  // await crossChainMessenger.waitForMessageStatus(withdrawalTx1.hash, optimismSDK.MessageStatus.READY_TO_PROVE)
  // withdrawalTx2 = await crossChainMessenger.proveMessage(withdrawalTx1.hash)
  // await withdrawalTx2.wait()

  // await crossChainMessenger.waitForMessageStatus(withdrawalTx1.hash, optimismSDK.MessageStatus.READY_FOR_RELAY)
  // withdrawalTx3 = await crossChainMessenger.finalizeMessage(withdrawalTx1.hash)
  // await withdrawalTx3.wait()   

  tx3 = (await l1Contract.balanceOf(l1Signer.address)).toString().slice(0,-18)
  tx4 = (await l2Contract.balanceOf(l2Signer.address)).toString().slice(0,-18)
  console.log('after withdraw');
  console.log(`TON on L1:${tx3}     TON on L2:${tx4}`)
  // console.log("tx3 :", Number(tx3))
  // console.log("tx4 :", Number(tx4))
  
}


const main = async () => {
    await setupCrossMessengerAndContract()
    await withdrawERC20()
  }  // main
  
  main().then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })