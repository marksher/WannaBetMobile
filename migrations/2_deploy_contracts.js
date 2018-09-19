var LibraryDemo = artifacts.require("./LibraryDemo.sol");
var WannaBet = artifacts.require("./WannaBet.sol");

module.exports = function(deployer) {
  deployer.deploy(LibraryDemo);
  deployer.link(LibraryDemo, WannaBet);
  deployer.deploy(WannaBet);
};
