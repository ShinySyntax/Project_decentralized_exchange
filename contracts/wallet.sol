pragma solidity 0.8.10;

import "../node_modules/@OpenZeppelin/contracts/token/ERC20/IERC20.sol";
import "../node_modules/@OpenZeppelin/contracts/utils/math/SafeMath.sol";
import "../node_modules/@OpenZeppelin/contracts/access/Ownable.sol";

contract Wallet is Ownable{
    using SafeMath for uint; // เรียกใช้ Interface

    struct Token{
        bytes32 ticker; // ตัวย่อของToken ETH, BTC
        address tokenAddress; // address ของToken ใน Token.sol
    }

    mapping(bytes32 => Token) public tokenmapping; // ใส่ Ticker เพื่อดูข้อมูล Token
    bytes32[] public tokenlist; // list token ที่มี

    mapping(address => mapping(bytes32 => uint)) public balance; // ใส่ address กับ ชื่อToken เพื่อดูToken amount

    modifier TokenExist(bytes32 ticker){ // ตรวจสอบว่า Token มีอยู่จริงหรือไม่ ใน Token.sol
         require(tokenmapping[ticker].tokenAddress != address(0), "No token ticker");
         _;
    }

    function addToken(bytes32 ticker, address tokenAddress) onlyOwner external{ // เพิ่ม Token ที่จะเก็บลงใน wallet
        tokenmapping[ticker] = Token(ticker, tokenAddress);
        tokenlist.push(ticker);
    }

    function deposit(bytes32 ticker, uint amount) TokenExist(ticker) external { // ฝาก Token ลงใน wallet
        require(amount > 0, "Enter more token");

        IERC20(tokenmapping[ticker].tokenAddress).transferFrom(msg.sender,address(this), amount);
        balance[msg.sender][ticker] = balance[msg.sender][ticker].add(amount);
    }

    function withdraw(bytes32 ticker, uint amount) TokenExist(ticker) external { // ถอน Token ถอน ไปไว้ไหน?
        require(balance[msg.sender][ticker] >= amount, "balance no sufficient"); // check จำนวนToken ที่จะถอน

        balance[msg.sender][ticker] = balance[msg.sender][ticker].sub(amount); // ลบ balance
        IERC20(tokenmapping[ticker].tokenAddress).transfer(msg.sender, amount); // transfer Token ไปที่ ???
    }

    function depositETH() external payable {
        balance[msg.sender][bytes32("ETH")] = balance[msg.sender][bytes32("ETH")].add(msg.value);
    }

    function getETH() public view returns(uint) {
        return  balance[msg.sender][bytes32("ETH")];
    }


}