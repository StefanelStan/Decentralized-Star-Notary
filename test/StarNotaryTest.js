const expect = require('chai').expect;

const StarNotaryContractDefinition = artifacts.require('StarNotary');

contract('StarNotary', accounts => {
    var contractInstance;
    let tokenId = 1;
    let starOne = {
        name: 'Name01',
        story: "Story01",
        cent: "032.155",
        dec: "121.874",
        mag: "245.978"
    };

    let starTwo = {
        name: 'Name02',
        story: "Story02",
        cent: "032.1555",
        dec: "121.8744",
        mag: "245.9788"
    };

    beforeEach(async() => {
        contractInstance = await StarNotaryContractDefinition.new({from: accounts[0]});
    });

    describe('Test suite : checkIfStarExist', () => {
        it('should return false if star does not exist', async() =>{
            let exists = await contractInstance.checkIfStarExist(starOne.cent, starOne.dec, starOne.mag);
            expect (exists).to.be.false;
        });

    });

    describe('Test suite : createStar', () => {
        it('should create a new star and verify its existence', async()=>{
            //create a star
            await contractInstance.createStar(starOne.name, starOne.story, starOne.cent, starOne.dec, starOne.mag, tokenId, {from: accounts[0]});
            //public mapping so we can fetch it and get its name..if exists
            expect(await contractInstance.checkIfStarExist(starOne.cent, starOne.dec, starOne.mag)).to.be.true;
        });

        it('should not allow to create a star if another star exists', async()=>{
            await contractInstance.createStar(starOne.name, starOne.story, starOne.cent, starOne.dec, starOne.mag, tokenId, {from: accounts[0]});
            await expectToThrow(contractInstance.createStar(starOne.name, starOne.story, starOne.cent, starOne.dec, starOne.mag, 2, {from: accounts[1]}),
                                'Error', 'VM Exception while processing transaction: revert Star already exists!'); 
        });

        it('should not allow to create a star if tokenId already exists', async() => {
            await contractInstance.createStar(starOne.name, starOne.story, starOne.cent, starOne.dec, starOne.mag, tokenId, {from: accounts[0]});
            await expectToThrow(contractInstance.createStar(starTwo.name, starTwo.story, starTwo.cent, starTwo.dec, starTwo.mag, tokenId, {from: accounts[2]}),
                                'Error', 'VM Exception while processing transaction: revert'); 
        });
    });

    describe('Test suite : mint', () => {
        it('should mint a token for a given user if no other token exists and validate ownershp', async()=>{
            await contractInstance.mint(tokenId, {from: accounts[0]});
            expect(await contractInstance.ownerOf(tokenId)).to.equal(accounts[0]);
        });
        
        it('should NOT mint an identical token for the same user', async()=>{
            await contractInstance.mint(tokenId, {from: accounts[0]});
            await expectToThrow(contractInstance.mint(tokenId, {from: accounts[0]}),
                                'Error', 'VM Exception while processing transaction: revert');
        });

        it('should NOT mint an identical token for another user', async()=>{
            await contractInstance.mint(tokenId, {from: accounts[0]});
            await expectToThrow(contractInstance.mint(tokenId, {from: accounts[1]}),
                                'Error', 'VM Exception while processing transaction: revert');
        });
    });

    describe('Test suite : ownerOf', () => {
        it('should return the correct owner of a token', async () => {
            await contractInstance.mint(2, {from: accounts[1]});
            expect(await contractInstance.ownerOf(2)).to.equal(accounts[1]);
        });

        it('should return exception if token does not exist', async() => {
            await expectToThrow(contractInstance.ownerOf(tokenId),
                                'Error', 'VM Exception while processing transaction: revert');
        });
    });
        
    describe('Test suite : approve', () => {
        
        beforeEach(async() => {
            await contractInstance.mint(tokenId, {from: accounts[0]});
        });

        it('should not approve if token does not exist', async() => {
            await expectToThrow(contractInstance.approve(accounts[1], 2, {from: accounts[0]}),
                                'Error', 'VM Exception while processing transaction: revert');
        });

        it('should not approve if approved address is the caller', async() => {
            await expectToThrow(contractInstance.approve(accounts[0], tokenId, {from: accounts[0]}),
                                'Error', 'VM Exception while processing transaction: revert');
        });

        it('should not approve if the token does not belong to the caller', async() => {
            await expectToThrow(contractInstance.approve(accounts[2], tokenId, {from: accounts[1]}),
                                'Error', 'VM Exception while processing transaction: revert');
        });

        it('should override the current approved address when approving a new address', async() => {
            await contractInstance.approve(accounts[1], tokenId, {from: accounts[0]});
            expect(await contractInstance.getApproved(tokenId)).to.equal(accounts[1]);
            
            await contractInstance.approve(accounts[2], tokenId, {from: accounts[0]});
            expect(await contractInstance.getApproved(tokenId)).to.equal(accounts[2]);
        });

        it('should approve the given token to given address and emit the event', async() => {
            let tx = await contractInstance.approve(accounts[1], tokenId, {from: accounts[0]});
            expect(tx.logs[0].event).to.equal('Approval');
        });
    });
 
    describe('Test suite : getApproved',() => {
        beforeEach(async() => {
            await contractInstance.mint(tokenId, {from: accounts[0]});
        });
        
        it('should get the correct address of the approved for a given token', async() => {
            await contractInstance.approve(accounts[1], tokenId, {from: accounts[0]});
            expect(await contractInstance.getApproved(tokenId)).to.equal(accounts[1]);
        });

        it('should return 0x000 address if there is no approved address for a token', async()=>{
            expect(await contractInstance.getApproved(tokenId)).to.equal('0x0000000000000000000000000000000000000000');
        });
    });

    describe('Test suite : safeTransferFrom', () => {
        beforeEach(async() => {
            await contractInstance.mint(tokenId, {from: accounts[0]});
        });

        it('should not allow to transfer inexistent tokens', async() => {
            await expectToThrow(contractInstance.safeTransferFrom(accounts[0], accounts[1], 2, {from: accounts[0]}),
                                'Error', 'VM Exception while processing transaction: revert');
        });
        
        it('should not allow unauthorized addresses to transfer an existing token', async() => {
            await expectToThrow(contractInstance.safeTransferFrom(accounts[0], accounts[2], tokenId, {from: accounts[1]}),
                                'Error', 'VM Exception while processing transaction: revert');
        });
        
        it('should allow the owner to transfer to token to himself (OpenZeppelin ERC721.sol is illogical here)', async() => {
            await contractInstance.safeTransferFrom(accounts[0], accounts[0], tokenId, {from: accounts[0]});
            expect(await contractInstance.ownerOf(tokenId)).to.equal(accounts[0]);
        });

        it('should allow the owner to transfer a token to another address', async() => {
            await contractInstance.safeTransferFrom(accounts[0], accounts[1], tokenId, {from: accounts[0]});
            expect(await contractInstance.ownerOf(tokenId)).to.equal(accounts[1]);
        });

        it('should allow owner to transfer token to an approved person and nullify the approved for the token', async() => {
            await contractInstance.approve(accounts[1], tokenId, {from: accounts[0]});
            await contractInstance.safeTransferFrom(accounts[0], accounts[1], tokenId, {from: accounts[0]});

            expect(await contractInstance.ownerOf(tokenId)).to.equal(accounts[1]);
            //approved list should be empty as accounts[1] OWNS the token
            expect(await contractInstance.getApproved(tokenId)).to.equal('0x0000000000000000000000000000000000000000');
        });

        it('should allow an approved person to transfer the token to another address', async() =>{
            await contractInstance.approve(accounts[1], tokenId, {from: accounts[0]});
            expect(await contractInstance.getApproved(tokenId)).to.equal(accounts[1]);
            expect(await contractInstance.ownerOf(tokenId)).to.equal(accounts[0]);

            await contractInstance.safeTransferFrom(accounts[0], accounts[2], tokenId, {from: accounts[1]});

            expect(await contractInstance.ownerOf(tokenId)).to.equal(accounts[2]);
            expect(await contractInstance.getApproved(tokenId)).to.equal('0x0000000000000000000000000000000000000000');
        });
        
    });

    describe('Test suite : isApprovedForAll', () => {
        let tokenId2 = 2;
        let operatorOne = accounts[8];
        let operatorTwo = accounts[9];
        it('should return false if an operator is not approved for an address', async() => {
            expect(await contractInstance.isApprovedForAll(accounts[8], operatorOne)).to.be.false;
        });

        it('should return true if an operator is set for an address', async() => {
            await contractInstance.SetApprovalForAll(operatorOne, true, {from: accounts[0]});

            expect(await contractInstance.isApprovedForAll(accounts[0], operatorOne)).to.be.true;
            expect(await contractInstance.isApprovedForAll(accounts[1], operatorOne)).to.be.false;
            expect(await contractInstance.isApprovedForAll(accounts[0], operatorTwo)).to.be.false;
        });
    });

    describe('Test suite : setApprovalForAll', () => {
        let tokenId2 = 2;
        let operatorOne = accounts[8];
        let operatorTwo = accounts[9];

        beforeEach(async() => {
            await contractInstance.mint(tokenId, {from: accounts[0]});
        });

        it('should allow the owner set multiple operators for his account', async() => {
            await contractInstance.SetApprovalForAll(operatorOne, true, {from: accounts[0]});
            await contractInstance.SetApprovalForAll(operatorTwo, true, {from: accounts[0]});
            expect(await contractInstance.isApprovedForAll(accounts[0], operatorOne)).to.be.true;
            expect(await contractInstance.isApprovedForAll(accounts[0], operatorTwo)).to.be.true;
        });

        it('should emit the correct event', async() => {
            let tx = await contractInstance.SetApprovalForAll(operatorOne, true, {from: accounts[0]});
            expect(tx.logs[0].event).to.equal('ApprovalForAll');
        });

        //add more functions to test if the operator can do transactions, tokens, transfers etc. 13/13/2018 23:24
        it('should approve an operator to do operations as owner: transferToken', async() => {
            await contractInstance.SetApprovalForAll(operatorOne, true, {from: accounts[0]});
            await contractInstance.safeTransferFrom(accounts[0], accounts[1], tokenId, {from: operatorOne});
            expect(await contractInstance.ownerOf(tokenId)).to.equal(accounts[1]);
        });

        it('should approve an operator to do operations as owner: approve', async () => {
            await contractInstance.SetApprovalForAll(operatorOne, true, { from: accounts[0] });
            await contractInstance.approve(accounts[1], tokenId, { from: operatorOne });
            expect(await contractInstance.getApproved(tokenId)).to.equal(accounts[1]);
        });
    });

    describe('Test Suite : putStarUpForSale', ()=>{
        let starPrice = web3.toWei(.01, "ether");

        beforeEach(async() => {
            await contractInstance.createStar(starOne.name, starOne.story, starOne.cent, starOne.dec, starOne.mag, 
                                              tokenId, {from: accounts[1]});
        });
        
        it('should not allow operator to put star up for sale', async() => {
            await contractInstance.SetApprovalForAll(accounts[2], true, {from: accounts[1]});
            await expectToThrow(contractInstance.putStarUpForSale(tokenId, starPrice, {from: accounts[2]}),
                                'Error', 'VM Exception while processing transaction: revert');      
        });

        it('should not allow an approved to put star up for sale', async() => {
            await contractInstance.approve(accounts[2], tokenId, {from: accounts[1]});
            await expectToThrow(contractInstance.putStarUpForSale(tokenId, starPrice, {from: accounts[2]}),
                                'Error', 'VM Exception while processing transaction: revert');      
        });

        it('should not allow unauthorized address to put star up for sale', async() => {
            await expectToThrow(contractInstance.putStarUpForSale(tokenId, starPrice, {from: accounts[2]}),
                                'Error', 'VM Exception while processing transaction: revert');      
        });

        it('should allow owner to put star up for sale', async() => {
            await contractInstance.putStarUpForSale(tokenId, starPrice, {from: accounts[1]});
            let recordedPrice = await contractInstance.starsForSale(tokenId);
            expect(recordedPrice.toNumber()).to.deep.equal(parseInt(starPrice));
        });
    });

    describe('Test suite : starsForSale', () => {
        let starPrice = web3.toWei(.01, "ether");
        
        beforeEach(async()=>{
            await contractInstance.createStar(starOne.name, starOne.story, starOne.cent, starOne.dec, starOne.mag, 
                                              tokenId, {from: accounts[1]});
        });

        it('should return the correct price for a star that is up for sale', async() => {
            await contractInstance.putStarUpForSale(tokenId, starPrice, {from: accounts[1]});
            let recordedPrice = await contractInstance.starsForSale(tokenId);
            expect(recordedPrice.toNumber()).to.deep.equal(parseInt(starPrice));
        });

        it('should return 0 as price for a star that exists but is not up for sale', async() => {
            let recordedPrice = await contractInstance.starsForSale(tokenId);
            expect(recordedPrice.toNumber()).to.deep.equal(0);
        });

        it('should return 0 as price for a star that does not exist at all', async() => {
            let recordedPrice = await contractInstance.starsForSale(2);
            expect(recordedPrice.toNumber()).to.deep.equal(0);
        });
    });

    describe('Test suite : tokenIdToStarInfo', () => {
        beforeEach(async()=>{
            await contractInstance.createStar(starOne.name, starOne.story, starOne.cent, starOne.dec, starOne.mag, 
                                              tokenId, {from: accounts[1]});
        
            await contractInstance.createStar(starTwo.name, starTwo.story, starTwo.cent, starTwo.dec, starTwo.mag, 
                                              2, {from: accounts[1]});
        });
        
        it('should return empty if token does not exist', async() => {
            let starInfo = await contractInstance.tokenIdToStarInfo(3);
            expect(starInfo[0]).to.deep.equal('');
            expect(starInfo[1]).to.deep.equal('');
            expect(starInfo[2]).to.deep.equal('');
            expect(starInfo[3]).to.deep.equal('');
            expect(starInfo[4]).to.deep.equal('');
        });

        it('should return the correct star info', async() => {
            let secondStar = await contractInstance.tokenIdToStarInfo(2);
            expect(secondStar[0]).to.deep.equal(starTwo.name);
            expect(secondStar[1]).to.deep.equal(starTwo.story);
            expect(secondStar[2]).to.deep.equal("ra_" + starTwo.cent);
            expect(secondStar[3]).to.deep.equal("dec_" + starTwo.dec);
            expect(secondStar[4]).to.deep.equal("mag_" + starTwo.mag);

            let firstStar = await contractInstance.tokenIdToStarInfo(tokenId);
            expect(firstStar[0]).to.deep.equal(starOne.name);
            expect(firstStar[1]).to.deep.equal(starOne.story);
            expect(firstStar[2]).to.deep.equal("ra_" + starOne.cent);
            expect(firstStar[3]).to.deep.equal("dec_" + starOne.dec);
            expect(firstStar[4]).to.deep.equal("mag_" + starOne.mag);
        });
    });

    describe('Test suite : buyStar', () => {
        let starPrice = web3.toWei(.01, "ether");
        let lowerPrice = web3.toWei(.005, "ether");
        let higherPrice = web3.toWei(.45, "ether");

        beforeEach(async()=>{
            await contractInstance.createStar(starOne.name, starOne.story, starOne.cent, starOne.dec, starOne.mag, 
                                             tokenId, {from: accounts[1]});
            await contractInstance.putStarUpForSale(tokenId, starPrice, {from: accounts[1]});
        });

        it('should not allow to buy a star if it is not up for sale', async()=>{
            await contractInstance.createStar(starTwo.name, starTwo.story, starTwo.cent, starTwo.dec, starTwo.mag, 
                                             2, {from: accounts[1]});
            await expectToThrow(contractInstance.buyStar(2, {from:accounts[2]}),
                                'Error', 'VM Exception while processing transaction: revert');
        });

        it('should not allow to buy a star if the token/star does not exist', async()=>{
            await expectToThrow(contractInstance.buyStar(2, {from:accounts[2]}),
                                'Error', 'VM Exception while processing transaction: revert');
        });

        it('should not allow to buy a star if the caller does not offer enough', async()=>{
            await expectToThrow(contractInstance.buyStar(tokenId, {from: accounts[2], value: lowerPrice}),
                                'Error', 'VM Exception while processing transaction: revert'); 
        });

        it('should allow to buy a star and transfer ownership and remove it from sale', async()=>{
            await contractInstance.buyStar(tokenId, {from: accounts[2], value: starPrice});
            
            let recordedPrice = await contractInstance.starsForSale(tokenId);
            expect (recordedPrice.toNumber()).to.equal(0);
            expect(await contractInstance.ownerOf(tokenId)).to.equal(accounts[2]);
        });

        it('should deal correctly balances when overpaid', async()=>{
            let account2BalaceBefore = web3.eth.getBalance(accounts[2]);
            let account1BalanceBefore = web3.eth.getBalance(accounts[1]);
            
            await contractInstance.buyStar(tokenId, {from: accounts[2], value: higherPrice, gasPrice: 0});
            let account2BalanceAfter = web3.eth.getBalance(accounts[2]);
            let account1BalanceAfter = web3.eth.getBalance(accounts[1]);
            let account2Difference = account2BalaceBefore.sub(account2BalanceAfter);
            let account1Difference = account1BalanceAfter.sub(account1BalanceBefore);
            
            expect(account2Difference.toNumber()).to.equal(parseInt(starPrice));
            expect(account1Difference.toNumber()).to.equal(parseInt(starPrice));
        });
    });

});

var expectToThrow = async(promise, errorType, errorMessage) => {
    try {
        await promise;
    }
    catch(error){
        expect(error).to.be.an(errorType);
        expect(error.message).to.deep.equal(errorMessage);
        return;
    }
    assert.fail(`Expected to throw an ${errorType} with message ${errorMessage}`);
}