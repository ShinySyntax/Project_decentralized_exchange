const Link = artifacts.require("Link");
const Dex= artifacts.require("Dex");

module.exports = async function (deployer,network,accounts) {
  await deployer.deploy(Link);
  let link = await Link.deployed();
  let dex = await Dex.deployed();

};