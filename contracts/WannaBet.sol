pragma solidity ^0.4.24;

contract WannaBet {

    address private creator;
    bool private stopped = false;

    modifier isAdmin() {
        require(msg.sender == creator);
        _;
    }

    function toggleContractActive(
    ) 
        public
        isAdmin 
    {
        stopped = !stopped;
    }

    modifier stopInEmergency { if (!stopped) _; }
    modifier onlyInEmergency { if (stopped) _; }

    uint public minBet = 10 finney;     // Equal to 0.001 Ether
    uint public maxBet = 10000 finney;  // Equal to 10 Ether
    uint public maxTimeLimit = 8640000; // Equal to 100 days
    uint public minTimeLimit = 1800;    // Equal to 30 minutes

    mapping (address => Player) players;
    mapping (bytes32 => Bet) public bets;
    mapping (address => bytes32[]) public createdBets;
    mapping (address => bytes32[]) public openBets;
    mapping (address => bytes32[]) public ongoingBets;
    mapping (address => bytes32[]) public pastBets;

    mapping (address => Stats) public playerStats;

    enum BetStatus {created, joined, completed, cancelled}
    enum BetWinner {None, Player1, Player2}

    struct Bet {
         string betName;
         uint256 betAmount;
         uint256 betEndingTime;
         BetWinner winner;
         BetStatus currentStatus;
         Player player1;
         Player player2;
    }

    struct Player {
        uint amountBet;
        bool voted;                 // if true, that person already voted
        address playerAddress;      // person delegated to
        uint vote;                  // who user voted for
    }

    struct Stats {
        uint totalAmountBet;              // amount of value player bet over lifetime
        uint totalNumberBet;              // number of times player bet over lifetime
        uint totalNumberAgreements;       // number of times player agreed on outcome of bet over lifetime
        uint totalNumberdisagreements;    // number of times player disagreed on outcome of bet over lifetime
    }

    function WannaBet(
    ) 
        public 
        payable 
    {
        creator = msg.sender;
    }

    function kill(
    ) 
    {
        if(msg.sender == creator)
        selfdestruct(creator);
    }


    function createBet(
        string _betName, 
        uint256 _timeLimitSeconds, 
        address _player2Address
    ) 
        public 
        stopInEmergency 
        payable 
    {
        require (msg.value >= minBet);
        require (msg.value <= maxBet);
        require (minTimeLimit <= _timeLimitSeconds && _timeLimitSeconds <= maxTimeLimit);
        uint256 betEndingTime = now + _timeLimitSeconds * 1 seconds;
        bytes32 _betId = keccak256(abi.encodePacked(_betName));
        address _player1Address = msg.sender;
        Player memory _player1 = Player(msg.value, false, _player1Address, 0);
        Player memory _player2 = Player(0, false, _player2Address, 0);
        Bet memory createdBet = Bet(_betName, msg.value, betEndingTime, BetWinner.None, BetStatus.created , _player1, _player2);

        bets[_betId] = createdBet;
        createdBets[_player1Address].push(_betId);
        openBets[_player2Address].push(_betId);

        // Check for integer overflow when updating stats
        if (playerStats[_player1Address].totalNumberBet + 1 > playerStats[_player1Address].totalNumberBet) {
            playerStats[_player1Address].totalNumberBet++;
        }

        if (playerStats[_player1Address].totalAmountBet + msg.value > playerStats[_player1Address].totalAmountBet) {
            playerStats[_player1Address].totalAmountBet += msg.value;
        }
    }

    function joinBet(
        string _betName, 
        address _player1Address
    ) 
        public 
        stopInEmergency 
        payable 
    {
        require (msg.value >= minBet);
        require (msg.value <= maxBet);
        bytes32 betId = keccak256(abi.encodePacked(_betName));
        address _player2Address = msg.sender;
        require( bets[betId].betEndingTime > now );
        require( bets[betId].player1.playerAddress == _player1Address );
        require( bets[betId].player2.playerAddress == _player2Address );
        require( bets[betId].player1.playerAddress != bets[betId].player2.playerAddress );
        require( bets[betId].betAmount == msg.value );
        bets[betId].currentStatus = BetStatus.joined;
        bets[betId].player2.amountBet = msg.value;
        deleteCreatedBet(_player1Address, betId);
        deleteOpenBet(_player2Address, betId);


        ongoingBets[_player1Address].push(betId);
        ongoingBets[_player2Address].push(betId);

        if (playerStats[_player2Address].totalNumberBet + 1 > playerStats[_player2Address].totalNumberBet) {
            playerStats[_player2Address].totalNumberBet++;
        }

        if (playerStats[_player2Address].totalAmountBet + msg.value > playerStats[_player2Address].totalAmountBet) {
            playerStats[_player2Address].totalAmountBet += msg.value;
        }
    }

    function castVote(
        string _betName, 
        uint _vote
    ) 
        public 
        stopInEmergency 
        payable 
    {
        bytes32 betId = keccak256(abi.encodePacked(_betName));
        address playerAddress = msg.sender;

        Player storage player1 = bets[betId].player1;
        Player storage player2 = bets[betId].player2;

        require( bets[betId].betEndingTime > now );
        require( player1.playerAddress == playerAddress || player2.playerAddress == playerAddress);

        if (playerAddress == player1.playerAddress){
            require (!player1.voted);
            require (_vote == 1 || _vote == 2);
            player1.vote = _vote;
            player1.voted = true;
        }
        else {
            require (!player2.voted);
            require (_vote == 1 || _vote == 2);
            player2.vote = _vote;
            player2.voted = true;
        }

        if (player1.voted && player2.voted) {
            require(player1.voted);
            require(player2.voted);
            require(bets[betId].currentStatus == BetStatus.joined);
            bets[betId].currentStatus = BetStatus.completed;

            if (player1.vote == player2.vote){
                // Winner is agreed on
                // Check for integer overflow
                if (playerStats[player1.playerAddress].totalNumberAgreements + 1 > playerStats[player1.playerAddress].totalNumberAgreements) {
                    playerStats[player1.playerAddress].totalNumberAgreements++;
                }
                if (playerStats[player2.playerAddress].totalNumberAgreements + 1 > playerStats[player2.playerAddress].totalNumberAgreements) {
                    playerStats[player2.playerAddress].totalNumberAgreements++;
                }

                if (player1.vote == 1 && player2.vote == 1){
                    require(player1.vote == 1);
                    require(player2.vote == 1);
                    bets[betId].winner = BetWinner.Player1;
                    // Remove ended bet
                    deleteOngoingBet(player1.playerAddress, betId);
                    deleteOngoingBet(player2.playerAddress, betId);
                    // Add to past bets
                    pastBets[player1.playerAddress].push(betId);
                    pastBets[player2.playerAddress].push(betId);
                    player1.playerAddress.transfer((bets[betId].betAmount*18)/10); // Winner gets 90% of total bet amount
                    player2.playerAddress.transfer((bets[betId].betAmount*2)/10);  // Loser gets 10% of total bet amount
                }
                if (player1.vote == 2 && player2.vote == 2){
                    require(player1.vote == 2);
                    require(player2.vote == 2);
                    bets[betId].winner = BetWinner.Player2;
                    // Remove ended bet
                    deleteOngoingBet(player1.playerAddress, betId);
                    deleteOngoingBet(player2.playerAddress, betId);
                    // Add to past bets
                    pastBets[player1.playerAddress].push(betId);
                    pastBets[player2.playerAddress].push(betId);
                    player2.playerAddress.transfer((bets[betId].betAmount*18)/10); // Winner gets 90% of total bet amount
                    player1.playerAddress.transfer((bets[betId].betAmount*2)/10);  // Loser gets 10% of total bet amount
                }
            }
            else {
                // Disagreement
                // Check for integer overflow
                if (playerStats[player1.playerAddress].totalNumberdisagreements + 1 > playerStats[player1.playerAddress].totalNumberdisagreements) {
                    playerStats[player1.playerAddress].totalNumberdisagreements++;
                }
                if (playerStats[player2.playerAddress].totalNumberdisagreements + 1 > playerStats[player2.playerAddress].totalNumberdisagreements) {
                    playerStats[player2.playerAddress].totalNumberdisagreements++;
                }
                // Remove ended bet
                deleteOngoingBet(player1.playerAddress, betId);
                deleteOngoingBet(player2.playerAddress, betId);
                // Add to past bets
                pastBets[player1.playerAddress].push(betId);
                pastBets[player2.playerAddress].push(betId);
                player1.playerAddress.transfer(bets[betId].betAmount/10);       // Disagreers get 5%
                player2.playerAddress.transfer(bets[betId].betAmount/10);       // Disagreers get 5%
            }
        }
    }


    function cancelBet(
        string _betName, 
        address _player2Address
    ) 
        public 
    {
        bytes32 betId = keccak256(abi.encodePacked(_betName));
        require(bets[betId].betEndingTime > now );
        require(bets[betId].player1.playerAddress == msg.sender);
        require(bets[betId].player2.playerAddress == _player2Address);
        require(bets[betId].currentStatus == BetStatus.created);
        bets[betId].currentStatus = BetStatus.cancelled;
        msg.sender.transfer(bets[betId].betAmount);
        playerStats[msg.sender].totalNumberBet--;
        playerStats[msg.sender].totalAmountBet -= bets[betId].betAmount;
        deleteCreatedBet(msg.sender, betId);
        deleteOpenBet(_player2Address, betId);
    }

    function getBet(
        string _betName
    ) 
        public 
        view 
        returns (
            string betName, 
            uint256 betAmount, 
            BetStatus betStatus, 
            uint256 betEndTime, 
            BetWinner betWinner, 
            address p1Address, 
            address p2Address, 
            uint256 p1Vote, 
            uint256 p2Vote,
            bytes32
        ) 
    {
        bytes32 betId = keccak256(abi.encodePacked(_betName));
        Bet storage currentBet = bets[betId];
        return (
            currentBet.betName,
            currentBet.betAmount,
            currentBet.currentStatus,
            currentBet.betEndingTime,
            currentBet.winner,
            currentBet.player1.playerAddress,
            currentBet.player2.playerAddress,
            currentBet.player1.vote,
            currentBet.player2.vote,
            betId
        );
    }

    function getNumberOfPlayerBets(
        address _playerAddress
    ) 
        public 
        view 
        returns (
            uint num_createdBets, 
            uint num_openBets, 
            uint num_ongoingBets, 
            uint num_pastBets
        ) 
    {
        return (
            createdBets[_playerAddress].length, 
            openBets[_playerAddress].length, 
            ongoingBets[_playerAddress].length, 
            pastBets[_playerAddress].length
        );
    }


    function deleteCreatedBet(
        address _playerAddress,
        bytes32 _betId
    ) 
        private 
    {
        uint length = createdBets[_playerAddress].length;
        for(uint index = 0;index<length;index++){
            if(createdBets[_playerAddress][index]==_betId){
                createdBets[_playerAddress][index] = createdBets[_playerAddress][length-1];
                createdBets[_playerAddress].length--;
                break;
            }
        }
    }

     function deleteOpenBet(
        address _playerAddress, 
        bytes32 _betId
    ) 
        private 
    {
        uint length = openBets[_playerAddress].length;
        for(uint index = 0;index<length;index++){
            if(openBets[_playerAddress][index]==_betId){
                openBets[_playerAddress][index] = openBets[_playerAddress][length-1];
                openBets[_playerAddress].length--;
                break;
            }
        }
    }

     function deleteOngoingBet(
        address _playerAddress, 
        bytes32 _betId
    ) 
        private 
    {
        uint length = ongoingBets[_playerAddress].length;
        for(uint index = 0;index<length;index++){
            if(ongoingBets[_playerAddress][index]==_betId){
                ongoingBets[_playerAddress][index] = ongoingBets[_playerAddress][length-1];
                ongoingBets[_playerAddress].length--;
                break;
            }
        }
    }

    function getOpenBets(
        address _playerAddress
    )
        public
        view
        returns (
            bytes32[]
        )
    {
        return openBets[_playerAddress];
    }
    
    function getOngoingBets(
        address _playerAddress
    )
        public
        view
        returns (
            bytes32[]
        )
    {
        return ongoingBets[_playerAddress];
    }
    
    function getPastBest(
        address _playerAddress
    )
        public
        view
        returns (
            bytes32[]
        )
    {
        return pastBets[_playerAddress];
    }

    function getCreatedBets(
        address _playerAddress
    )
        public
        view
        returns (
            bytes32[]
        )
    {
        return createdBets[_playerAddress];
    }

}


