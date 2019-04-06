# Project 5: Decentralized Star Notary - Optional part of project
Fifth project for Blockchain NanoDegree that requires to build a star notary service that allows users to prove they own an authenticated star! This optional part involves creating and deploying REST API on a nodejs + expressJS backend to communicate with the deployed Smart Contract via web3. 

## Getting Started

Important note! The "optional part" only required to have a single rest endpoint (tokenIdToStarInfo -> /star/{starTokenId}) to communicate with our SC but I have created endpoints for ALL methods. 
They ALL work on the local ganache-cli environement but only GET endpoints work on the rinkeby deployed smart contract. (I have also attached PostMan Project with rest calls)
The ones what work on the rinkeby network are :
- GET /star/{tokenId}
- GET /star/ownerof/{tokenId}
- GET /star/isApprovedForAll?owner=owner_address&operator=operator_address
- GET /star/starsForSale/{tokenID}
- GET /star/checkIfStarExist/?cent=1&dec=2&mag=3
- GET /star/getApproved/{tokenID}
These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. 

### Prerequisites

* [NodeJS](https://nodejs.org/en/download/current/) (The install will also include the npm node package manager)
* [ganache-cli](https://github.com/trufflesuite/ganache-cli) Fast Ethereum RPC client for testing and development
* [truffle](https://www.npmjs.com/package/truffle) Development environment, testing framework and asset pipeline for Ethereum
* [openzeppelin-solidity](https://github.com/OpenZeppelin/openzeppelin-solidity) OpenZeppelin is a library for secure smart contract development
* [web3](https://github.com/ethereum/web3.js/) Ethereum compatible JavaScript API which implements the Generic JSON RPC spec.
```
node -v
npm -v
npm i ganache-cli -g
npm i truffle -g
```

### Installing

1. Save the project (P5_StefanelStan) and unzip it (new folder should be created P5)
2. Navigate into the project
```
cd P5
npm install
```
## Running the tests

This project has included two series of tests: One suite for the Smart Contract and one suite for the nodeJS server(the optional bit for the project)
(there might be the possibility for some of them to fail due to 3000ms response time. If any fails, run the command again)

In order to test the smart contract locally please:
```
ganache-cli -m "boy swarm endorse circle beyond lecture visa season acquire anxiety elbow prize"
truffle.cmd test
```

In order to run the tests for the nodejs backend, please start the ganache-cli with the exact command (these 12 words -phrase should also generate a series of public keys used in test) and deploy the smart contracts using truffle. 
After running the first command (ganache-cli) please check 
- if the first 3 public address created by ganache are NOT '0x4fda5baf52b8ff93399673f3f89a93ef31066ad8' / '0x15e542f44d1f0811ec4453fa5493eff1859f89b6' /'0x3962def6c998ec7a5e81460bfba65b1982282f3c', please copy the first 3 ones into server/middleware/EthereumHelper.test.js line 8,9,10.
- if the ganache locally deployed address of smart contract is NOT 0x81176dd9c8fb7779ff0c3050a2a301882bf49a34, then please replace the new address inside server/middleware/address_dev.json
```
ganache-cli -m "boy swarm endorse circle beyond lecture visa season acquire anxiety elbow prize"
truffle.cmd deploy --network development
npm test
```

## Deployment (local ganache) 
Pleased read the testing section fully as deploying the SC locally might cause the same address/deployment address issue and the above explanation tells how to adjust them
The critical node_modules are not included to they will need to be installed first (npm might generate random error while installing them. Just try again in case this happens)

1. `cd P4` will move into project folder (if not already there)
2. `npm install` will install all the dependencies (only if this was not previously done during testing phase)
3.  `ganache-cli -m "boy swarm endorse circle beyond lecture visa season acquire anxiety elbow prize"` will start the local ethereum node
4. `truffle.cmd deploy --network development` will deploy the smart contract on the local node. (Please chech the Running the tests section to fix the wallet addresses/contract address if needed)
3. `npm run startdev` will start the server/application that will talk with the local ganache server via web3 and Postman can be used to test the end points

## Deployment (nodejs - web3 - rinkeby)
This is done simply by running the command
1. `npm run startlive`.  Postman can be used to test the end points (note: only GE endpoints work with postman on rinkeby)

## Endpoints (only GET endpoints work on live rinkeby but all of them work on local ganache)

### GET endpoints (1-6)

#### 1. Endpoint Get Star
```
http://localhost:8000/star/1
```
###### Returns
1. `500` if runtime contract error or any major server error
2. `404` if star token doesn't exist and empty values in response
3. `200` and star metadata if token exists
```
[
    "StefanStar",
    "StefanStarStory",
    "ra_1",
    "dec_2",
    "mag_3"
]
```

#### 2. Endpoint Get Owner of star token
```
http://localhost:8000/star/ownerof/1
```
###### Returns
1. `500` if runtime contract error or any major server error
2. `404` and 0x00000 if star token doesn't exist
3. `200` and owner address
```
	0x4fda5baf52b8ff93399673f3f89a93ef31066ad8
```

#### 3. Endpoint Is given address an operator approved for all
```
http://localhost:8000/star/isApprovedForAll?owner={owner_address}&operator={operator_address}
http://localhost:8000/star/isApprovedForAll?owner=0x4fda5baf52b8ff93399673f3f89a93ef31066ad8&operator=0x15e542f44d1f0811ec4453fa5493eff1859f89b6
```
###### Query parameters
```
owner, operator
```
###### Returns
1. `400` if runtime contract error or invalid parameters (invalid/incorrect addresses)
2. `200` and true/false is given operator isApprovedForAll for the given owner
```
	false | true
```

#### 4. Endpoint Get the price of a star for sale
```
http://localhost:8000/star/starsForSale/{starTokenId}
```
###### Returns
1. `500` if contract runtime error
2. `200` and the star price (if it's for sale) or 0 if it's not for sale/doesn't exist
```
	0 | n
```

#### 5. Endpoint Check if star exists by coordinates
```
http://localhost:8000/star/checkIfStarExist/?cent={number_1}&dec={number_2}&mag={number_3}
http://localhost:8000/star/checkIfStarExist/?cent=1&dec=2&mag=3
```
###### Returns
1. `500` in case of major server error
2. `200` and true/false if star exists by the given coordinates 
```
	true | false
```

#### 6. Endpoint Get Approved user/address for a given token
```
http://localhost:8000/star/getApproved/{starToken}
```
###### Returns
1. `500` in case of major server error
2. `200` and the found approved address (if no address exists, 0x000 is returned)
```
	0x0000000000000000000000000000000000000000 | approved_address
```
### POST endpoints (7)
#### 7. Endpoint Post a star/ Claim a star
```
http://localhost:8000/star
```
###### Parameters
```
{
	"name": "PostmanStar1",
	"story": "PostmanStar1Story",
	"cent": "1.1",
	"dec": "2.2",
	"mag": "3.3",
	"token": "1",
	"owner": "0x4fda5baf52b8ff93399673f3f89a93ef31066ad8"
}
```
###### Returns
1. `400` in case of duplicate star token/coords or any other runtime contract execution
2. `200` and the transaction number
```
	0x07a1a8b8405e59371e94ee2323871f3428368d746a2a58e4b881632d21fd20b4
```


### PATCH endpoints (8-12)
#### 8. Endpoint Set address to be operator approved for all tokens of user/owner
```
http://localhost:8000/star/setApprovalForAll
```
###### Parameters
```
{
	"to": "0x15e542f44d1f0811ec4453fa5493eff1859f89b6",
	"approved": true,
	"owner": "0x4fda5baf52b8ff93399673f3f89a93ef31066ad8"
}
```
###### Returns
1. `400` in case of invalid parameters (not existent owner/operator)
2. `200` and the transaction number
```
	0x07a1a8b8405e59371e94ee2323871f3428368d746a2a58e4b881632d21fd20b4
```


#### 9. Endpoint Put a star for sale
```
http://localhost:8000/star/putStarUpForSale
```
###### Parameters
```
{
	"token" : 1,
	"price": 100,
	"owner" : "0x4fda5baf52b8ff93399673f3f89a93ef31066ad8"
}
```
###### Returns
1. `403` in case the owner address doesn't own that token
2. `200` and the transaction number
```
	0x07a1a8b8405e59371e94ee2323871f3428368d746a2a58e4b881632d21fd20b4
```


#### 10. Endpoint Set the address to be approved for a given token
```
http://localhost:8000/star/approve
```
###### Parameters
```
{
	"to" : "0x15e542f44d1f0811ec4453fa5493eff1859f89b6",
	"token" : 1,
	"owner" : "0x4fda5baf52b8ff93399673f3f89a93ef31066ad8"
}
```
###### Returns
1. `403` in case the owner address doesn't own that token
2. `200` and the transaction number
```
	0x07a1a8b8405e59371e94ee2323871f3428368d746a2a58e4b881632d21fd20b4
```


#### 11. Endpoint Buy a star
```
http://localhost:8000/star/buyStar
```
###### Parameters
```
{
	"token": "1",
	"buyer": "0x15e542f44d1f0811ec4453fa5493eff1859f89b6",
	"value": "150"
}
```
###### Returns
1. `400` and message if unable to buy star (eg: token inexistent, value to low)
2. `200` and the transaction number
```
	0x07a1a8b8405e59371e94ee2323871f3428368d746a2a58e4b881632d21fd20b4
```

#### 12. Endpoint Safe Transfer a token to another owner/address
```
http://localhost:8000/star/safeTransferFrom
```
###### Parameters
```
{
	"from": "0x15e542f44d1f0811ec4453fa5493eff1859f89b6",
	"to": "0x4fda5baf52b8ff93399673f3f89a93ef31066ad8",
	"token": 1,
	"owner": "0x15e542f44d1f0811ec4453fa5493eff1859f89b6"
}
```
###### Returns
1. `400` and message if unable to trnasfter token (eg: owner doesn't own/not operator of the token, "from" doesn't own the token)
2. `200` and the transaction number
```
	0x07a1a8b8405e59371e94ee2323871f3428368d746a2a58e4b881632d21fd20b4
```


## Architecture
Local server
- Node.js (v10+)
- Express.js
- ganache-cli
- truffle

Testing done with `chai, mocha, sinon, supertest, truffle and lite-server"`.

## Built With

* [Visual Studio Code](https://code.visualstudio.com/) - Web editor
* [Postman](https://www.getpostman.com/) - Web API testing

## Authors

* **Stefanel Stan** - *Initial work* - [Stefanel Stan Github](https://github.com/StefanelStan)

## License

This project is licensed under the MIT License 
