const RentMarket = artifacts.require("./RentMarket.sol");

contract("RentMarket", accounts => {
    it("Create property as host", async () => {
      const rentMarket = await RentMarket.deployed();

      // Create Properties
      let listingPrice = await rentMarket.getListingPrice();
      const setTargetReceipt = await rentMarket.createProperty("Test One", "London", "UK", "www.google.com", 2, {value: listingPrice});
      
      // Retrieve property
      let propertiesOnMarket = await rentMarket.fetchPropertiesFromHost();
      expect(propertiesOnMarket.length).to.be.greaterThan(0);
    });

    it("Retrieve All Properties", async () => {
        const rentMarket = await RentMarket.deployed();

        // Create 
        let listingPrice = await rentMarket.getListingPrice();
        const setTargetReceipt = await rentMarket.createProperty("Test One", "London", "UK", "www.google.com", 2, {value: listingPrice});
        
        // Get stored value
        let propertiesOnMarket = await rentMarket.fetchPropertiesOnMarket();
        expect(propertiesOnMarket.length).to.be.greaterThan(0);
    });

    it("Update Property", async () => {
        const rentMarket = await RentMarket.deployed();

        // Create 
        let listingPrice = await rentMarket.getListingPrice();
        const setTargetReceipt = await rentMarket.createProperty("Test One", "London", "UK", "www.google.com", 2, {value: listingPrice, from: accounts[2]});
        await rentMarket.createProperty("Test 2", "Manchester", "UK", "www.google.com", 2, {value: listingPrice, from: accounts[2]});

        // Get stored value
        let propertiesFromHost = await rentMarket.fetchPropertiesFromHost({from: accounts[2]});
        let propertyID = propertiesFromHost[0].propertyID;
        let oldName = propertiesFromHost[0].name;
        let newName = "Test Oneeeeeeee";
        await rentMarket.updateProperty(parseInt(propertyID), newName, "London", "UK", "www.google.com", 2, {from: accounts[2]});
        let updatedPropertyInfo = await rentMarket.fetchProperty(propertyID);
        expect(newName).to.equal(updatedPropertyInfo.name);
    });

    it("Delete Property", async () => {
        const rentMarket = await RentMarket.deployed();

        // Create 
        let listingPrice = await rentMarket.getListingPrice();
        const setTargetReceipt = await rentMarket.createProperty("Test One", "London", "UK", "www.google.com", 2, {value: listingPrice, from: accounts[3]});

        // Get stored value
        let propertiesFromHost = await rentMarket.fetchPropertiesFromHost({from: accounts[3]});
        let propertyID = propertiesFromHost[0].propertyID;
        let totalPropertiesBeforeTest = propertiesFromHost.length;
        await rentMarket.removeProperty(propertyID, {from: accounts[3]});
        let propertiesFromHostAfterRemoval = await rentMarket.fetchPropertiesFromHost({from: accounts[3]});
        let totalPropertiesAfterTest = propertiesFromHostAfterRemoval.length;
        let userProperties = await rentMarket.fetchUserProperties({from: accounts[3]});
        expect(totalPropertiesBeforeTest).to.be.greaterThan(totalPropertiesAfterTest);
    });

    it("Book Property", async () => {
        const rentMarket = await RentMarket.deployed();
  
        // Create Properties
        let listingPrice = await rentMarket.getListingPrice();
        const setTargetReceipt = await rentMarket.createProperty("Test One", "London", "UK", "www.google.com", 2, {value: listingPrice});
        
        // Retrieve property
        let propertiesOnMarket = await rentMarket.fetchPropertiesFromHost();
        let testProperty = propertiesOnMarket[0];
        let propertyId = testProperty.propertyID;
        let price = testProperty.price;
        let startDate = Math.floor(new Date().getTime() / 1000);
        let endDateObj = new Date();
        endDateObj.setDate(endDateObj.getDate() + 2);
        let endDate = Math.floor(endDateObj.getTime() / 1000);
        const bookingReceipt = await rentMarket.bookProperty(propertyId, startDate, endDate, {value: price});
        let propertiesOnMarket2 = await rentMarket.fetchPropertiesFromHost();
        let propertyDataAfterTest = propertiesOnMarket2[0];
        let bookings = propertyDataAfterTest.bookings;
        expect(bookings.length).to.be.greaterThan(0);

      });
  });