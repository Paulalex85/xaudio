const hre = require('hardhat');

// mainnet
const ADDRESSES = {
    audio: '0x111111111117dc0aa78b770fa6a738034120c302',
    audioDelegateManager : '0x4d7968ebfD390D5E7926Cb3587C39eFf2F9FB225',
    serviceProvider: '0xc1f351FE81dFAcB3541e59177AC71Ed237BD15D0'
};

// run on mainnet fork
async function main() {
    const accounts = await ethers.getSigners();
    const [deployer, user1, user2] = accounts;

    const xAUDIO = await ethers.getContractFactory('xAUDIO');
    const xAudio = await xAUDIO.deploy();

    const xAUDIOProxy = await ethers.getContractFactory('xAUDIOProxy');
    const xAudioProxy = await xAUDIOProxy.deploy(xAudio.address, user2.address); // transfer ownership to multisig
    const xAudioProxyCast = await ethers.getContractAt('xAUDIO', xAudioProxy.address);

    await xAudioProxyCast.initialize(
        'xAUDIOa',
        ADDRESSES.audio,
        ADDRESSES.audioDelegateManager,
        ADDRESSES.serviceProvider
    );

    console.log('xAudioProxyCast:', xAudioProxyCast.address);

    // test

    await xAudioProxyCast.mint('1', { value: ethers.utils.parseEther('0.01') });
    await mineBlocks(5);
    const totalSupply = await xAudioProxyCast.totalSupply();
    console.log('totalSupply', totalSupply.toString());

    const audio = await ethers.getContractAt('ERC20', ADDRESSES.audio);

    const xAudioHoldings = await xAudioProxyCast.balanceOf(deployer.address);
    console.log('xAudioHoldings', xAudioHoldings.toString());

    const totalSupply2 = await xAudioProxyCast.totalSupply();
    console.log('totalSupply2', totalSupply2.toString());
    const supplyToBurn = await totalSupply2.div(50);

    // INCH redemption
    const inchBal = await audio.balanceOf(deployer.address)
    console.log('inchBal', inchBal.toString())
    await xAudioProxyCast.burn(supplyToBurn, false, '0')
    const inchBalAfter = await audio.balanceOf(deployer.address)
    console.log('inchBalAfter', inchBalAfter.toString())
}

/**
 * Mine several blocks in network
 * @param {Number} blockCount how many blocks to mine
 */
async function mineBlocks(blockCount) {
    for(let i = 0 ; i < blockCount ; ++i) {
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