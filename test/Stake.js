const {expect} = require("chai");
const {utils, BigNumber} = require("ethers");
const {xAudioFixture} = require("./fixtures");

describe("xAUDIO: Stake", async () => {
    const provider = ethers.provider;

    let xAudio;
    let audio;
    let deployer, user1, user2;

    const audioAmount = utils.parseEther("10");
    const lowerAudioAmount = utils.parseEther("2");

    before(async () => {
        ({xAudio: xAudio, accounts: [deployer, user1, user2], audio: audio} = await xAudioFixture());
    });
    context('# can stake token with xAUDIO', async () => {
        it("should increase delegate stake", async () => {
            await audio.transfer(user1.address, audioAmount);
            await audio.connect(user1).approve(xAudio.address, audioAmount);
            await xAudio.connect(user1).mintWithToken(audioAmount);
            await xAudio.stake();

            const stakedBal = await xAudio.getStakedBalance();
            const bufferBal = await xAudio.getBufferBalance();

            expect(stakedBal).to.be.equal(utils.parseEther("9.5"))
            expect(bufferBal).to.be.equal(utils.parseEther("0.5"))
        });
        it("can't call stake function if not owner", async () => {
            await expect(xAudio.connect(user1).stake()).to.be.revertedWith('Non-admin caller')
        });
        it("increase delegate stake if mint more", async () => {
            await audio.transfer(user1.address, lowerAudioAmount);
            await audio.connect(user1).approve(xAudio.address, lowerAudioAmount);
            await xAudio.connect(user1).mintWithToken(lowerAudioAmount);
            await xAudio.stake();

            const stakedBal = await xAudio.getStakedBalance();
            const bufferBal = await xAudio.getBufferBalance();

            expect(stakedBal).to.be.equal(utils.parseEther("11.4"))
            expect(bufferBal).to.be.equal(utils.parseEther("0.6"))
        });
    });

});