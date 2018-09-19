var WannaBet = artifacts.require("./WannaBet.sol");

contract('WannaBet', async(accounts) => {
    const player1addr = accounts[0]
    const player2addr = accounts[1]
    const betName = "mybet"
    const timeLimitSeconds = 1800
    const betAmount = web3.toWei(10, "finney")
    const gasAmount = web3.toWei(20, "gwei")

    it("should verify bet creation works as intended", async() => {
        const wb = await WannaBet.deployed()

        await wb.createBet(betName, timeLimitSeconds, player2addr, {from: player1addr, value: betAmount})

        var betId = await wb.createdBets(player1addr,0)
        //console.log('Created bet with betId: ', betId)
        var betIdOpen = await wb.openBets(player2addr,0)
        assert.equal(betId, betIdOpen, "created betId for p1 doesn't match open betId for p2")

        var bet = await wb.getBet.call(betName)
        /*
        console.log('betName = ', bet[0])
        console.log('betAmount = ', bet[1])
        console.log('currentStatus = ', bet[2])
        console.log('betEndingTime = ', bet[3])
        console.log('winner = ', bet[4])
        console.log('player 1 address = ', bet[5])
        console.log('player 2 address = ', bet[6])
        console.log('player 1 vote = ', bet[7])
        console.log('player 2 vote = ', bet[8])
        */
        assert.equal(betName, bet[0], "bet name doesn't match")
        assert.equal(betAmount, bet[1], "bet amount doesn't match")
        // BetStatus.created == 0
        assert.equal(0, bet[2], "bet status doesn't match")
        assert.equal(0, bet[4], "winner should not have been set")
        assert.equal(player1addr, bet[5], "player 1 address doesn't match")
        assert.equal(player2addr, bet[6], "player 2 address doesn't match")
        assert.equal(0, bet[7], "player 1 vote should not have been set")
        assert.equal(0, bet[8], "player 2 vote should not have been set")
    });
    it("should verify voting works as intended", async() => {
        const wb = await WannaBet.deployed()

        await wb.createBet(betName, timeLimitSeconds, player2addr, {from: player1addr, value: betAmount})

        var betId = await wb.createdBets(player1addr,0)
        //console.log('Created bet with betId: ', betId)

        await wb.joinBet(betName, player1addr, {from: player2addr, value: betAmount})

        var betIdOngoingP1 = await wb.ongoingBets(player1addr,0)
        var betIdOngoingP2 = await wb.ongoingBets(player2addr,0)
        assert.equal(betId, betIdOngoingP1, "betId doesn't match for p1 after p2 joined bet")
        assert.equal(betId, betIdOngoingP2, "betId doesn't match for p2 after joining bet")

        var bet = await wb.getBet.call(betName)
        // BetStatus.joined == 1
        assert.equal(1, bet[2], "bet status doesn't match after p2 joined")

        await wb.castVote(betName, 1, {from: player1addr})
        var bet = await wb.getBet.call(betName)
        assert.equal(1, bet[7], "player 1 vote doesn't match after p1 vote")
        assert.equal(0, bet[8], "player 2 vote doesn't match after p1 vote")

        await wb.castVote(betName, 1, {from: player2addr})
        var bet = await wb.getBet.call(betName)
        assert.equal(1, bet[7], "player 1 vote doesn't match after p2 vote")
        assert.equal(1, bet[8], "player 2 vote doesn't match after p2 vote")

        var bet = await wb.getBet.call(betName)

        var betIdCompleted = await wb.pastBets(player1addr,0)
        assert.equal(betId, betIdCompleted, "completed betId doesn't match for p1")
        betIdCompleted = await wb.pastBets(player2addr,0)
        assert.equal(betId, betIdCompleted, "completed betId doesn't match for p2")
    });
    it("should verify transaction amounts for an agreement", async() => {
        const wb = await WannaBet.deployed()

        const betAmountInt = parseInt(betAmount,10)
        var p1BalanceStart = await web3.eth.getBalance(player1addr).toNumber()
        var p2BalanceStart = await web3.eth.getBalance(player2addr).toNumber()
        var wbBalanceStart = await web3.eth.getBalance(wb.address).toNumber()
        //console.log("p1 balance start: ", p1BalanceStart)
        //console.log("p2 balance start: ", p2BalanceStart)
        //console.log("wb balance start: ", wbBalanceStart)

        await wb.createBet(betName, timeLimitSeconds, player2addr, {from: player1addr, value: betAmount, gasPrice: gasAmount})

        var p1BalanceAfterCreation = await web3.eth.getBalance(player1addr).toNumber()
        var wbBalanceAfterCreation = await web3.eth.getBalance(wb.address).toNumber()
        //console.log("p1 balance after creation: ", p1BalanceAfterCreation)
        //console.log("wb balance after creation: ", wbBalanceAfterCreation)
        assert.isBelow(p1BalanceAfterCreation, p1BalanceStart - betAmountInt, "p1 balance should be reduced by bet amount and gas costs")
        assert.equal(wbBalanceAfterCreation, wbBalanceStart + betAmountInt, "contract balance should be increased by bet amount after bet creation")

        var betId = await wb.createdBets(player1addr,0)

        await wb.joinBet(betName, player1addr, {from: player2addr, value: betAmount})

        var p2BalanceAfterJoining = await web3.eth.getBalance(player2addr).toNumber()
        var wbBalanceAfterJoining = await web3.eth.getBalance(wb.address).toNumber()
        assert.isBelow(p2BalanceAfterJoining, p2BalanceStart - betAmountInt, "p2 balance should be reduced by bet amount and gas costs")
        assert.equal(wbBalanceAfterJoining, wbBalanceAfterCreation + betAmountInt, "contract balance should be increased by bet amount after joining")

        await wb.castVote(betName, 1, {from: player1addr})
        var p1BalanceAfterVoting = await web3.eth.getBalance(player1addr).toNumber()

        await wb.castVote(betName, 1, {from: player2addr})
        var p1BalanceAfterAgreement = await web3.eth.getBalance(player1addr).toNumber()
        var p2BalanceAfterAgreement = await web3.eth.getBalance(player2addr).toNumber()
        var wbBalanceAfterAgreement = await web3.eth.getBalance(wb.address).toNumber()
        assert.equal(p1BalanceAfterAgreement, p1BalanceAfterVoting + betAmountInt*18/10, "p1 balance should have increased by 90% of pot for winning")
        assert.isBelow(p2BalanceAfterAgreement, p2BalanceAfterJoining + betAmountInt*2/10, "p2 balance should have increased by 10% of pot and been reduced by gas costs")
        assert.equal(wbBalanceAfterAgreement, wbBalanceAfterJoining - 2*betAmountInt, "contract balance should have decreased by winnings")

        // Repeat for p2 win
        await wb.createBet(betName, timeLimitSeconds, player2addr, {from: player1addr, value: betAmount, gasPrice: gasAmount})
        p1BalanceAfterCreating = await web3.eth.getBalance(player1addr).toNumber()
        betId = await wb.createdBets(player1addr,0)
        await wb.joinBet(betName, player1addr, {from: player2addr, value: betAmount})
        wbBalanceAfterJoining = await web3.eth.getBalance(wb.address).toNumber()
        await wb.castVote(betName, 2, {from: player2addr})
        p2BalanceAfterVoting = await web3.eth.getBalance(player2addr).toNumber()
        await wb.castVote(betName, 2, {from: player1addr})

        p1BalanceAfterAgreement = await web3.eth.getBalance(player1addr).toNumber()
        p2BalanceAfterAgreement = await web3.eth.getBalance(player2addr).toNumber()
        wbBalanceAfterAgreement = await web3.eth.getBalance(wb.address).toNumber()
        assert.isBelow(p1BalanceAfterAgreement, p1BalanceAfterCreating + betAmountInt*2/10, "p1 balance should have increased by 10% of pot for winning")
        assert.equal(p2BalanceAfterAgreement, p2BalanceAfterVoting + betAmountInt*18/10, "p2 balance should have increased by 90% of pot for winning")
        assert.equal(wbBalanceAfterAgreement, wbBalanceAfterJoining - 2*betAmountInt, "contract balance should have decreased by winnings")

    });
    it("should verify transaction amounts for a disagreement", async() => {
        const wb = await WannaBet.deployed()

        const betAmountInt = parseInt(betAmount,10)

        await wb.createBet(betName, timeLimitSeconds, player2addr, {from: player1addr, value: betAmount, gasPrice: gasAmount})

        var betId = await wb.createdBets(player1addr,0)

        await wb.joinBet(betName, player1addr, {from: player2addr, value: betAmount})
        var p2BalanceAfterJoining = await web3.eth.getBalance(player2addr).toNumber()
        var wbBalanceAfterJoining = await web3.eth.getBalance(wb.address).toNumber()

        await wb.castVote(betName, 1, {from: player1addr})
        var p1BalanceAfterVoting = await web3.eth.getBalance(player1addr).toNumber()

        await wb.castVote(betName, 2, {from: player2addr})
        var p1BalanceAfterDisagreement = await web3.eth.getBalance(player1addr).toNumber()
        var p2BalanceAfterDisagreement = await web3.eth.getBalance(player2addr).toNumber()
        var wbBalanceAfterDisagreement = await web3.eth.getBalance(wb.address).toNumber()
        assert.equal(p1BalanceAfterDisagreement, p1BalanceAfterVoting + betAmountInt*1/10, "p1 balance should have increased by 5% of pot due to disagreement")
        assert.isBelow(p2BalanceAfterDisagreement, p2BalanceAfterJoining + betAmountInt*1/10, "p2 balance should have increased by 5% of pot due to disagreement and been reduced by gas costs")
        assert.equal(wbBalanceAfterDisagreement, wbBalanceAfterJoining - 2/10*betAmountInt, "contract balance should have kept 90% of pot due to disagreement")
    });
    it("should test helper functions", async() => {
        const wb = await WannaBet.deployed()

        player3addr = accounts[2]
        player4addr = accounts[3]

        // generate a 'created' bet for p3 and an 'open' bet for p4
        await wb.createBet(betName, timeLimitSeconds, player4addr, {from: player3addr, value: betAmount, gasPrice: gasAmount})

        var player3Bets = await wb.getNumberOfPlayerBets(player3addr)
        assert.equal(player3Bets[0], 1) //created
        assert.equal(player3Bets[1], 0) //open
        assert.equal(player3Bets[2], 0) //ongoing
        assert.equal(player3Bets[3], 0) //past
        var player4Bets = await wb.getNumberOfPlayerBets(player4addr)
        assert.equal(player4Bets[0], 0)
        assert.equal(player4Bets[1], 1)
        assert.equal(player4Bets[2], 0)
        assert.equal(player4Bets[3], 0)

        // generate an 'ongoing' bet for p3 and p4
        await wb.joinBet(betName, player3addr, {from: player4addr, value: betAmount})

        player3Bets = await wb.getNumberOfPlayerBets(player3addr)
        assert.equal(player3Bets[0], 0) //created
        assert.equal(player3Bets[1], 0) //open
        assert.equal(player3Bets[2], 1) //ongoing
        assert.equal(player3Bets[3], 0) //past
        player4Bets = await wb.getNumberOfPlayerBets(player4addr)
        assert.equal(player4Bets[0], 0)
        assert.equal(player4Bets[1], 0)
        assert.equal(player4Bets[2], 1)
        assert.equal(player4Bets[3], 0)

        // generate a 'past' bet for p3 and p4
        await wb.castVote(betName, 1, {from: player3addr})
        await wb.castVote(betName, 1, {from: player4addr})

        player3Bets = await wb.getNumberOfPlayerBets(player3addr)
        assert.equal(player3Bets[0], 0) //created
        assert.equal(player3Bets[1], 0) //open
        assert.equal(player3Bets[2], 0) //ongoing
        assert.equal(player3Bets[3], 1) //past
        player4Bets = await wb.getNumberOfPlayerBets(player4addr)
        assert.equal(player4Bets[0], 0)
        assert.equal(player4Bets[1], 0)
        assert.equal(player4Bets[2], 0)
        assert.equal(player4Bets[3], 1)
    });
});
