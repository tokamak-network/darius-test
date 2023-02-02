const ethers = require("ethers")

const words = process.env.MNEMONIC.match(/[a-zA-Z]+/g).length
validLength = [12, 15, 18, 24]
if (!validLength.includes(words)) {
   console.log(`The mnemonic (${process.env.MNEMONIC}) is the wrong number of words`)
   process.exit(-1)
}

require('dotenv').config()

const l1Url = `http://localhost:9545`

let useAddr
let l1Contract

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

//get L1 Wallet
const getSignersL1 = async () => {
    const l1RpcProvider = new ethers.providers.JsonRpcProvider(l1Url)
    const hdNode = ethers.utils.HDNode.fromMnemonic(process.env.MNEMONIC)
    const privateKey = hdNode.derivePath(ethers.utils.defaultPath).privateKey
    const l1Wallet = new ethers.Wallet(privateKey, l1RpcProvider)

    return l1Wallet
}

//get L1 contract
const setupL1 = async() => {
    const l1Signer = await getSignersL1()
    useAddr = l1Signer.address

    l1Contract = new ethers.Contract(process.env.L1_TOKEN_ADDRESS, erc20ABI, l1Signer)
}

//L1 Token Balance Check and if balance 0 -> give the token
const l1ERC20Balance = async() => {
    const l1balance = Number(await l1Contract.balanceOf(useAddr))
    console.log("l1balance : ",l1balance);

    if (l1balance != 0) {
        return
    }

    console.log(`You don't have enough L1Token`)
    const tx = (await l1Contract.faucet())
    console.log(`Faucet tx: ${tx.hash}`)
    await tx.wait()
    const newBalance = (await l1Contract.balanceOf(useAddr)).toString().slice(0,-18)
    console.log(`New L1Token balance: ${newBalance}`)
}


const main = async () => {
    await setupL1()
    await l1ERC20Balance()
  }  // main
  
  main().then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })