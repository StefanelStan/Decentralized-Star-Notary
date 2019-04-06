var express = require('express');
var bodyParser = require('body-parser');

var {EthereumHelper} = require('./middleware/EthereumHelper.js');

var app = express();
const port = 8000;


var ethereumHelper = new EthereumHelper();
app.use(bodyParser.json());

app.get('/star/:starTokenId', async (request, response) => {
    let token = request.params.starTokenId;
    if (token === 'isApprovedForAll')
        return isApprovedForAll(request, response);
    else if (token === 'ownerof')
        return response.redirect('/star/ownerof/:token');
    else if (token === 'checkIfStarExist')
        return checkIfStarExist(request, response);
    else if (token === 'getApproved')
        return response.redirect('/star/getApproved/:token');
    else 
        return starTokenId(response, token);
});

/**
 *  /star/:tokenIdToStarInfo
 * @param {*} response 
 * @param {*} token 
 */
var starTokenId = async (response, token) => {
    try {
        let starInfo = await ethereumHelper.tokenIdToStarInfo(token);
        if (starInfo[0] == '')
            return response.status(404).send(starInfo);
        else
            return response.status(200).send(starInfo);
    } catch (error) {
        return response.status(500).send(error.message);
    }
};

/**
 *  /star/isApprovedForAll?owner=owner_address&operator=operator_address;
 * @param {*} request 
 * @param {*} response 
 */
var isApprovedForAll = async(request, response) => {
    try{
        let owner = request.query.owner;
        let operator = request.query.operator;
        let result = await ethereumHelper.isApprovedForAll(owner, operator);
        return response.status(200).send(result);
    }
    catch (error){
        return response.status(400).send('Error : could not get isApprovedForAll due to invalid parameters');
    }
};

app.get('/star/ownerof/:token', async(request, response) => {
    let token = Number(request.params.token);
    try {
        let address = await ethereumHelper.ownerOf(token);
        if(address == '0x0000000000000000000000000000000000000000')
            return response.status(404).send(address);
        else     
            return response.status(200).send(address);
    } catch(error){
        return response.status(500).send(error.message);
    }
});

app.patch('/star/setApprovalForAll', async(request, response) => {
    try{
        let tx = await ethereumHelper.setApprovalForAll(request.body.to, request.body.approved, request.body.owner);
        return response.status(200).send(tx);
    }
    catch (error){
        return response.status(400).send('Error : could not setApprovalForAll due to invalid parameters');
    }
});


app.patch('/star/putStarUpForSale', async(request, response) => {
    let token = request.body.token;
    let price = request.body.price;
    let owner = request.body.owner;
    try{
        let tx = await ethereumHelper.putStarUpForSale(token, price, owner);
        return response.status(200).send(tx);
    }
    catch (err){
        return response.status(403).send('Only the owner can put a star up for sale');
    }
});

app.get('/star/starsForSale/:token', async(request, response) => {
    let token = request.params.token;
    try{
        let price = await ethereumHelper.starsForSale(token);
        return response.status(200).send('' + price);
    }
    catch(err){
        return response.status(500).send(`Unable to get star price for ${token}`);
    }
});

var checkIfStarExist = async(request, response) => {
    let cent = request.query.cent;
    let dec = request.query.dec;
    let mag = request.query.mag;
    try {
        let starExistence = await ethereumHelper.checkIfStarExist(cent, dec, mag);
        return response.status(200).send(starExistence);
    }
    catch(err){
        return response.status(500).send('Unable to check if star exist due to ' + err.message);
    }
};

app.get('/star/getApproved/:token', async(request, response) => {
    let token = request.params.token;
    try{
        let result = await ethereumHelper.getApproved(token);
        return response.status(200).send(result);
    }
    catch(err){
        return response.status(500).send(`Cannot getApproved for ${token}`);
    }
});

app.patch('/star/approve', async(request, response) => {
    let to = request.body.to;
    let token = request.body.token;
    let owner = request.body.owner;
    try {
        let tx = await ethereumHelper.approve(to, token, owner);
        return response.status(200).send(tx);
    } catch(err){
        return response.status(403).send('Only token owners can set approved');
    }
});

app.post('/star', async(request, response) => {
    try{
        let tx = await ethereumHelper.createStar(request.body.name, request.body.story, request.body.cent, request.body.dec, request.body.mag, request.body.token, request.body.owner);
        console.log(`Created Star with token ${request.body.token}`);
        return response.status(200).send(tx);
    } catch (err){
        return response.status(400).send('Unable to create star : possible duplicate token, coordonates. Reason:' + err.message);
    }
});

app.patch('/star/buyStar', async(request, response) => {
    try{
        let tx = await ethereumHelper.buyStar(request.body.token, request.body.buyer, request.body.value);
        return response.status(200).send(tx);
    } catch (err){
        return response.status(400).send('Unable to buy star. Reason:' + err.message);
    }
});

app.patch('/star/safeTransferFrom', async(request, response) => {
    try {
        let tx = await ethereumHelper.safeTransferFrom(request.body.from, request.body.to, request.body.token, request.body.owner);
        return response.status(200).send(tx);
    } catch(err){
        return response.status(400).send('Unable to transfer token. Reason:' +  err.message);
    }

});

app.post('/star/mint', async(request, response) => {
    try{
        let tx = await ethereumHelper.mint(request.body.token, request.body.owner);
        return response.status(200).send(tx);
    } catch(err){
        return response.status(400).send('Unable to mint token. Reason:' + err.message);
    }
});
var server = app.listen(port, async () => {
	await ethereumHelper.initialize();
	console.log(`Express Server started listening on port ${port}`);
});

module.exports = {
	app,
    server,
    ethereumHelper
};