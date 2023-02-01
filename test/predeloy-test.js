const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("getPredeploy", function () {
    // before(async function () {
    //     accounts = await ethers.getSigners();
    // })
    // it("perdeploy get L2StandardBridge", async function () {
    //     const L2StandardBridge = await ethers.getContractFactory("L2StandardBridge");
    //     const l2bridge = await L2StandardBridge.attach("0x4200000000000000000000000000000000000010")
    //     console.log("l2bridgeAddress : ",l2bridge.address);
    //     console.log(l2bridge);    
    // });
    // it("perdeploy get L2CrossDomainMessenger", async function () {
    //     const L2CrossDomainMessenger = await ethers.getContractFactory("L2CrossDomainMessenger");
    //     const l2crossdomain = await L2CrossDomainMessenger.attach("0x4200000000000000000000000000000000000007")
    //     console.log("L2CrossDomainMessenger : ",l2crossdomain.address);
    //     console.log(l2crossdomain);    
    // });
    it("perdeploy get L2StandardTokenFactory", async function () {
        const L2StandardTokenFactory = await ethers.getContractFactory("L2StandardTokenFactory");
        const l2tokenFactory = await L2StandardTokenFactory.attach("0x4200000000000000000000000000000000000012")
        console.log("l2tokenFactoryAddress : ",l2tokenFactory.address);
        console.log(l2tokenFactory);    
    });
})