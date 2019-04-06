const supertest = require('supertest');
const expect = require('chai').expect;
const sinon = require('sinon');

const app = require('./app.js').app;
const server = require('./app.js').server;
const ethereumHelper = require('./app.js').ethereumHelper;

after(async () =>{
    await server.close();
});

let inexistentToken = 2916;

let ownerAddress = '0x4fda5baf52b8ff93399673f3f89a93ef31066ad8';
let secondAddress = '0x15e542f44d1f0811ec4453fa5493eff1859f89b6';
let thirdAddress = '0x3962def6c998ec7a5e81460bfba65b1982282f3c';
let zeroAddress = '0x0000000000000000000000000000000000000000';

describe.skip('ExpressJs Server BackEnd Testing - Mocked EthereumHelper', () => {
    describe('Testing /star/{starTokenId}', () => {
        let tokenIdToStarInfoStub;
        before(() =>{
            tokenIdToStarInfoStub = sinon.stub(ethereumHelper, 'tokenIdToStarInfo');
        });

        after(() =>{
            tokenIdToStarInfoStub.restore();
        });        
        
        it('should return 404 and empty star if star token cannot be found', async() => {
            tokenIdToStarInfoStub.withArgs('2916').returns(['','','','','']);
            let response = await supertest(app).get(`/star/${inexistentToken}`);
            expect(response.status).to.equal(404);
            expect(response.body).to.have.lengthOf(5);
            expect(response.body).to.deep.equal(["","","","",""]);
        });

        it('should return 200 and star details for the given token', async() => {
            let starDetails = '["StarName","StarStory","cent_101","dec_104","mag_104"]';
            tokenIdToStarInfoStub.withArgs('1').returns(starDetails);
            let response = await supertest(app).get(`/star/${token}`);
            expect(response.status).to.equal(200);
            expect(response.text).to.deep.equal(starDetails);
        });

        it('should return 500 if major error occurs (eg: contract not found etc', async() => {
            tokenIdToStarInfoStub.withArgs('2916').throws('Error', 'Major error');
            let response = await supertest(app).get(`/star/${inexistentToken}`);
            expect(response.status).to.equal(500);
        });
    });
    
    describe('Testing star/ownerof/{token}', () => {
        let ownerOfStub;
        before(() =>{
            ownerOfStub = sinon.stub(ethereumHelper, 'ownerOf');
        });

        after(() =>{
            ownerOfStub.restore();
        });   

        it('should return status 200 and correct owner address of an existing starToken', async() => {
            ownerOfStub.withArgs(token).returns(ownerAddress);
            let response = await supertest(app).get(`/star/ownerof/${token}`);
            expect(response.status).to.equal(200);
            expect(response.text).to.deep.equal(ownerAddress);
        });

        it('should return 404 and 0x00 owner address of an inexistent starToken', async() => {
            ownerOfStub.withArgs(inexistentToken).returns('0x0000000000000000000000000000000000000000');
            let response = await supertest(app).get(`/star/ownerof/${inexistentToken}`);
            expect(response.status).to.equal(404);
            expect(response.text).to.deep.equal('0x0000000000000000000000000000000000000000');
        });

    });
});

describe('ExpressJs Server BackEnd Testing - Real EthereumHelper', () => {
    //Create a star with ["StefanStar", "StefanStarStory", "1", "2","3"] for tokenId = 1;
    let token;
    let token2;
    let starOne = {name: 'Name01', story: "Story01", cent: "032.155", dec: "121.874", mag: "245.978"};
    let starTwo = {name: 'Name02', story: "Story02", cent: "032.155", dec: "121.874", mag: "245.978"};
    
    before(async() =>{
        token = getRandomInt(2000);
        token2 = token +1;
        starOne.mag = token.toString();
        starTwo.mag = (token2).toString();
        starOneDesc = `["${starOne.name}","${starOne.story}","ra_${starOne.cent}","dec_${starOne.dec}","mag_${starOne.mag}"]`;
        
        await ethereumHelper.createStar(starOne.name, starOne.story, starOne.cent, starOne.dec, starOne.mag, token, ownerAddress);
        await ethereumHelper.createStar(starTwo.name, starTwo.story, starTwo.cent, starTwo.dec, starTwo.mag, token2, ownerAddress);
    });
    
    describe('Testing GET /star/{starTokenId}', () => {
        it('should return 200 and star details for the given token', async() => {
            let response = await supertest(app).get(`/star/${token}`);
            expect(response.status).to.equal(200);
            expect(response.text).to.deep.equal(starOneDesc.toString());
        });

        it('should return 404 and empty star if star token cannot be found', async() => {
            let response = await supertest(app).get(`/star/${inexistentToken}`);
            expect(response.status).to.equal(404);
            expect(response.text).to.deep.equal('["","","","",""]');
        });
    });
    
    describe('Testing GET /star/ownerof/{starTokenId}', () => {
        it('should return status 200 and correct owner address of an existing starToken', async() => {
            let response = await supertest(app).get(`/star/ownerof/${token}`);
            expect(response.status).to.equal(200);
            expect(response.text).to.deep.equal(ownerAddress);
        });

        it('should return 404 and 0x00 owner address of an inexistent starToken', async() => {
            let response = await supertest(app).get(`/star/ownerof/${inexistentToken}`);
            expect(response.status).to.equal(404);
            expect(response.text).to.deep.equal('0x0000000000000000000000000000000000000000');
        });
    });

    describe('Testing PATCH /star/setApprovalForAll', () => {
        it('should return 200 and tx value for setApprovalForAll', async () => {
            let response = await supertest(app).patch('/star/setApprovalForAll').send({
                "to": secondAddress,
                "approved": true,
                "owner": ownerAddress
            });
            expect(response.status).to.equal(200);
            expect(response.text.length).to.equal(66);
        });

        it('should return 400 and error message if incorrect to address', async() => {
            let response = await supertest(app).patch('/star/setApprovalForAll').send({
                "to": ownerAddress,
                "approved": true,
                "owner": ownerAddress
            });
            expect(response.status).to.equal(400);
            expect(response.error.text).to.equal('Error : could not setApprovalForAll due to invalid parameters');
        });
    });

    describe('Testing GET /star/isApprovedForAll', () => {
        it('should return 200 and true if address is approvedForAll for given owner', async() => {
            let response = await supertest(app).get('/star/isApprovedForAll/').query({owner : ownerAddress, operator : secondAddress});
            expect(response.status).to.equal(200);
            expect(response.text).to.equal('true');
        });

        it('should return 200 and false if address is NOT approvedForAll for given owner', async() => {
            let response = await supertest(app).get('/star/isApprovedForAll').query({owner: ownerAddress, operator: thirdAddress});
            expect(response.status).to.equal(200);
            expect(response.text).to.equal('false');
        });
    });

    describe('Testing PATCH /star/putStarUpForSale', () => {
        it('should not allow unauthorized address to putStarUpForSale', async () =>{
            let response = await supertest(app).patch('/star/putStarUpForSale').send({
                token,
                price:100,
                owner:thirdAddress
            });
            expect(response.status).to.equal(403);
            expect(response.text).to.equal("Only the owner can put a star up for sale");
        });

        it('should allow owner only to putStarUpForSale', async () =>{
            let response = await supertest(app).patch('/star/putStarUpForSale').send({
                token,
                price:100,
                owner:ownerAddress
            });
            expect(response.status).to.equal(200);
            expect(response.text.length).to.equal(66);
        });
    });

    describe('Testing GET /star/starsForSale', () => {
        it('should return 200 and the corrrect price star', async () => {
            let response = await supertest(app).get(`/star/starsForSale/${token}`);
            expect(response.status).to.equal(200);
            expect(parseInt(response.text)).to.deep.equal(100);
        });

        it('should return 200 and 0 price if star is not for sale', async () => {
            let response = await supertest(app).get(`/star/starsForSale/${inexistentToken}`);
            expect(response.status).to.equal(200);
            expect(parseInt(response.text)).to.deep.equal(0);
        });
    });

    describe('Testing GET /star/checkIfStarExist', () => {
        it('should return 200 and true if star coorinates already exist', async() =>{
            let response = await supertest(app).get('/star/checkIfStarExist/').query({cent: starOne.cent, dec:starTwo.dec, mag:starOne.mag});
            expect(response.status).to.equal(200);
            expect(response.text).to.equal("true");
        });

        it('should return 200 and false if star coorinates do not exist', async() =>{
            let response = await supertest(app).get('/star/checkIfStarExist/').query({cent: 1, dec:2, mag:2});
            expect(response.status).to.equal(200);
            expect(response.text).to.equal("false");
        });
    });

    describe('Testing GET /star/getApproved/:token', () =>{
        it('should return 0x00 if the token has no approved address', async() =>{
            let response = await supertest(app).get(`/star/getApproved/${token2}`);
            expect(response.status).to.equal(200);
            expect(response.text).to.equal(zeroAddress);
        });
    });

    describe('Testing PATCH /star/approve', () => {
        it('should return 403 and not approve if caller is not the owner', async() => {
            let response = await supertest(app).patch('/star/approve').send({to: thirdAddress, token, owner: thirdAddress});
            expect(response.status).to.equal(403);
            expect(response.text).to.equal('Only token owners can set approved');
        });

        it('should return 200 approve and verify approved', async() => {
            let response = await supertest(app).patch('/star/approve').send({to: secondAddress, token, owner: ownerAddress});
            expect(response.status).to.equal(200);
            expect(response.text.length).to.equal(66);

            let approvedResponse = await supertest(app).get(`/star/getApproved/${token}`);
            expect(approvedResponse.status).to.equal(200);
            expect(approvedResponse.text).to.equal(secondAddress);
        });
    });

    describe('Testing POST /star', () => {
        it('should return 400 and not create a new star if duplicate star coords', async() =>{
            let result = await supertest(app).post('/star').send({name:starOne.name, story: starOne.story, cent: starOne.cent, dec: starOne.dec, mag: starOne.mag, token :getRandomInt(2000), owner: ownerAddress});
            expect (result.status).to.equal(400);
            expect (result.text).to.have.string('Unable to create star : possible duplicate token, coordonates. Reason:');
        });

        it('should return 400 and not create a new star if duplicate star token', async() =>{
            let randomMag = getRandomInt(2000);
            let result = await supertest(app).post('/star').send({name:starOne.name, story: starOne.story, cent: starOne.cent, dec: starOne.dec, mag: randomMag, token, owner: ownerAddress});
            expect (result.status).to.equal(400);
            expect (result.text).to.have.string('Unable to create star : possible duplicate token, coordonates. Reason:');
        });

        it('should return 200 and create an unique star', async() =>{
            let randomMag = getRandomInt(2000);
            let newToken = randomMag+1;
            let result = await supertest(app).post('/star').send({name:starOne.name, story: starOne.story, cent: starOne.cent, dec: starOne.dec, mag: randomMag, token: newToken, owner: ownerAddress});
            expect (result.status).to.equal(200);
            expect (result.text.length).to.equal(66);
        });
    });

    describe('Testing PATCH /star/buyStar', () => {
        it('should return 400 and not allow to buy star if not enough value offered', async() => {
            let result = await supertest(app).patch('/star/buyStar').send({token, buyer: secondAddress, value: 50});
            expect(result.status).to.equal(400);
            expect(result.text).to.have.string('Unable to buy star. Reason:');
        });

        it('should return 400 and not allow to buy star if star is not up for sale', async() => {
            let result = await supertest(app).patch('/star/buyStar').send({token:token2, buyer: secondAddress, value: 50});
            expect(result.status).to.equal(400);
            expect(result.text).to.have.string('Unable to buy star. Reason:');
        });

        it('should return 200, tx and allow to buy star', async() => {
            let result = await supertest(app).patch('/star/buyStar').send({token, buyer: secondAddress, value: 150});
            expect(result.status).to.equal(200);
            expect(result.text.length).to.equal(66);
        });
    });

    describe('Testing PATCH /star/safeTransferFrom', async() => {
        it('should return 400 and not allow token transfer if caller is not the owner', async() => {
            let result = await supertest(app).patch('/star/safeTransferFrom').send({from:secondAddress, to:thirdAddress, token, owner:thirdAddress});
            expect(result.status).to.equal(400);
            expect(result.text).to.have.string('Unable to transfer token. Reason:');
        });

        it('should return 400 and not allow token transfer if token does not exist', async() => {
            let result = await supertest(app).patch('/star/safeTransferFrom').send({from:secondAddress, to:thirdAddress, token: 2096, owner:thirdAddress});
            expect(result.status).to.equal(400);
            expect(result.text).to.have.string('Unable to transfer token. Reason:');
        });

        it('should return 400 and not allow token transfer if FROM does not own the token', async() => {
            let result = await supertest(app).patch('/star/safeTransferFrom').send({from:ownerAddress, to:thirdAddress, token, owner:secondAddress});
            expect(result.status).to.equal(400);
            expect(result.text).to.have.string('Unable to transfer token. Reason:');
        });

        it('should return 200 and allow token transfer', async() => {
            let result = await supertest(app).patch('/star/safeTransferFrom').send({from:secondAddress, to:thirdAddress, token, owner:secondAddress});
            expect(result.status).to.equal(200);
            expect(result.text.length).to.equal(66);

            let result2 = await supertest(app).get(`/star/ownerof/${token}`);
            expect(result2.status).to.equal(200);
            expect(result2.text).to.deep.equal(thirdAddress);
        });
    });

    describe('Testing POST /star/mint', () => {
        it('should return 200 and not mint if token exists already', async() => {
            let result = await supertest(app).post('/star/mint').send({token, owner: ownerAddress});
            expect(result.status).to.equal(400);
            expect(result.text).to.have.string('Unable to mint token. Reason:');
        });

        it('should return 200, tx and mint a new token', async() => {
            let newToken = getRandomInt(2000);
            let result = await supertest(app).post('/star/mint').send({token: newToken, owner: ownerAddress});
            expect(result.status).to.equal(200);
            expect(result.text.length).to.equal(66);

            let result2 = await supertest(app).get(`/star/ownerof/${newToken}`);
            expect(result2.status).to.equal(200);
            expect(result2.text).to.deep.equal(ownerAddress);
        });
    });
});

var getRandomInt = (max) => {
    return Math.floor(Math.random() * Math.floor(max));
}