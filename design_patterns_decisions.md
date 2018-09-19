# Design Pattern Requirements

## Emergency Stop
An emergency stop/circuit breaker was implemented within the contract to allow the contract creator to trigger the circuit breaker to stop the execution of certain functions within the contract. The functions that are stopped include: creating a bet, joining a bet, and casting a vote. Cancelling a bet was not included as players should be able to cancel a bet to return funds regardless of an emergency stop.  

## Ether per Bet
There is a maximum limit of ether that may be sent to the contract to both create and join a bet. This ensures that there is not an enormously large amount of ether sent to the contract for a bet, which could be lost.

## Check-Effects-Interaction Pattern
A check-effects-interaction pattern was used where first the input arguments were validated where appropriate, throwing errors when the arguments do not match the expected input. Then, changes were made to the state of the smart contract. Finally, since this contract does not interact with any other smart contracts, the transfer of Ether is the the last step of the functions where applicable.

