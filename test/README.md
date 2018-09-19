# WannaBet smart contract tests
The tests contained in this directory test the WannaBet smart contract. Each item in the list below briefly describes one test and why it is important.

1. This test verifies bet creation. It is important to verify bet parameters after bet creation to guarantee accuracy. 
    * Player 1 creates a bet with player 2 using the `createBet(betName, timeLimitSeconds, player2address)` function.
    * After bet creation, player 1 can obtain the betId for the recently created bet by calling the function `createdBets(player1address,0)`, which is a public getter for the _createdBets_ mapping from player address to list of betIds. Note that the array index of 0 is provided as a the second argument to find the recently created betId. 
    * With the betId, the function `getBet(betId)` can be called to verify bet parameters.
2. This test verifies bet voting. It is important to verify bet parameters following voting, which changes the bet status from _joined_ to _completed_.
    * Player 1 creates a bet with player 2.
    * Player 2 joins the bet using the `joinBet(betName, player1address)` function.
    * Player 1 casts a vote using the `castVote(betName, vote)` function.
    * The casted vote is verified using `getBet(betId)` function.
    * Player 2 casts a vote using the `castVote(betName, vote)` function.
    * The casted vote is verified using `getBet(betId)` function.
    * The betIds in the _pastBets_ mapping are updated to reflect the completed bet.
3. This test verifies transaction amounts match the expected amount for each function call and when both players vote for the same outcome (an agreement). When an agreement happens, 90% of the pot should be transferred to the winner, and 10% of the pot should be transferred to the loser. 
    * Player 1 creates a bet. Player 1's balance should be reduced by betAmount + gas costs, and the WannaBet contract's balance should increase by betAmount.
    * Player 2 joins the bet. Player 2's balance should be reduced by betAmount + gas costs, and the WannaBet contract's balance should increase by betAmount.
    * Player 1 casts a vote in favor of player 1. Player 1's balance should be reduced by gas costs only.
    * Player 2 casts a vote in favor of player 1. Player 1's balance should be increased by 90% of the pot, Player 2's balance should have increased by 10% of the pot and reduced by gas costs, and the WannaBet's balance should be reduced by 2 times the betAmount.
    * The complementary outcome should be true when player 2 wins and there is an agreement.
4. This test verifies the transaction outcome when there is a disagreement in voting. In this case, each player receives only 5% of the pot back, and the smart contract keeps the other 90%.
    * Player 1 creates a bet.
    * Player 2 joins the bet.
    * Player 1 casts a vote in favor of player 1.
    * Player 2 casts a vote in favor of player 2. Player 1's balance should have increased by 5% of the pot. Player 2's balance should have increased by 5% of the pot. The smart contract's balance should have kept 90% of the pot due to the disagreement.
5. This test verifies the `getNumberOfPlayerBets(playerAddress)` helper function. This function is useful for checking how many of each type of bet a player has, which can be displayed by the user interface.
    * Player 1 creates a bet with player 2. Player 1 should have one _created_ bet and player 2 should have one _open_ bet.
    * Player 2 joins the bet. Player 1 should have one _ongoing_ bet and player 2 should have one _ongoing_ bet.
    * Players 1 and 2 vote on the bet. Player 1 should have one _past_ bet and player 2 should have one _past_ bet.
