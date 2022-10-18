const RentMarket = artifacts.require("RentMarket");
module.exports = function (deployer) {
  deployer.deploy(RentMarket);
};