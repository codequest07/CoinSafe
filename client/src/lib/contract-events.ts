import { prepareEvent } from "thirdweb";

export const depositSuccessfulEvent = prepareEvent({
  signature:
    "event DepositSuccessful(address indexed user, address indexed token, uint256 amount)",
});

export const claimSuccessfulEvent = prepareEvent({
  signature:
    "event ClaimSuccessful(address indexed user, uint256 id, address indexed token, uint256 amount)",
});

export const savedSuccessfullyEvent = prepareEvent({
  signature:
    "event SavedSuccessfully(address indexed user, address indexed token, uint256 amount, uint256 duration, uint256 id)",
});

export const savedToEmergencySuccessfullyEvent = prepareEvent({
  signature:
    "event SavedToEmergencySuccessfully(address indexed user, address indexed token, uint256 amount)",
});

export const topUpSuccessfulEvent = prepareEvent({
  signature:
    "event TopUpSuccessful(address indexed user, uint256 indexed id, address token, uint256 amount)",
});

export const withdrawnEvent = prepareEvent({
  signature:
    "event Withdrawn(address indexed user, address tokenType, uint256 amount)",
});

export const spendAndSaveExecutedEvent = prepareEvent({
  signature:
    "event SpendAndSaveExecuted(address indexed user, address indexed token, uint256 amountSaved)",
});

export const automatedSavingSetEvent = prepareEvent({
  signature:
    "event AutomatedSavingSet(address indexed user, address indexed token, uint256 amount, uint256 frequency)",
});

export const automatedSavingExecutedEvent = prepareEvent({
  signature:
    "event AutomatedSavingExecuted(address indexed user, address indexed token, uint256 amount)",
});

export const savingsWithdrawnEvent = prepareEvent({
  signature:
    "event SavingsWithdrawn(address indexed user, address indexed token, uint256 amount, uint256 fee, bool earlyWithdrawal)",
});

export const planCreatedEvent = prepareEvent({
  signature:
    "event PlanCreated(address indexed user, address indexed token, uint8 percentage, uint256 duration)",
});

export const automatedPlanCreatedEvent = prepareEvent({
  signature:
    "event AutomatedPlanCreated(address indexed user, address indexed token, uint256 amount, uint256 frequency)",
});

export const transactionHistoryUpdatedEvent = prepareEvent({
  signature:
    "event TransactionHistoryUpdated(address indexed user, uint256 txCount, uint256 txId, address indexed token, string typeOfTransaction, uint256 amount, uint256 timestamp)",
});

export const batchAutomatedSavingsExecutedEvent = prepareEvent({
  signature:
    "event BatchAutomatedSavingsExecuted(uint256 executedCount, uint256 skippedCount)",
});

export const automatedSavingsFeeChargedEvent = prepareEvent({
  signature:
    "event AutomatedSavingsFeeCharged(address indexed user, address indexed token, uint256 fee)",
});

export const feeConfigurationUpdatedEvent = prepareEvent({
  signature:
    "event FeeConfigurationUpdated(uint256 newFeePercentage, address newFeeCollector)",
});

export const savingsClaimedEvent = prepareEvent({
  signature:
    "event SavingsClaimed(address indexed user, address token, uint256 amount)",
});

export const emergencySavingsWithdrawnEvent = prepareEvent({
  signature:
    "event EmergencySavingsWithdrawn(address indexed user, address indexed token, uint256 amount)",
});

export const emergencyWithdrawalExecutedEvent = prepareEvent({
  signature:
    "event EmergencyWithdrawalExecuted(address indexed user, address indexed token, uint256 amount)",
});

export const automatedPlanUpdatedEvent = prepareEvent({
  signature:
    "event AutomatedPlanUpdated(address indexed user, address indexed token, uint256 amount, uint256 frequency)",
});

export const tokenAddedEvent = prepareEvent({
  signature: "event TokenAdded(address indexed token, string symbol)",
});

export const tokenRemovedEvent = prepareEvent({
  signature: "event TokenRemoved(address indexed token)",
});

export const streakResetEvent = prepareEvent({
  signature: "event StreakReset(address indexed user)",
});

export const longestStreakUpdatedEvent = prepareEvent({
  signature:
    "event LongestStreakUpdated(address indexed user, uint256 newLongestStreak)",
});

export const streakIncreasedEvent = prepareEvent({
  signature:
    "event StreakIncreased(address indexed user, uint256 newCurrentStreak)",
});

export const withdrawalFromAutomatedSafeEvent = prepareEvent({
  signature:
    "event WithdrawalFromAutomatedSafe(address indexed user, address token, uint256 amount)",
});

export const claimedFromAutomatedSafeEvent = prepareEvent({
  signature:
    "event ClaimedFromAutomatedSafe(address indexed user, address token, uint256 amount)",
});

export const multipliersUpdatedEvent = prepareEvent({
  signature:
    "event MultipliersUpdated(uint8 baseThreshold, uint8 mediumThreshold, uint8 ultraThreshold, uint8 baseMultiplier, uint8 mediumMultiplier, uint8 ultraMultiplier)",
});

export const streakStartedEvent = prepareEvent({
  signature: "event StreakStarted(address indexed user)",
});

export const tokenCancelledFromAutomatedPlanEvent = prepareEvent({
  signature:
    "event TokenCancelledFromAutomatedPlan(address indexed user, address indexed token)",
});

export const prematureFeeConfigurationUpdatedEvent = prepareEvent({
  signature:
    "event PrematureFeeConfigurationUpdated(uint256 newFeePercentage, address newFeeCollector)",
});

export const streakIntervalUpdatedEvent = prepareEvent({
  signature: "event StreakIntervalUpdated(uint256 newInterval)",
});

export const pointsAwardedEvent = prepareEvent({
  signature:
    "event PointsAwarded(address indexed user, uint256 points, uint256 multiplier)",
});

export const pointWeightsUpdatedEvent = prepareEvent({
  signature:
    "event PointWeightsUpdated(uint8 creatorWeight, uint8 stackersWeight, uint8 pilotWeight)",
});

export const safeDurationExtendedEvent = prepareEvent({
  signature:
    "event SafeDurationExtended(address indexed user, uint256 safeId, uint256 extension, bool isUnlocked)",
});

export const automatedDurationExtendedEvent = prepareEvent({
  signature:
    "event AutomatedDurationExtended(address indexed user, uint256 extension, bool isUnlocked)",
});

export const safeDeletedEvent = prepareEvent({
  signature: "event SafeDeleted(address indexed user, uint256 safe)",
});

export const automatedPlanTerminatedEvent = prepareEvent({
  signature: "event AutomatedPlanTerminated(address indexed user)",
});

export const automatedSafeActivatedEvent = prepareEvent({
  signature: "event AutomatedSafeActivated(address indexed user)",
});

export const automatedSafeDeactivatedEvent = prepareEvent({
  signature: "event AutomatedSafeDeactivated(address indexed user)",
});

export const fundingFacetEvents = [depositSuccessfulEvent, withdrawnEvent];
export const automatedSavingsFacetEvents = [
  automatedPlanCreatedEvent,
  automatedPlanUpdatedEvent,
  tokenCancelledFromAutomatedPlanEvent,
  automatedDurationExtendedEvent,
  automatedPlanTerminatedEvent,
  withdrawalFromAutomatedSafeEvent,
  claimedFromAutomatedSafeEvent,
];
export const targetedSavingsFacetEvents = [
  savedSuccessfullyEvent,
  topUpSuccessfulEvent,
  safeDurationExtendedEvent,
  safeDeletedEvent,
  savingsWithdrawnEvent,
  claimSuccessfulEvent,

];
export const emergencySavingsFacetEvents = [savedToEmergencySuccessfullyEvent, emergencyWithdrawalExecutedEvent];
