//smart contract where users can list their nfts

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

//Basically agreed upon standard defining what functions nft contracts should have
//at the bare minimum
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

// protects from re-entrance attacks
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

import "hardhat/console.sol";

contract Marketplace is ReentrancyGuard {

    // the account that receives fees
    address payable public immutable feeAccount;

    // the fee percentage on sales
    uint public immutable feePercent;
    uint public itemCount; 

    //each marketplace item
    struct Item {
        // nft id
        uint itemId;

        // actual nft
        IERC721 nft;

        // nft contract id
        uint tokenId;

        // nft price
        uint price;

        //seller's address
        address payable seller;
        bool sold;
    }

    // itemId -> Item
    // key value store. id is key, struct is return value
    mapping(uint => Item) public items;

    // event allows us to send data to blockchain.
    // Can be used as cheap form of storage, or defining user events
    event Offered(
        uint itemId,
        address indexed nft,
        uint tokenId,
        uint price,

        // this allows us to search for it
        address indexed seller
    );
    event Bought(
        uint itemId,
        address indexed nft,
        uint tokenId,
        uint price,
        address indexed seller,
        address indexed buyer
    );

    // only deployer can call consturction function
    constructor(uint _feePercent) {
        feeAccount = payable(msg.sender);
        feePercent = _feePercent;
    }

    // Make item to offer on the marketplace
    // instance of the IERC721 standard
    function makeItem(IERC721 _nft, uint _tokenId, uint _price) external nonReentrant {

        //make sure input price isn't zero
        //TODO: we may need to change this if an artist is offering an nft for free, like the early release tix
        require(_price > 0, "Price must be greater than zero");

        // increment itemCount
        itemCount ++;

        // transfer nft
        _nft.transferFrom(msg.sender, address(this), _tokenId);

        // add new item to items mapping
        // you can initialize struct by passing it in as a function.
        items[itemCount] = Item (
            itemCount,
            _nft,
            _tokenId,
            _price,
            payable(msg.sender),
            false
        );

        // emit Offered event
        emit Offered(
            itemCount,
            address(_nft),
            _tokenId,
            _price,
            msg.sender
        );


    }

    function purchaseItem(uint _itemId) external payable nonReentrant {
        uint _totalPrice = getTotalPrice(_itemId);
        Item storage item = items[_itemId];
        require(_itemId > 0 && _itemId <= itemCount, "item doesn't exist");
        require(msg.value >= _totalPrice, "not enough ether to cover item price and market fee");
        require(!item.sold, "item already sold");
        // pay seller and feeAccount
        item.seller.transfer(item.price);

        //TODO: figure out how this works
        feeAccount.transfer(_totalPrice - item.price);
        // update item to sold
        item.sold = true;
        // transfer nft to buyer
        item.nft.transferFrom(address(this), msg.sender, item.tokenId);
        // emit Bought event
        emit Bought(
            _itemId,
            address(item.nft),
            item.tokenId,
            item.price,
            item.seller,
            msg.sender
        );
    }

    // it has to include the market fees
    function getTotalPrice(uint _itemId) view public returns(uint){
        return((items[_itemId].price*(100 + feePercent))/100);
    }
}
