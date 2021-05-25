const {deployments} = require('hardhat');
const {utils} = require('ethers');

const xAudioFixture = deployments.createFixture(async ({ethers}, options) => {
    const accounts = await ethers.getSigners();
    const [deployer, user1, user2] = accounts;

    const Audio = await ethers.getContractFactory('MockAudio');
    const audio = await Audio.deploy();

    const xAUDIO = await ethers.getContractFactory('xAUDIO');
    const xAudio = await xAUDIO.deploy();

    const DelegateManager = await ethers.getContractFactory('MockDelegateManager');
    const delegateManager = await DelegateManager.deploy(audio.address);

    const xAUDIOProxy = await ethers.getContractFactory('xAUDIOProxy');
    const xAudioProxy = await xAUDIOProxy.deploy(xAudio.address, user2.address);
    const xAudioProxyCast = await ethers.getContractAt('xAUDIO', xAudioProxy.address);

    await xAudioProxyCast.initialize(
        'xAUDIOa',
        audio.address,
        delegateManager.address,
        "0x1230000000000000000000000000000000000000"
    );

    await xAudioProxyCast.approveAudio(delegateManager.address);

    await audio.transfer(deployer.address, utils.parseEther('100'));

    return {
        xAudio: xAudioProxyCast,
        audio: audio,
        accounts
    };
});

module.exports = {xAudioFixture: xAudioFixture};