pragma solidity 0.6.2;

import "@openzeppelin/contracts-ethereum-package/contracts/token/ERC20/SafeERC20.sol";
import "@openzeppelin/contracts-ethereum-package/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts-ethereum-package/contracts/access/Ownable.sol";
import "@openzeppelin/contracts-ethereum-package/contracts/Initializable.sol";
import "@openzeppelin/contracts-ethereum-package/contracts/utils/Pausable.sol";

contract xAUDIO is
Initializable,
ERC20UpgradeSafe,
OwnableUpgradeSafe,
PausableUpgradeSafe
{
    using SafeMath for uint256;
    using SafeERC20 for IERC20;

    IERC20 private audio;

    function initialize(
        string calldata _symbol,
        IERC20 _audio
    ) external initializer {
        __Context_init_unchained();
        __Ownable_init_unchained();
        __ERC20_init_unchained("xAUDIO", _symbol);

        audio = _audio;
    }

    /*
    * @dev Mint xAUDIO using AUDIO
    * @param AUDIOAmount: AUDIO tokens to contribute
    */
    function mintWithToken(uint256 audioAmount) external whenNotPaused {
        require(audioAmount > 0, "Must send token");
        audio.safeTransferFrom(msg.sender, address(this), audioAmount);

        return super._mint(msg.sender, audioAmount);
    }
}
