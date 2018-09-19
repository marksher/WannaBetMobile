# Avoiding Common Attacks

Reentrancy:
* Transfers of ether are done using `playerAddress.transfer()` rather than `playerAddress.call.value()()` to avoid a bad actor from calling the function repeatedly.
* No external contract functions are called to also avoid reentrancy vulnerabilities

Timestamp dependence:
* It is known that the timestamp in a block can be manipulated, and this can affect the behavior of a vote since it uses a timeLimit to determine whether a bet is still active or not. However, the timestamp can only be manipulated to the extent of falling in somewhere in between the timestamp of the previous and following block, and therefore shouldn't result in a major impact on a bet duration. The purpose of the time limit is mainly to prevent funds from being locked into the contract if one player forgets to vote, or if a player purposefully decides not to vote because they are going to lose the bet.

Integer overflow:
* When updating player stats (total number of agreements, total number of disagreements, total number bets, total amount bet), there is a possibility of integer overflow. Therefore, when these stats are updated, the contract code first checks to see if the result is greater before the addition. If the result is not greater, then the stat is not updated. This would only occur if a player has bet so much that they have reached the upper value representable by a uint256 in any of these stats, and at this time it would be acceptable for the player's stats to reflect this highest possible value.

Underflow in storage / storage manipulation:
* The dynamic arrays used in this smart contract are only manipulated using private helper methods (_deleteCreatedBet_, _deleteOpenBet_, _deleteOngoingBet_), so cannot be called publicly. Additionally, when the length of these arrays is manipulated, the code first checks to see there is a valid value at that array index.

Failed transfers of value
* There is a possibility that the transfers of ether fail during the smart contract execution. The effect of this would be that the _ongoingBets_ and _pastBets_ arrays for the players may be incorrect. Some future work should consider how to best update these arrays in the event that ether transfers fail. One way would be to implement a pull-payment system rather than the current push-payment system.

Reaching gas limit when iterating over dynamic arrays
* There is a possibility that the gas limit can be reached when calling some of the private helper functions. The _deleteCreatedBet_, _deleteOpenBet_, and _deleteOngoingBet_ all iterate over a dynamically-sized array. If a player creates a large number of bets, they may reach a point when iterating over that array exceeds the gast limit. The helper functions which are supposed to keep a record of how many _created_, _open_, _ongoing_ and _past_ bets the player can stop working, which would misrepresent to the UI that player's record.

Circuit breaker
* In the event of any major bugs being found, a circuit braker function was added so that the contract creator can stop bets from being created. At this point, bets can be canceled by active players.



