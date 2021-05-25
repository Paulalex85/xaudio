pragma solidity 0.6.2;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockDelegateManager is ERC20("StakedAudio", "StkAudio"){

    IERC20 audio;

    constructor(IERC20 _audio) public {
        audio = _audio;
    }

    function delegateStake(address _targetSP, uint256 _amount) external returns (uint256) {
        audio.transferFrom(msg.sender, address(this), _amount);
        super._mint(msg.sender, _amount);
    }
    function getTotalDelegatorStake(address _delegator) external returns (uint256) {
        return balanceOf(_delegator);
    }
}