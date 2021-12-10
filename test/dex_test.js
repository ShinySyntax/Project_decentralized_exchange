const Dex = artifacts.require("Dex")
const Link = artifacts.require("Link")
const truffleAssert = require('truffle-assertions');

//the user must have ETH deposited such that deposited eth >= buy order value
//the user must have enough tokens deposited such that token balance >= sell order amount
//the Buy order book should be ordered on price from highest to lowest starting at index 0  check

contract("Dex", accounts => {

    it("should throw an error if token balance is too low when creating BUY limit order", async () => {
        let dex = await Dex.deployed()
        let link = await Link.deployed()
        await truffleAssert.reverts(
            dex.createlimitOrder(web3.utils.fromUtf8("LINK"), 0, 10, 3)
        )
        await dex.depositETH({value : 30})
        await truffleAssert.passes(
            dex.createlimitOrder(web3.utils.fromUtf8("LINK"), 0, 10, 3)
        )

    })

    it("should throw an error if token balance is too low when creating SELL limit order", async () => {
        let dex = await Dex.deployed()
        let link = await Link.deployed()
        await truffleAssert.reverts(
            dex.createlimitOrder(web3.utils.fromUtf8("LINK"), 1, 10, 1)
        )
        await link.approve(dex.address, 10);
        await dex.addToken(web3.utils.fromUtf8("LINK"), link.address, {from: accounts[0]})
        await dex.deposit(web3.utils.fromUtf8("LINK"), 10);
        await truffleAssert.passes(
            dex.createlimitOrder(web3.utils.fromUtf8("LINK"), 1, 10, 1)
        )
    })

    it("the index 0 in Buyorder should be a highest price", async () => {
        let dex = await Dex.deployed()
        let link = await Link.deployed()

        await dex.addToken(web3.utils.fromUtf8("LINK"), link.address, {from: accounts[0]});
        await link.approve(dex.address,500);
        await dex.depositETH({value : 100});
        //await dex.deposit(web3.utils.fromUtf8("Link"), 100);

        await dex.createlimitOrder(web3.utils.fromUtf8("LINK"),0,10,3);
        await dex.createlimitOrder(web3.utils.fromUtf8("LINK"),0,10,5);
        await dex.createlimitOrder(web3.utils.fromUtf8("LINK"),0,10,7);
        await dex.createlimitOrder(web3.utils.fromUtf8("LINK"),0,10,2);

        //let balance = await dex.getOrderBook(web3.utils.fromUtf8("Link"),0)
        let order0 = await dex.OrderBook(web3.utils.fromUtf8("LINK"),0,0)
        
        //console.log(balance);

        assert.equal(order0.price.toNumber(),7)
    })

    it("the index 0 in Sellorder should be a lowest price", async () => {
        let dex = await Dex.deployed()
        let link = await Link.deployed()

        await dex.addToken(web3.utils.fromUtf8("LINK"), link.address, {from: accounts[0]});
        await link.approve(dex.address,500);
        
        await dex.createlimitOrder(web3.utils.fromUtf8("LINK"),1,10,3)
        await dex.createlimitOrder(web3.utils.fromUtf8("LINK"),1,10,5)
        await dex.createlimitOrder(web3.utils.fromUtf8("LINK"),1,10,7)
        await dex.createlimitOrder(web3.utils.fromUtf8("LINK"),1,10,2)
        
        let order1 = await dex.getOrderBook(web3.utils.fromUtf8("LINK"),1)
        
        //console.log(order1);

        assert.equal(order1[0].price,1)
    })



})