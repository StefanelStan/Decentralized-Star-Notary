pragma solidity ^0.4.23;

import 'openzeppelin-solidity/contracts/token/ERC721/ERC721.sol';

contract StarNotary is ERC721 { 

    struct Star { 
        string name; 
        string story;
        string cent;
        string dec;
        string mag;
    }

    mapping(uint256 => Star) private _tokenIdToStarInfo; 
    mapping(uint256 => uint256) private starsToPrice;
    mapping(uint256 => bool) starFingerprints;

    function createStar(string _name, string _story, string _cent, string _dec, string _mag, uint256 _tokenId) public { 
        
        uint256 starFingerprint = getStarFingerprint(_cent, _dec, _mag);
        require(starFingerprints[starFingerprint] == false, "Star already exists!");
        _mint(msg.sender, _tokenId);
        
        Star memory newStar = Star(_name, _story, 
                                   string(concatenate("ra_", _cent)), 
                                   string(concatenate("dec_", _dec)),
                                   string(concatenate("mag_", _mag)));

        _tokenIdToStarInfo[_tokenId] = newStar;
            
        starFingerprints[starFingerprint] = true;

    }

    //Would be more efficient to calculate fingerprint and pass it here but proj requires to pass the coords
    function checkIfStarExist(string _cent, string _dec, string _mag) view public returns(bool){
        uint256 starFingerprint = getStarFingerprint(_cent, _dec, _mag);
        return starFingerprints[starFingerprint];
    }

    

    function getStarFingerprint(string _cent, string _dec, string _mag) pure private returns(uint256){
        bytes memory encodedCent = concatenate("ra_", _cent);
        bytes memory encodedDec = concatenate("dec_", _dec);
        bytes memory encodedMag = concatenate("mag_", _mag); 
        uint256 starFingerprint = uint256(keccak256(abi.encodePacked(encodedCent, encodedDec, encodedMag)));
        return starFingerprint;
    }
   
    function concatenate(string prefix, string suffix) pure private returns(bytes){
        return abi.encodePacked(prefix, suffix);
    }

    function putStarUpForSale(uint256 _tokenId, uint256 _price) public { 
        require(this.ownerOf(_tokenId) == msg.sender);
        starsToPrice[_tokenId] = _price;
    }

    function buyStar(uint256 _tokenId) public payable { 
        require(starsToPrice[_tokenId] > 0);
        
        uint256 starCost = starsToPrice[_tokenId];
        address starOwner = this.ownerOf(_tokenId);
        require(msg.value >= starCost);

        _removeTokenFrom(starOwner, _tokenId);
        _addTokenTo(msg.sender, _tokenId);
        
        starOwner.transfer(starCost);

        if (msg.value > starCost) { 
            msg.sender.transfer(msg.value - starCost);
        }

        starsToPrice[_tokenId] = 0;
    }

    
    function mint(uint256 _tokenId) public {
        _mint(msg.sender, _tokenId);
    }

    function ownerOf(uint256 _tokenId) public view returns (address) {
        return ERC721.ownerOf(_tokenId); 
    }

    function approve(address _to, uint256 _tokenId) public {
        ERC721.approve(_to, _tokenId);
    }

    function getApproved(uint256 _tokenId) public view returns (address) {
        return ERC721.getApproved(_tokenId);
    }

    function safeTransferFrom(address from, address _to, uint256 _tokenId) public {
        ERC721.safeTransferFrom(from, _to, _tokenId);
    }

    function SetApprovalForAll(address to, bool approved) public {
        ERC721.setApprovalForAll(to, approved);
    }

    function isApprovedForAll(address owner, address operator)  public view returns (bool){
        return ERC721.isApprovedForAll(owner, operator);
    }

    function starsForSale(uint _token) public view returns(uint256) {
        return starsToPrice[_token];
    }

    function tokenIdToStarInfo(uint _token) public view returns(string, string, string, string, string){
        Star memory star = _tokenIdToStarInfo[_token];
        return (star.name, star.story, star.cent, star.dec, star.mag);
    }
}