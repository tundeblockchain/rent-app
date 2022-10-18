// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract RentMarket is ReentrancyGuard{
    using Counters for Counters.Counter;
    address payable public owner;
    Counters.Counter private _propertyIDs;
    Counters.Counter private _userIDs;
    Counters.Counter private _bookingIDs;
    uint256 listingPrice = 0.02 ether;

    modifier onlyOwner(){
        require(msg.sender == owner, "untrusted message sender");
        _;
    }

    struct PropertyItem {
        uint256 propertyID;
        string name;
        string location;
        string country;
        string image;
        address payable owner;
        uint256 price;
        BookingItem[] bookings;
        
    }

    struct BookingItem {
        uint256 bookingID;
        uint256 startDate;
        uint256 endDate;
        address payable guest;
        address payable owner;
        uint256 propertyID;
    }

    mapping(uint256 => PropertyItem) private _propertyItems;
    mapping(uint256 => BookingItem) private _bookingItems;
    event PropertyItemCreated (
        uint indexed itemID,
        string name,
        string location,
        string country,
        string image,
        address owner,
        uint256 price
    );

    struct User {
        uint256 userID;
        address payable userAddress;
        uint[] properties;
        uint[] bookings;
    }

    mapping(address => User) private _users;

    constructor(){
        owner = payable(msg.sender);
    }

    function getListingPrice() public view returns (uint256){
        return listingPrice;
    }

    // Lists a new item on the Rent Marketplace
    function createProperty(string memory name, string memory location, string memory country, string memory image, uint256 price) public payable nonReentrant{
        require(price > 0, "Price cannot be set to free");
        require(msg.value == listingPrice, "Price must be equal to listing price");

        _propertyIDs.increment();
        uint256 propertyID = _propertyIDs.current();
        PropertyItem storage propertyItem = _propertyItems[propertyID];
        propertyItem.propertyID = propertyID;
        propertyItem.name = name;
        propertyItem.location = location;
        propertyItem.country = country;
        propertyItem.image = image;
        propertyItem.owner = payable(msg.sender);
        propertyItem.price = price;
        
        // Add new user
        if (_users[msg.sender].userID == 0){
            _userIDs.increment();
            uint256 userID = _userIDs.current();
            User storage user = _users[msg.sender];
            user.userID = userID;
            user.userAddress = payable(msg.sender);
            user.properties.push(propertyID);          
        }else{
            User storage user = _users[msg.sender];
            user.properties.push(propertyID);     
        }

        emit PropertyItemCreated(propertyID, name, location, country, image, payable(msg.sender), price);
    }

    function updateProperty(uint propertyID, string memory name, string memory location, string memory country, string memory image, uint256 price) public{
        require(price > 0, "Price cannot be set to free");
        require( _propertyItems[propertyID].propertyID > 0, "Property not found");
        require( _propertyItems[propertyID].owner == msg.sender, "You do not own the property");

        PropertyItem storage property = _propertyItems[propertyID];
        property.name = name;
        property.location = location;
        property.country = country;
        property.image = image;
        property.price = price;
    }

    function removeProperty(uint propertyID) public{
        require( _propertyItems[propertyID].propertyID > 0, "Property not found");
        require( _propertyItems[propertyID].owner == msg.sender, "You do not own the property");
        User storage user = _users[msg.sender];
        uint index = 0;
        for (uint i = 0; i < user.properties.length; i++){
            if (user.properties[i] == propertyID){
                index = i;
                break;
            }
        }
        user.properties[index] =  user.properties[user.properties.length - 1];
        user.properties.pop();

        delete _propertyItems[propertyID];
    }

    function bookProperty(uint propertyID, uint startDate, uint endDate) public payable nonReentrant{
        require(_propertyItems[propertyID].propertyID > 0, "Property does not exist");
        PropertyItem storage property = _propertyItems[propertyID];
        require(msg.value == property.price, "Price must be equal to rent price");
        // Check if booking date is already reserved
        for (uint i = 1; i <= property.bookings.length; i++){
            BookingItem memory bookingItem = property.bookings[i];
            uint existingBookingStartDate = bookingItem.startDate;
            uint existingBookingEndDate = bookingItem.endDate;
            bool bookingExists = (startDate >= existingBookingStartDate && startDate <= existingBookingEndDate) || 
                            (endDate >= existingBookingStartDate && endDate <= existingBookingEndDate);
            require(bookingExists == false, "Booking has been taken, please choose another date");
        }

        // Reserve the booking
        _bookingIDs.increment();
        uint256 bookingID = _bookingIDs.current();
        BookingItem memory newBookingItem = BookingItem(bookingID, startDate, endDate, payable(msg.sender), property.owner, property.propertyID);
        property.bookings.push(newBookingItem);
        _bookingItems[bookingID] = newBookingItem;
        if (_users[msg.sender].userID == 0){
            _userIDs.increment();
            uint256 userID = _userIDs.current();
            User storage user = _users[msg.sender];
            user.userID = userID;
            user.userAddress = payable(msg.sender);
            user.bookings.push(bookingID);          
        }else{
            User storage user = _users[msg.sender];
            user.bookings.push(bookingID);     
        }

        property.owner.transfer(msg.value);
    }

    // Fetches all properties from a particular host
    function fetchPropertiesFromHost() public view returns (PropertyItem[] memory){
        if (_users[msg.sender].userID == 0){
            PropertyItem[] memory properties = new PropertyItem[](0);
            return properties;
        }else{
            // Use property IDs from host to return list of property data
            uint256[] memory propertyIDs = _users[msg.sender].properties;
            PropertyItem[] memory properties = new PropertyItem[](propertyIDs.length);
            if (propertyIDs.length > 0){
                for (uint i = 0; i < propertyIDs.length; i++){
                    properties[i] = _propertyItems[propertyIDs[i]];
                }
            }
            return properties;
        }
    }

    // Fetches all bookings from a particular host
    function fetchBookingsFromUser() public view returns (PropertyItem[] memory){
        if (_users[msg.sender].userID == 0){
            PropertyItem[] memory properties = new PropertyItem[](0);
            return properties;
        }else{
            // Use property IDs from host to return list of property data
            uint256[] memory bookingsIDs = _users[msg.sender].bookings;
            PropertyItem[] memory properties = new PropertyItem[](bookingsIDs.length);
            uint propertyIndex = 0;
            if (bookingsIDs.length > 0){
                for (uint i = 0; i < bookingsIDs.length; i++){
                    BookingItem memory bookingItem = _bookingItems[bookingsIDs[i]];
                    PropertyItem memory item = _propertyItems[bookingItem.propertyID];
                    if (item.propertyID > 0){
                        properties[propertyIndex] = _propertyItems[bookingItem.propertyID];
                        propertyIndex++;
                    }
                }
            }
            return properties;
        }
    }

    function fetchUserProperties() public view returns (uint[] memory){
        require(_users[msg.sender].userID > 0, "User does not have an account");
        return _users[msg.sender].properties;
    }

    function fetchPropertiesOnMarket() public view returns (PropertyItem[] memory){
        uint totalItems = _propertyIDs.current();

        PropertyItem[] memory items = new PropertyItem[](totalItems);
        uint index = 0;
        for (uint i = 1; i <= totalItems; i++){
            uint currentItemID = _propertyItems[i].propertyID;
            if (currentItemID > 0){
                PropertyItem storage currentItem = _propertyItems[currentItemID];
                items[index] = currentItem;
                index++;
            }
        }

        return items;
    }

    function fetchProperty(uint propertyID) public view returns (PropertyItem memory){
        require( _propertyItems[propertyID].propertyID > 0, "Property not found");
        PropertyItem memory property = _propertyItems[propertyID];
        return property;
    }

    function fetchBooking(uint bookingID) public view returns (BookingItem memory){
        require( _bookingItems[bookingID].bookingID > 0, "Booking not found");
        BookingItem memory booking = _bookingItems[bookingID];
        return booking;
    }
}