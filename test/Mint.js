const {expect} = require("chai");
const {utils, BigNumber} = require("ethers");
const {xAudioFixture} = require("./fixtures");

describe("xAUDIO: Mint", async () => {
    const provider = ethers.provider;

    let xAudio;
    let audio;
    let deployer, user1, user2;
    const audioAmount = utils.parseEther("10");

    before(async () => {
        ({xAudio: xAudio, accounts: [deployer, user1, user2], audio: audio} = await xAudioFixture());
    });
    context('# can mint token with AUDIO', async () => {
        it("need to approve token first", async () => {
            await audio.transfer(user1.address, audioAmount);
            await expect(
                xAudio.connect(user1).mintWithToken(audioAmount)
            ).to.be.reverted;
        });
        it("need to send token", async () => {
            await expect(
                xAudio.connect(user1).mintWithToken(0)
            ).to.be.revertedWith("Must send token");
        });
        it("should mint xAUDIO tokens to user sending AUDIO", async () => {
            await audio.connect(user1).approve(xAudio.address, audioAmount);
            await xAudio.connect(user1).mintWithToken(audioAmount);
            const xAudioBal = await xAudio.balanceOf(user1.address);
            expect(xAudioBal).to.be.equal(audioAmount)
        });
    });

});