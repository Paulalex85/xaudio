pragma solidity 0.6.2;

import "@openzeppelin/contracts-ethereum-package/contracts/token/ERC20/SafeERC20.sol";
import "@openzeppelin/contracts-ethereum-package/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts-ethereum-package/contracts/access/Ownable.sol";
import "@openzeppelin/contracts-ethereum-package/contracts/Initializable.sol";
import "@openzeppelin/contracts-ethereum-package/contracts/utils/Pausable.sol";

import "./interface/IDelegateManager.sol";

contract xAUDIO is
    Initializable,
    ERC20UpgradeSafe,
    OwnableUpgradeSafe,
    PausableUpgradeSafe
{
    using SafeMath for uint256;
    using SafeERC20 for IERC20;

    uint256 private constant BUFFER_TARGET = 20; //do 5% target buffer with div 20
    uint256 private constant MAX_UINT = 2**256 - 1;

    IERC20 private audio;
    IDelegateManager private delegateManager;
    address private serviceProvider;

    function initialize(
        string calldata _symbol,
        IERC20 _audio,
        IDelegateManager _delegateManager,
        address _serviceProvider
    ) external initializer {
        __Context_init_unchained();
        __Ownable_init_unchained();
        __ERC20_init_unchained("xAUDIO", _symbol);

        audio = _audio;
        delegateManager = _delegateManager;
        serviceProvider = _serviceProvider;
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

    /*
     * @dev Increase stake to 95% of AUDIO hold by the contract
     */
    function stake() external onlyOwnerOrManager {
        _rebalance();
    }

    /*
     * @dev claim rewards
     */
    function claimRewards() external onlyOwnerOrManager {
        delegateManager.claimRewards(serviceProvider);
    }

    function getStakedBalance() public view returns (uint256) {
        return delegateManager.getTotalDelegatorStake(address(this));
    }

    function getBufferBalance() public view returns (uint256) {
        return audio.balanceOf(address(this));
    }

    function _rebalance() private {
        uint256 stakedBalance = getStakedBalance();
        uint256 bufferBalance = getBufferBalance();
        uint256 targetBuffer =
            (stakedBalance.add(bufferBalance)).div(BUFFER_TARGET);

        if (bufferBalance > targetBuffer) {
            _stake(bufferBalance.sub(targetBuffer));
        }
    }

    function _stake(uint256 _amount) private {
        delegateManager.delegateStake(serviceProvider, _amount);
    }

    function approveAudio(address _toApprove) external onlyOwnerOrManager {
        require(_toApprove == address(delegateManager));
        audio.safeApprove(_toApprove, MAX_UINT);
    }

    modifier onlyOwnerOrManager {
        require(msg.sender == owner(), "Non-admin caller");
        _;
    }
}
