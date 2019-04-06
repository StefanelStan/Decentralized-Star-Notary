const expect = require('chai').expect;

const {EthereumHelper} = require('./EthereumHelper.js');

var ethereumHelper;
describe('Testing EthereumHelper', () => {
    let token = 1;
    let ownerAddress = '0x4fda5baf52b8ff93399673f3f89a93ef31066ad8';
    let secondAddress = '0x15e542f44d1f0811ec4453fa5493eff1859f89b6';
    let thirdAddress = '0x3962def6c998ec7a5e81460bfba65b1982282f3c';
    let starOne = {name: 'Name01', story: "Story01", cent: "032.155", dec: "121.874", mag: "245.978"};
    let starTwo = {name: 'Name02', story: "Story02", cent: "032.155", dec: "121.874", mag: "245.978"};
    let starOneDesc; 
    before(async() => {
        ethereumHelper = new EthereumHelper();
        await ethereumHelper.initialize();
        token = getRandomInt(2000);
        starOne.mag = token.toString();
        starTwo.mag = (token+1).toString();
        starOneDesc = [starOne.name, starOne.story, "ra_" + starOne.cent, "dec_" + starOne.dec, "mag_" + starOne.mag];
        
        await ethereumHelper.createStar(starOne.name, starOne.story, starOne.cent, starOne.dec, starOne.mag, token, ownerAddress);
        await ethereumHelper.createStar(starTwo.name, starTwo.story, starTwo.cent, starTwo.dec, starTwo.mag, token+1, ownerAddress);
    });
    
    describe('Testing tokenIdToStarInfo', () => {
        it('should return empty array if token not found', async() => {
            let emptyStar = ["","","","",""];
            let star = await ethereumHelper.tokenIdToStarInfo(116);
            expect(star).to.deep.equal(emptyStar);
        });

        it('should return valid star description for given token', async() => {
            let star = await ethereumHelper.tokenIdToStarInfo(token);
            expect(star).to.deep.equal(starOneDesc);
        });
    });

    describe('Testing ownerOf', () => {
        it('should return the correct owner of an existing star', async()=> {
            let owner = await ethereumHelper.ownerOf(token);
            expect (owner).to.equal(ownerAddress);
        });

        it('should return 0x000 owner for an inexisting star', async()=> {
            let owner = await ethereumHelper.ownerOf(2189);
            expect (owner).to.equal('0x0000000000000000000000000000000000000000');
        });
    });

    describe('Testing SetApprovalForAll', () => {
        it('should set approval for all for given operator', async() => {
            let emptyResult = await ethereumHelper.setApprovalForAll(secondAddress, true, ownerAddress);
            expect (emptyResult.length).to.equal(66);
        });

        it('should set not approval for all if operator is owner', async() => {
            try {
                await ethereumHelper.setApprovalForAll(ownerAddress, true, ownerAddress);
            } catch(error){
                expect(error).to.be.an('Error');
            }
        });
    });

    describe('Testing isApprovedForAll', () => {
        it('should return true if operator is approvedForAll for the given owner', async () => {
            let approved = await ethereumHelper.isApprovedForAll(ownerAddress, secondAddress);
            expect (approved).to.be.true;
        });

        it('should return false if operator is not approvedForAll for the given owner', async () => {
            let approved = await ethereumHelper.isApprovedForAll(ownerAddress, thirdAddress);
            expect (approved).to.be.false;
        });
    });

    describe('Testing putStarUpForSale', () => {
        it('should not allow unauthorized account to put star for sale', async() => {
            expectToThrow (ethereumHelper.putStarUpForSale(token, 100, thirdAddress),'Error', 'VM Exception while processing transaction: revert');
        });

        it('should not allow operator to put star up for sale', async() => {
            expectToThrow (ethereumHelper.putStarUpForSale(token, 100, secondAddress),'Error', 'VM Exception while processing transaction: revert');
        });

        it('should not allow to put inexistent star for sale', async() => {
            expectToThrow (ethereumHelper.putStarUpForSale(2, 100, secondAddress),'Error', 'VM Exception while processing transaction: revert');
        });

        it('should allow only owner to put star up for sale', async() => {
            let tx = await ethereumHelper.putStarUpForSale(token, 100, ownerAddress);
            expect (tx.length).to.equal(66);
        });
    });

    describe('Testing starsForSale', () => {
        it('should get the corrrect price for a star that is up for sale', async() => {
            expect((await ethereumHelper.starsForSale(token)).toNumber()).to.equal(100);
        });

        it('should return 0 for star that it not for sale/does not exist', async() => {
            expect((await ethereumHelper.starsForSale(2081)).toNumber()).to.equal(0);
        });
    });

    describe('Testing checkIfStarExist', () => {
        it('should return true if stars exists', async() => {
            expect(await ethereumHelper.checkIfStarExist(starOne.cent, starOne.dec, starOne.mag)).to.be.true;
        });

        it('should return false if star does not exist', async() => {
            expect(await ethereumHelper.checkIfStarExist('1','2','2')).to.be.false;
        });
    });

    describe('Testing getApproved', () => {
        it('should return 0x00 address if no approved user exist for a token', async() => {
            let approvedAddress = await ethereumHelper.getApproved(token+1);
            expect(approvedAddress).to.equal('0x0000000000000000000000000000000000000000');
        });
    });

    describe('Testing approve', () => {
        it('should not approve if the caller is not the owner of token', async() => {
            expectToThrow (ethereumHelper.approve(thirdAddress, token, thirdAddress),'Error', 'VM Exception while processing transaction: revert');
        });

        it('should not approve if the token does not exist', async() => {
            expectToThrow (ethereumHelper.approve(thirdAddress, 2196, thirdAddress),'Error', 'VM Exception while processing transaction: revert');
        });

        it('should approve if the caller is owner of address and verify this', async() => {
            let tx =  await ethereumHelper.approve(secondAddress, token, ownerAddress);
            expect(tx.length).to.equal(66);

            let approvedAddress = await ethereumHelper.getApproved(token);
            expect(approvedAddress).to.equal(secondAddress);
        });
    });

    describe('Testing createStar', () => {
        it('should not create a star if star COORDS already exists', async() => {
            expectToThrow (ethereumHelper.createStar(starOne.name, starOne.name, starOne.cent, starOne.dec, starOne.mag, getRandomInt(2000), ownerAddress),'Error', 'VM Exception while processing transaction: revert Star already exists!');
        });
 
        it('should not create a star if star TOKEN already exist', async() => {
            expectToThrow (ethereumHelper.createStar("SomeName", "SomeDescription", getRandomInt(2000), starOne.dec, starOne.mag, token, ownerAddress),'Error', 'VM Exception while processing transaction: revert');
        });

        it('should create a new unique star', async() => {
            let starMag = getRandomInt(2000);
            let starToken = starMag+ 1;
            let tx = await ethereumHelper.createStar("S", "tory", 1243, 432, starMag, starToken, ownerAddress);
            expect (tx.length).to.equal(66);

            expect(await ethereumHelper.ownerOf(starToken)).to.equal(ownerAddress);
        });
    });

    describe('Testing buyStar', () => {
        it('should not allow to buy star if not enought money', () => {
            expectToThrow (ethereumHelper.buyStar(token, secondAddress, 50), 'Error', 'VM Exception while processing transaction: revert');
        });

        it('should not allow to buy star if it is not up for sale', () => {
            expectToThrow (ethereumHelper.buyStar(token+1, secondAddress, 110), 'Error', 'VM Exception while processing transaction: revert');
        });

        it('should allow to buy star', async() => {
            let tx = await ethereumHelper.buyStar(token, secondAddress, 110);
            expect(tx.length).to.equal(66);
        });
    });

    describe('Testing safeTransferFrom', () => {
        it('should not allow unauthorized addresses to transfer an existing token', async() => {
            expectToThrow (ethereumHelper.safeTransferFrom(secondAddress, thirdAddress, token, thirdAddress), 'Error', 'VM Exception while processing transaction: revert');
        });

        it('should not allow to transfer unexisting tokens', async() => {
            expectToThrow (ethereumHelper.safeTransferFrom(ownerAddress, secondAddress, 5332, secondAddress), 'Error', 'VM Exception while processing transaction: revert');
        });

        it('should allow the owner to transfer a token to another address and verify', async() => {
            let tx = await ethereumHelper.safeTransferFrom(secondAddress, thirdAddress, token, secondAddress);
            expect(tx.length).to.equal(66);

            let newOwner = await ethereumHelper.ownerOf(token);
            expect(newOwner).to.equal(thirdAddress);
        });
    });

    describe('Testing mint', () => {
        it('should not mint the same token again', async() => {
            expectToThrow (ethereumHelper.mint(token+1, ownerAddress), 'Error', 'VM Exception while processing transaction: revert');
        });

        it('should mint a new token and assign it to the rightful owner', async() => {
            let newToken = getRandomInt(2000);
            let tx = await ethereumHelper.mint(newToken, thirdAddress);
            expect(tx.length).to.equal(66);

            let newOwner = await ethereumHelper.ownerOf(newToken);
            expect(newOwner).to.equal(thirdAddress);
        });

    });
});

var expectToThrow = async(promise, error, errorMessage) => {
    try {
        await promise;
    } catch (err){
        expect(err).to.be.an(error);
        expect(err.message).to.deep.equal(errorMessage);
    }
};

var getRandomInt = (max) => {
    return Math.floor(Math.random() * Math.floor(max));
  }