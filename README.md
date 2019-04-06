# Project 5: Decentralized Star Notary - Mandatory part of project
Fifth project for Blockchain NanoDegree that requires to build a star notary service that allows users to prove they own an authenticated star, asking to deploy a smart contract on rinkeby and providing a basic index.html with few forms to claim a star

## Getting Started
These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. 

### Prerequisites

* [NodeJS](https://nodejs.org/en/download/current/) (The install will also include the npm node package manager)
* [ganache-cli](https://github.com/trufflesuite/ganache-cli) Fast Ethereum RPC client for testing and development
* [truffle](https://www.npmjs.com/package/truffle) Development environment, testing framework and asset pipeline for Ethereum
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
Please consult the README_optional.md for a detailed explanation how to run the truffle tests.

## Deployment

The critical node_modules are not included to they will need to be installed first (npm might generate random error while installing them. Just try again in case this happens)

1. `cd P4` will move into project folder (if not already there)
2. `npm install` will install all the dependencies
3. `npm run dev` will start a basic httlp lite -server that will deploy and open index.html. Please log in with a valid metamask account on rinkeby

## GUI Explanation

#### Claim a star (the default star token 1 has been taken by the project owner and price set 150)

Fill out the 5 fields with data : StarName, StarStory (text) and cent, dec, mag (declination, magnitude) and token (please use numbers for these last 4 fields).
Upon pressing `Claim Star` metamask window will pop out, asking for trnansaction permission. If given, the contract's method will be called and a message of success/unsucccess will be given

#### GetStarInfo
Returns the description of a star's token. If token exists, the star's description will populate the 5 labels, if not, the are blanked.

### Put For Sale
Puts a star for sale. introduce the star token id and the desired price (all in numbers please). Upon pressing `Put for Sale` metamask will pop out, asking for confirmation of transaction. If the caller owns the star, a success window will be shows and transaction id, if not, an error message will be shown.

### Star for sale
Returns the price of a star/token. If star is for sale, it will return its price, if the star doesn't exist/is not for sale, 0 will be shown. Token star 1 has a price of 150.

## Architecture
Local server
- Node.js (v10+)
- lite-server

Testing done with `chai, mocha, sinon, supertest, truffle, lite-server and postman`, 

## Built With

* [Visual Studio Code](https://code.visualstudio.com/) - Web editor
* [Postman](https://www.getpostman.com/) - Web API testing

## Authors

* **Stefanel Stan** - *Initial work* - [Stefanel Stan Github](https://github.com/StefanelStan)

## License

This project is licensed under the MIT License 
