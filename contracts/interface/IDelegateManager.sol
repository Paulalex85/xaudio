pragma solidity 0.6.2;

interface IDelegateManager {
    function delegateStake(address _targetSP, uint256 _amount) external returns (uint256);
    function getTotalDelegatorStake(address _delegator) external view returns (uint256);
    function claimRewards(address _serviceProvider) external;
}