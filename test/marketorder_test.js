const Dex = artifacts.require("Dex")
const Link = artifacts.require("Link")
const truffleAssert = require('truffle-assertions');

//test Market sell order


contract("Dex", accounts => {
    
    //test Market buy order
    //Market orders should be filled until the order book is empty or the market order is 100% filled
    it("Market orders should not fill more limit orders than the market order amount", async () => {
        let dex = await Dex.deployed()
        let link = await Link.deployed()

        let orderbook = await dex.getOrderBook(web3.utils.fromUtf8("LINK"), 1); //Get sell side orderbook
        assert(orderbook.length == 0, "Sell side Orderbook should be empty at start of test");

        await dex.addToken(web3.utils.fromUtf8("LINK"), link.address)

        await link.approve(dex.address, 5000, {from: accounts[0]});
        //await dex.deposit(web3.utils.fromUtf8("LINK"), 1000)
        await dex.depositETH({value: 5000})

        let money = await dex.balance(accounts[0],web3.utils.fromUtf8("ETH"))
        assert.equal(money,5000)

        //Send LINK tokens to accounts 1, 2, 3 from account 0
        await link.transfer(accounts[1], 150)
        await link.transfer(accounts[2], 150)
        await link.transfer(accounts[3], 150)

        //Approve DEX for accounts 1, 2, 3
        await link.approve(dex.address, 50, {from: accounts[1]});
        await link.approve(dex.address, 50, {from: accounts[2]});
        await link.approve(dex.address, 50, {from: accounts[3]});

        //Deposit LINK into DEX for accounts 1, 2, 3
        await dex.deposit(web3.utils.fromUtf8("LINK"), 50, {from: accounts[1]});
        await dex.deposit(web3.utils.fromUtf8("LINK"), 50, {from: accounts[2]});
        await dex.deposit(web3.utils.fromUtf8("LINK"), 50, {from: accounts[3]});

        //Fill up the sell order book
        await dex.createlimitOrder(web3.utils.fromUtf8("LINK"), 1, 5, 300, {from: accounts[1]})
        await dex.createlimitOrder(web3.utils.fromUtf8("LINK"), 1, 5, 400, {from: accounts[2]})
        await dex.createlimitOrder(web3.utils.fromUtf8("LINK"), 1, 5, 500, {from: accounts[3]})

        //Create market order that should fill 2/3 orders in the book
        await dex.createMarketOrder(web3.utils.fromUtf8("LINK"), 0, 10);

        orderbook = await dex.getOrderBook(web3.utils.fromUtf8("LINK"), 1); //Get sell side orderbook
        assert.equal(orderbook.length, 1);// "Sell side Orderbook should only have 1 order left"
        console.log(orderbook);
        assert(orderbook[0].availableFill == 5, "Sell side order should have 0 filled");
        
    })


})