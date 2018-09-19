# WannaBet

Wannabet utilizes Ethereum and smart contracts to provide the everyday gentleman's wager the security of a smart contract. The purpose of this dApp is to allow friends and acquaintances to make everyday bets with each other with the assurance that the bet will be followed through. The advantage of targetting bets with acquaintances and friends is that the social reputation cost of disagreeing with a person you know well in person is fairly high, which would discourage bad actors. Players identities are also tied to their wallet address and so players can build up their reputation over time, where those with low reputations or few bets may be considered less trustworthy. 

## Instructions for testing locally
Make sure you are into the main directory and have ganach running on 8545

**Compile Contracts**

* `truffle compile` 

**Migrate Contracts**

* `truffle migrate`

**Migrate and Run Contracts**

* `truffle test` (If it doesn't work initially try a second time)

**Setting up front-end locally**

Make sure you are in the wannabet_app folder
```
npm cache clean --force
npm install
npm run start
```

## Instructions for testing on Rinkeby
1. Go to http://ec2-18-207-180-168.compute-1.amazonaws.com:3000/ using a Web3 enabled browser, such as a browser with MetaMask.
2. Set Account 1 on MetaMask and create a bet with the address from your second account. Set the amount to be at least 10 finney and maximum of 10,000 finney. Set the time limit to be at least 1800 seconds and at most 8640000 seconds. Set your bet name. 
3. Switch metamask to account 2 and join bet
4. Cast vote “1” or “2" for account 2
5. Switch metamask to account 1 and cast vote. If it the transaction fails, try again.
6. Inspect the transaction to see the winnings

## Example Use Case
Alice bets Bob that she can do 20 push-ups. To make sure that the bet is followed through both Alice and Bob "put their money where their mouth is" and agree to betting 1 Ether.

### 1. Alice Creates Bet

Alice creates a bet by sending 1 Ether, a time limit of 30 minutes (1800 seconds), a bet name called "20 Push-ups" with Bob's wallet address (0xca35b7d915458ef540ade6068dfe2f44e8fa733c) to the smart contract.

```
createBet("20 Push-ups", 1800, 0xca35b7d915458ef540ade6068dfe2f44e8fa733c) 
```

### 2. Bob Joins Bet

Bob joins the bet by also sending 1 Ether, the bet name, and Alice's wallet address (0x14723a09acff6d2a60dcdf7aa4aff308fddc160c) .
```
 joinBet("20 Push-ups", 0x14723a09acff6d2a60dcdf7aa4aff308fddc160c)
 ```

### 3. Alice Completes Bet and Votes
Alice does 20 pushups before the 30 minutes. Alice, then votes herself as the winner. 
```
castVote("20 Push-ups", 1, 0xca35b7d915458ef540ade6068dfe2f44e8fa733c)
```

### 4. Bob's Conundrum
Bob is a very morally gray person. He doesn't know whether he should be honest and vote that Alice won the bet or whether he should lie and say he himself won.

### 4a. Bob is honest
Bob first considers being honest and agreeing that Alice won:
`castVote("20 Push-ups", 1, 0xca35b7d915458ef540ade6068dfe2f44e8fa733c)` 

If he does this, Alice is declared the winner and is payed out out 90% of the winnings. Since Bob and Alice agreed, Bob is rewarded back 10% of the winnings for agreeing. Alice and Bob also increase their reputation in betting, where their public scores of the number of agreed bets increase.

### 4b. Bob lies 
However, if Bob decides to lie and be a bad actor:
```
castVote("20 Push-ups", 2, 0xca35b7d915458ef540ade6068dfe2f44e8fa733c)
```

Then there would be a disagreement. To disincentivize Bob from being dishonest, he would only receive 5% of the winnings rather than the 10% that he would have received if he had agreed with Alice. Alice would also, unfortunately, only receive 5% of the winnings since there is no way to verify whether Alice or Bob were telling the truth. As a result, it would be in Bob's best interest to tell the truth and admit that he lost so that he receives 10% of the winnings back instead of just 5%. Similarly, both Alice and Bob's reputation would be negatively affected as their number of disagreed bets would increase making it less likely for others to bet them in the future.

### 5. Bob's Decision
Considering the consequences, Bob decides to be honest and vote that Alice won. Good job, Bob!
