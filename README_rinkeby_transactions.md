# Project 5: Decentralized Star Notary - Mandatory part of project
Fifth project for Blockchain NanoDegree that requires to build a star notary service that allows users to prove they own an authenticated star, asking to deploy a smart contract on rinkeby and providing a basic index.html with few forms to claim a star

## Generic Information
Please also read the other 2 .md files as they contain instructions for the "mandatory" part of the project and also instructions for the "optional" part using nodejs/REST API

## Rinkeby deployment log
```
C:\Users\Stefannel\nodejsCourses\P5>truffle.cmd deploy --network rinkeby
		Using network 'rinkeby'.

		Running migration: 1_initial_migration.js
		  Deploying Migrations...
		  ... 0x21ff62ca26816c5983b9ce5a5e097a65b0c7eabccd014698551723226d26ef34
		  Migrations: 0xcc3b5cfffae19d5b7ec7639226a42f9193126557
		Saving successful migration to network...
		  ... 0xcc4c75cdc841fbe7422f070d3f15773552aefd1546d66b915e5b3fb49a206d67
		Saving artifacts...
		Running migration: 2_deploy_star_notary.js
		  Deploying StarNotary...
		  ... 0xafeef80a8dc1a4e27d5c06a85af9370f5d0c38dd1d048047cbc6f8a1c2106dc2
		  StarNotary: 0xfa096ec1127e1d195c3ae27e3a76b64117548a38
		Saving successful migration to network...
		  ... 0x543f00f90023f4e2b0f43d817c51da1dbc6fdcaf22760582c2cd2fbeea380038
		Saving artifacts...
```
## Rinkeby contract address
`0xfa096ec1127e1d195c3ae27e3a76b64117548a38`
## Rinkeby contract deployment transaction		
` https://rinkeby.etherscan.io/tx/0xafeef80a8dc1a4e27d5c06a85af9370f5d0c38dd1d048047cbc6f8a1c2106dc2`
## Rinkeby claim star transaction (star token 1)
`https://rinkeby.etherscan.io/tx/0x2d07b3adcda8b5fdd4f3b77669047e77ffce4f6309131352bf7665ee402b5ff2`
## Rinkeby put star up for sale transaction
`https://rinkeby.etherscan.io/tx/0x476bef945afec5e0d74417db124f39bf22827307516c6e4f080395d45fdd85c1`