pragma solidity 0.8.10;
pragma experimental ABIEncoderV2;

import "./Wallet.sol";

contract Dex is Wallet{
    using SafeMath for uint;

    enum Side{
        BUY,
        SELL
    }

    struct Order{
        uint id;
        address trader;
        bytes32 ticker;
        Side side;
        uint amount;
        uint price;
        uint availableFill;
    }

    mapping(bytes32 => mapping(uint => Order[])) public OrderBook;

    function getOrderBook(bytes32 ticker, Side side) public view returns(Order[] memory) {
        return OrderBook[ticker][uint(side)];
    }

    function createlimitOrder(bytes32 ticker, Side side, uint amount, uint price) external {

        if(uint(side) == 0){ 
            require(balance[msg.sender][bytes32("ETH")] >= amount.mul(price),"Eth not sufficient");
        }
        else {
            require(balance[msg.sender][ticker] >= amount,"Token not sufficient");
        }
        
        OrderBook[ticker][uint(side)].push(
            Order(OrderBook[ticker][uint(side)].length, msg.sender, ticker, side, amount, price, amount)
            );

        Order[] storage orders = OrderBook[ticker][uint(side)];

        uint i = orders.length > 0 ? orders.length - 1 : 0;
        if(side == Side.BUY && i > 0){
            while(i > 0){
                if(orders[i].price > orders[i - 1].price){
                    Order memory pool = orders[i - 1];
                    orders[i - 1] = orders[i];
                    orders[i] = pool;    
                }
                else {
                    break;
                }
                i--;
            }
        }

        else if(side == Side.SELL && i > 0){
            while(i > 0){
                if(orders[i].price < orders[i - 1].price){
                    Order memory pool = orders[i - 1];
                    orders[i - 1] = orders[i];
                    orders[i] = pool;    
                }
                else {
                    break;
                }
                i--;
            }
        }
    }

    function createMarketOrder(bytes32 ticker, Side side, uint orderamount) external {

        uint orderSide;
        if(side == Side.BUY){
            orderSide = 1;
        }
        else
            orderSide = 0;

        Order[] storage orders = OrderBook[ticker][orderSide];

        if(side == Side.BUY){
            for(uint i = 0; i < orders.length && orderamount > 0; i++){
                uint canfill = 0;
                uint cost = orders[i].price;
                if(orderamount >= orders[i].availableFill){
                    canfill = orders[i].availableFill;
                    orderamount = orderamount.sub(canfill);
                }
                else {
                    for( canfill = 0; canfill < orderamount; canfill++){
                        orderamount = orderamount.sub(canfill);
                    }
                    
                }
                require(balance[msg.sender]["ETH"] >= canfill.mul(cost), "ETH no sufficient check 1");
                uint prevETH = balance[msg.sender][bytes32("ETH")]; // Sender ETH must decrease
                uint prevToken = balance[msg.sender][bytes32("Link")]; // Sender Token must increase
                //transfer ETH
                balance[msg.sender][bytes32("ETH")] = balance[msg.sender][bytes32("ETH")].sub(canfill.mul(cost));
                balance[orders[i].trader][bytes32("ETH")] = balance[orders[i].trader][bytes32("ETH")].add(canfill.mul(cost));
                //transfer Token
                balance[msg.sender][ticker] = balance[msg.sender][ticker].add(canfill);
                balance[orders[i].trader][ticker] = balance[orders[i].trader][ticker].sub(canfill);
                orders[i].availableFill = orders[i].availableFill.sub(canfill);
                //orderamount -= canfill;
                //check result
            }
            
            while(orders.length > 0 && orders[0].availableFill == 0){
                for(uint i = 0; i < orders.length - 1; i++){
                    orders[i] = orders[i + 1];
                }
                orders.pop();
            }
            
        }
    }

}