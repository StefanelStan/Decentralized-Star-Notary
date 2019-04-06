const fs = require('fs')
const Web3 = require('web3');
const contractABI = require(__dirname + '/abi.json');
const address_live = require(__dirname + '/address_live.json');
const address_dev = require(__dirname + '/address_dev.json');
//web3js = new web3(new web3.providers.HttpProvider("https://rinkeby.infura.io/YOUR_API_KEY"));

var web3;
var instance;
var contractAddress
class EthereumHelper{

    constructor(){}

    async initialize(){
        if (process.env.NODE_ENV == 'test') {
            web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
            contractAddress = address_dev;
        }
        else {
           web3 = new Web3(new Web3.providers.HttpProvider("https://rinkeby.infura.io/v3/2386dbf442cb4ed7a9e071df64c449ac"));
           contractAddress = address_live;
       }
        var contract = web3.eth.contract(contractABI);
        instance = contract.at(contractAddress);
    }

    async tokenIdToStarInfo(token) {
        return new Promise((resolve, reject) => {
            instance.tokenIdToStarInfo(token, (error, result) => {
                if (!error)
                    resolve(result);
                else
                    reject(error);
            });
        });
    }

    async ownerOf(token) {
        return new Promise((resolve, reject) => {
            instance.ownerOf(token, (error, result) => {
                if (!error){
                    resolve(result.toLowerCase());
                }
                else
                    resolve('0x0000000000000000000000000000000000000000');
            });
        });
    }

    async setApprovalForAll(to, approved, owner) {
        return new Promise((resolve, reject) => {
            instance.SetApprovalForAll(to, approved, {from: owner}, (error, result) => {
                if (!error){
                    resolve(result);
                }
                else
                    reject(error);
            });
        });
    }

    async isApprovedForAll(owner, operator) {
        return new Promise((resolve, reject) => {
            instance.isApprovedForAll(owner, operator, (error, result) => {
                if (!error){
                    resolve(result);
                }
                else
                    reject(error);
            });
        });
    }

    async putStarUpForSale(token, price, owner) {
        return new Promise((resolve, reject) => {
            instance.putStarUpForSale(token, price, {from: owner}, (error, result) => {
                if (!error){
                    resolve(result);
                }
                else
                    reject(error);
            });
        });
    }

    async starsForSale(token) {
        return new Promise((resolve, reject) => {
            instance.starsForSale(token, (error, result) =>{
                if(!error)
                    resolve(result);
                else
                    reject(error);
            });
        });
    }

    async checkIfStarExist(cent, dec, mag){
        return new Promise((resolve, reject) => {
            instance.checkIfStarExist(cent, dec, mag, (error, result) => {
                if(!error)
                    resolve(result);
                else
                    reject(error);    
            });
        });
    }

    async approve(to, token, owner) {
        return new Promise((resolve, reject) => {
            instance.approve(to, token, {from: owner}, (error, result) => {
                if(!error)
                    resolve(result);
                else 
                    reject(error);    
            });
        });
    };

    async getApproved(token) {
        return new Promise((resolve, reject) => {
            instance.getApproved(token, (error, result) => {
                if(!error)
                    resolve(result);
                else 
                    reject(error);    
            });
        });
    };

    async createStar(name, story, cent, dec, mag, token, owner) {
        return new Promise((resolve, reject) => {
            instance.createStar(name, story, cent.toString(), dec.toString(), mag.toString(), token.toString(), {from: owner, gas: 250000}, (error, result) => {
                if(!error)
                    resolve(result);
                else    
                    reject(error);    
            });
        });
    };

    async buyStar(token, buyer, value) {
        return new Promise((resolve, reject) => {
            instance.buyStar(token, {from: buyer, gas:100000, value}, (error, result) => {
                if(!error)
                    resolve(result);
                else    
                    reject(error);    
            });
        });
    };

    async safeTransferFrom(from, to, token, caller) {
        return new Promise((resolve, reject) => {
            instance.safeTransferFrom(from, to, token, {from: caller}, (error, result) => {
                if(!error)
                    resolve(result);
                else    
                    reject(error);    
            });
        });
    };

    async mint(token, owner) {
        return new Promise((resolve, reject) => {
            instance.mint(token, {from: owner}, (error, result) => {
                if(!error)
                    resolve(result);
                else    
                    reject(error);    
            });
        });
    };
}

module.exports = {
    EthereumHelper
}