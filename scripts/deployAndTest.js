const hre = require('hardhat');
const { utils, BigNumber } = require("ethers");
const { expect } = require("chai");

// mainnet
const ADDRESSES = {
    audio: '0x18aAA7115705e8be94bfFEBDE57Af9BFc265B998',
    audioDelegateManager: '0x4d7968ebfD390D5E7926Cb3587C39eFf2F9FB225',
    serviceProvider: '0xc1f351FE81dFAcB3541e59177AC71Ed237BD15D0',
    audioHolder: '0x0da332Ad0D7943A7DF320b9Bea5D7fAa9a665882',
    audioStaking: '0xe6d97b2099f142513be7a2a068be040656ae4591'
};

// run on mainnet fork
async function main() {
    const accounts = await ethers.getSigners();
    const [deployer, user1, user2] = accounts;

    const xAUDIO = await ethers.getContractFactory('xAUDIO');
    const xaudio = await xAUDIO.deploy();
    await xaudio.deployed();
    console.log('xaudio deployed at address:', xaudio.address);

    let tx = await xaudio.initialize(
        'xAUDIOa',
        ADDRESSES.audio,
        ADDRESSES.audioDelegateManager,
        ADDRESSES.serviceProvider
    );

    await tx.wait();
    console.log('xaudio initialized');

    //retrieve audio holder
    await hre.network.provider.request({
        method: "hardhat_impersonateAccount",
        params: [ADDRESSES.audioHolder]
    });
    const audioHolder = ethers.provider.getSigner(ADDRESSES.audioHolder);

    await xaudio.approveAudio(ADDRESSES.audioStaking);


    // test
    const audioAmount = utils.parseEther('130');;

    //check audio amount of holder
    const audio = await ethers.getContractAt('ERC20', ADDRESSES.audio);
    const balanceHolder = await audio.balanceOf(ADDRESSES.audioHolder)
    console.log('audioHolder', balanceHolder.toString())
    expect(BigNumber.from(balanceHolder).gt(0)).to.be.true

    await audio.connect(audioHolder).transfer(user1.address, audioAmount);
    let balanceUser1 = await audio.balanceOf(user1.address)
    console.log('User1 balance', balanceUser1.toString())
    expect(BigNumber.from(balanceUser1).eq(audioAmount)).to.be.true

    //Mint
    await audio.connect(user1).approve(xaudio.address, audioAmount);
    await xaudio.connect(user1).mintWithToken(audioAmount);

    const balanceAfterMint = await audio.balanceOf(user1.address)
    console.log('audio after mint', balanceAfterMint.toString())
    expect(BigNumber.from(balanceAfterMint).eq(0)).to.be.true

    const xaudioBalanceAfterMint = await xaudio.balanceOf(user1.address)
    console.log('xaudio after mint', xaudioBalanceAfterMint.toString())
    expect(xaudioBalanceAfterMint).to.be.equal(audioAmount)

    console.log('xaudio minted')
    const totalSupply = await xaudio.totalSupply();
    console.log('totalSupply', totalSupply.toString());

    //Stake 
    await mineBlocks(5);
    await xaudio.stake();
    await mineBlocks(5);

    let stakedBal = await xaudio.getStakedBalance();
    let bufferBal = await xaudio.getBufferBalance();
    console.log('stakedBal', stakedBal.toString());
    console.log('bufferBal', bufferBal.toString());

    expect(stakedBal).to.be.equal(utils.parseEther("123.5"))
    expect(bufferBal).to.be.equal(utils.parseEther("6.5"))

    //Cooldown
    console.log('cooldown');
    await mineBlocks(5);
    await xaudio.cooldown(utils.parseEther("123.5"));

    //unstake
    //need to wait 7 days 
    console.log('unstake');
    await mineBlocks(50000);
    await xaudio.unstake();

    stakedBal = await xaudio.getStakedBalance();
    bufferBal = await xaudio.getBufferBalance();
    console.log('stakedBal', stakedBal.toString());
    console.log('bufferBal', bufferBal.toString());

    expect(stakedBal).to.be.equal(utils.parseEther("0"))
    expect(bufferBal).to.be.equal(utils.parseEther("130"))
}

/**
 * Mine several blocks in network
 * @param {Number} blockCount how many blocks to mine
 */
async function mineBlocks(blockCount) {
    for (let i = 0; i < blockCount; ++i) {
        await hre.ethers.provider.send("evm_mine");
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