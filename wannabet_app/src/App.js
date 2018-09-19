import React, { Component } from "react";
import {
  Accordion,
  AccordionItem,
  AccordionItemTitle,
  AccordionItemBody
} from "react-accessible-accordion";
import "react-accessible-accordion/dist/fancy-example.css";

import abi from "./abi.json";
import "./App.css";

class App extends Component {
  constructor(props) {
    super(props);

    const MyContract = window.web3.eth.contract(abi);

    this.state = {
      ContractInstance: MyContract.at(
        "0x49f820a90d3a982ad5a01ea7a304c7655fa0999e"
      ),
      _betName: "",
      _timeLimitSeconds: "",
      _player2Address: "",
      _player1Address: "",
      _vote: "",
      _value: "",
      createBetMsg: "",
      joinBetMsg: "",
      castVoteMsg: "",
      getBetMsg: "",
      cancelBetMsg: [],
      numberOfPlayerBetsMsg: [],
      getOpenBets: "",
      getOngoingBets: "",
      getPastBets: "",
      getCreatedBets: "",
      accountBalance: ""
    };

    this.handleCreateBet = this.handleCreateBet.bind(this);
    this.handleJoinBet = this.handleJoinBet.bind(this);
    this.handleCastVote = this.handleCastVote.bind(this);
    this.handleGetBet = this.handleGetBet.bind(this);
    this.handleCancelBet = this.handleCancelBet.bind(this);
    this.handleNumberOfPlayerBets = this.handleNumberOfPlayerBets.bind(this);
    this.handleGetOpenBets = this.handleGetOpenBets.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange({ target }) {
    this.setState({
      [target.name]: target.value
    });
  }

  handleCreateBet() {
    const {
      _betName,
      _timeLimitSeconds,
      _player2Address,
      ContractInstance: { createBet }
    } = this.state;
    createBet(
      _betName,
      _timeLimitSeconds,
      _player2Address,
      {
        gas: 3000000,
        from: window.web3.eth.accounts[0],
        value: window.web3.toWei(this.state._value, "finney")
      },
      (err, result) => {
        if (err) console.error("error::::", err);
        this.setState({ createBetMsg: result });
      }
    );
  }

  handleJoinBet() {
    const { joinBet } = this.state.ContractInstance;

    joinBet(
      this.state._betName,
      this.state._player1Address,
      {
        gas: 300000,
        from: window.web3.eth.accounts[0],
        value: window.web3.toWei(this.state._value, "finney")
      },
      (err, result) => {
        if (err) console.error("error::::", err);
        this.setState({ joinBetMsg: result });
      }
    );
  }

  handleCastVote() {
    const { castVote } = this.state.ContractInstance;

    castVote(this.state._betName, this.state._vote, (err, result) => {
      if (err) console.error("error::::", err);
      this.setState({ castVoteMsg: result });
    });
  }

  handleGetBet() {
    const { getBet } = this.state.ContractInstance;

    getBet(this.state._betName, (err, result) => {
      if (err) console.error("error::::", err);
      console.log("bet infos::::", result);
      this.setState({ getBetMsg: result });
    });
  }

  handleCancelBet() {
    const { cancelBet } = this.state.ContractInstance;

    cancelBet(
      this.state._betName,
      this.state._player2Address,
      (err, result) => {
        if (err) console.error("error::::", err);
        this.setState({ cancelBetMsg: "result" + result });
      }
    );
  }

  handleNumberOfPlayerBets() {
    const { getNumberOfPlayerBets } = this.state.ContractInstance;

    getNumberOfPlayerBets(this.state._playerAddress, (err, result) => {
      if (err) console.error("error::::", err);
      this.setState({ numberOfPlayerBetsMsg: result });
    });
  }

  handleGetOpenBets() {
    const { getOpenBets } = this.state.ContractInstance;

    getOpenBets(this.state._playerAddress, (err, result) => {
      if (err) console.error("error::::", err);
      this.setState({ getOpenBets: result });
    });
  }

  handleGetOngoingBets() {
    const { getOngoingBets } = this.state.ContractInstance;

    getOngoingBets(this.state._playerAddress, (err, result) => {
      if (err) console.error("error::::", err);
      this.setState({ getOngoingBets: result });
    });
  }

  handleGetPastBets() {
    const { getPastBets } = this.state.ContractInstance;

    getPastBets(this.state._playerAddress, (err, result) => {
      if (err) console.error("error::::", err);
      this.setState({ getPastBets: result });
    });
  }

  handleGetCreatedBets() {
    const { getCreatedBets } = this.state.ContractInstance;

    getCreatedBets(this.state._playerAddress, (err, result) => {
      if (err) console.error("error::::", err);
      this.setState({ getCreatedBets: result });
    });
  }

  render() {
    const {
      _betName,
      _value,
      _vote,
      _timeLimitSeconds,
      _player1Address,
      _player2Address,
      joinBetMsg,
      getBetMsg,
      castVoteMsg,
      cancelBetMsg,
      createBetMsg,
      getOpenBets,
      getOngoingBets,
      getPastBets,
      getCreatedBets,
      numberOfPlayerBetsMsg,
      accountBalance
    } = this.state;
    return (
      <div className="App">
        <img src="wannabet.png" height="200px" title="meme" alt="meme" />
        <hr />
        <h3>0x197a3b2d22896c1263e97237f2b2a090847a8357</h3>
        <h3>0x48a5a9c334ed3933305d29c2e1606d47a5789920</h3>
        <hr />
        <h3>Current User: {window.web3.eth.accounts[0]}</h3>
        <h3>Current Balance: {accountBalance}
                              {window.web3.eth.getBalance(
                                "0x197a3b2d22896c1263e97237f2b2a090847a8357", 
                                "latest", 
                                (err, resp) => {this.setState({accountBalance: resp.c[0]})}
                              )}</h3>
        <hr />
        <Accordion className="accordion">
    <AccordionItem>
            <AccordionItemTitle>
              <h3 className="u-position-relative">
                Create Bet
                <div className="accordion__arrow" role="presentation" />
              </h3>
            </AccordionItemTitle>
            <AccordionItemBody>
              <p>function createBet(string _betName, uint256 _timeLimitSeconds, address _player2Address) public payable </p>
              <input  type="text"  name="_betName"  placeholder="name of your bet..."  value={ _betName } onChange={ this.handleChange } /><br />
              <input  type="text"  name="_value"  placeholder="value to bet in finney..."  value={ _value } onChange={ this.handleChange } /><br />
              <input type="text" name="_timeLimitSeconds"  placeholder="expiry time > 1800..."  value={ _timeLimitSeconds } onChange={ this.handleChange } /><br />
              <input type="text" name="_player2Address" placeholder="player 2 address..." value={ _player2Address } onChange={ this.handleChange } /><br />
              <button value="Send" onClick={ this.handleCreateBet }> create bet </button>
              <div><a target={'_blank'} href={'https://rinkeby.etherscan.io/tx/' + createBetMsg}>{createBetMsg}</a></div>
            </AccordionItemBody>
          </AccordionItem>


          <AccordionItem>
            <AccordionItemTitle>
              <h3 className="u-position-relative">
                Join Bet
                <div className="accordion__arrow" role="presentation" />
              </h3>
            </AccordionItemTitle>
            <AccordionItemBody>
              <p>
                function joinBet(string _betName, address _player1Address)
                public payable
              </p>
              <input
                type="text"
                name="_betName"
                placeholder="name of the bet player1 created..."
                value={_betName}
                onChange={this.handleChange}
              />
              <br />
              <input
                type="text"
                name="_value"
                placeholder="value in finney..."
                value={_value}
                onChange={this.handleChange}
              />
              <br />
              <input
                type="text"
                name="_player1Address"
                placeholder="player1..."
                value={_player1Address}
                onChange={this.handleChange}
              />
              <br />
              <button value="Send" onClick={this.handleJoinBet}>
                {" "}
                join bet{" "}
              </button>
              <div>
                <a
                  target={"_blank"}
                  href={"https://rinkeby.etherscan.io/tx/" + joinBetMsg}
                >
                  {joinBetMsg}
                </a>
              </div>
              <hr />
            </AccordionItemBody>
          </AccordionItem>
          <AccordionItem>
            <AccordionItemTitle>
              <h3 className="u-position-relative">
                Cast Vote
                <div className="accordion__arrow" role="presentation" />
              </h3>
            </AccordionItemTitle>
            <AccordionItemBody>
              <h1> cast vote </h1>
              <p>
                function castVote(string _betName, uint _vote) public payable
              </p>
              <input
                type="text"
                name="_betName"
                placeholder="betname..."
                value={_betName}
                onChange={this.handleChange}
              />
              <br />
              <input
                type="text"
                name="_vote"
                placeholder="vote (1 for player1 and 2 for player2)"
                value={_vote}
                onChange={this.handleChange}
              />
              <br />
              <button value="Send" onClick={this.handleCastVote}>
                {" "}
                vote{" "}
              </button>
              <div>
                <a
                  target={"_blank"}
                  href={"https://rinkeby.etherscan.io/tx/" + castVoteMsg}
                >
                  {castVoteMsg}
                </a>
              </div>
              <hr />
            </AccordionItemBody>
          </AccordionItem>
          <AccordionItem>
            <AccordionItemTitle>
              <h3 className="u-position-relative">
                Get Bet
                <div className="accordion__arrow" role="presentation" />
              </h3>
            </AccordionItemTitle>
            <AccordionItemBody>
              <p>
                function getBet(bytes32 _betId) public view returns (string
                betName, uint256 betAmount, BetStatus betStatus, uint256
                betEndTime, BetWinner betWinner, address p1Address, address
                p2Address, uint256 p1Vote, uint256 p2Vote){" "}
              </p>
              <input
                type="text"
                name="_betName"
                placeholder="betname..."
                value={_betName}
                onChange={this.handleChange}
              />{" "}
              <br />
              <button value="Send" onClick={this.handleGetBet}>
                {" "}
                get bet{" "}
              </button>
              <table>
                <tbody>
                  <tr>
                    <td>betName</td>
                    <td>{JSON.stringify(getBetMsg[0])}</td>
                  </tr>
                  <tr>
                    <td>betAmount</td>
                    <td>{JSON.stringify(getBetMsg[1])}</td>
                  </tr>
                  <tr>
                    <td>betStatus</td>
                    <td>{JSON.stringify(getBetMsg[2])}</td>
                  </tr>
                  <tr>
                    <td>betEndTime</td>
                    <td>{JSON.stringify(getBetMsg[3])}</td>
                  </tr>
                  <tr>
                    <td>betWinner</td>
                    <td>{JSON.stringify(getBetMsg[4])}</td>
                  </tr>
                  <tr>
                    <td>player1Address</td>
                    <td>{JSON.stringify(getBetMsg[5])}</td>
                  </tr>
                  <tr>
                    <td>player2Address</td>
                    <td>{JSON.stringify(getBetMsg[6])}</td>
                  </tr>
                  <tr>
                    <td>p1Vote</td>
                    <td>{JSON.stringify(getBetMsg[7])}</td>
                  </tr>
                  <tr>
                    <td>p2Vote</td>
                    <td>{JSON.stringify(getBetMsg[8])}</td>
                  </tr>

                </tbody>
              </table>
              <hr />
            </AccordionItemBody>
          </AccordionItem>
          <AccordionItem>
            <AccordionItemTitle>
              <h3 className="u-position-relative">
                Cancel Bet
                <div className="accordion__arrow" role="presentation" />
              </h3>
            </AccordionItemTitle>
            <AccordionItemBody>
              <p>
                function cancelBet(string _betName, address _player2Address)
                public{" "}
              </p>
              <input
                type="text"
                name="_betName"
                placeholder="betname..."
                value={_betName}
                onChange={this.handleChange}
              />
              <br />
              <input
                type="text"
                name="_player2Address"
                placeholder="player2..."
                value={_player2Address}
                onChange={this.handleChange}
              />
              <br />
              <button value="Send" onClick={this.handleCancelBet}>
                {" "}
                cancel bet{" "}
              </button>
              <div>
                <a
                  target={"_blank"}
                  href={"https://rinkeby.etherscan.io/tx/" + cancelBetMsg}
                >
                  {cancelBetMsg}
                </a>
              </div>
              <hr />
            </AccordionItemBody>
          </AccordionItem>

          <AccordionItem>
            <AccordionItemTitle>
              <h3 className="u-position-relative">
                Get Number Of Player Bets
                <div className="accordion__arrow" role="presentation" />
              </h3>
            </AccordionItemTitle>
            <AccordionItemBody>
              <p>
                function getNumberOfPlayerBets(address _playerAddress) public
                view returns (uint num_createdBets, uint num_openBets, uint
                num_ongoingBets, uint num_pastBets){" "}
              </p>
              <input
                type="text"
                name="_playerAddress"
                placeholder="player address..."
                value={window.web3.eth.accounts[0]}
                onChange={this.handleChange}
              />
              <br />
              <button value="Send" onClick={this.handleNumberOfPlayerBets}>
                {" "}
                get number of player bets{" "}
              </button>
              <table>
                <tbody>

                  <tr>
                    <td>num_pastBets</td>
                    <td>{JSON.stringify(numberOfPlayerBetsMsg[3])}</td>
                  </tr>
                </tbody>
              </table>
              <hr />
            </AccordionItemBody>
          </AccordionItem>


          <AccordionItem>
            <AccordionItemTitle>
              <h3 className="u-position-relative">
                Get My Open Bets
                <div className="accordion__arrow" role="presentation" />
              </h3>
            </AccordionItemTitle>
            <AccordionItemBody>
              <p>
                function getOpenBets(address _playerAddress) public view returns
                (bytes32[])
              </p>
              <input
                type="text"
                name="_playerAddress"
                placeholder="player address..."
                value={window.web3.eth.accounts[0]}
                onChange={this.handleChange}
              />
              <br />
              <button value="Send" onClick={this.handleGetOpenBets}>
                get open bets{" "}
              </button>
              <div>{getOpenBets}</div>
              <hr />
            </AccordionItemBody>
          </AccordionItem>

          <AccordionItem>
            <AccordionItemTitle>
              <h3 className="u-position-relative">
                Get My Ongoing Bets
                <div className="accordion__arrow" role="presentation" />
              </h3>
            </AccordionItemTitle>
            <AccordionItemBody>
              <p>
                function getOngoingBets(address _playerAddress) public view returns
                (bytes32[])
              </p>
              <input
                type="text"
                name="_playerAddress"
                placeholder="player address..."
                value={window.web3.eth.accounts[0]}
                onChange={this.handleChange}
              />
              <br />
              <button value="Send" onClick={this.handleGetOngoingBets}>
                get ongoing bets{" "}
              </button>
              <div>{getOngoingBets}</div>
              <hr />
            </AccordionItemBody>
          </AccordionItem>

          <AccordionItem>
            <AccordionItemTitle>
              <h3 className="u-position-relative">
                Get My Past Bets
                <div className="accordion__arrow" role="presentation" />
              </h3>
            </AccordionItemTitle>
            <AccordionItemBody>
              <p>
                function getPastBets(address _playerAddress) public view returns
                (bytes32[])
              </p>
              <input
                type="text"
                name="_playerAddress"
                placeholder="player address..."
                value={window.web3.eth.accounts[0]}
                onChange={this.handleChange}
              />
              <br />
              <button value="Send" onClick={this.handleGetPastBets}>
                get past bets{" "}
              </button>
              <div>{getPastBets}</div>
              <hr />
            </AccordionItemBody>
          </AccordionItem>

          <AccordionItem>
            <AccordionItemTitle>
              <h3 className="u-position-relative">
                Get My Created Bets
                <div className="accordion__arrow" role="presentation" />
              </h3>
            </AccordionItemTitle>
            <AccordionItemBody>
              <p>
                function getCreatedBets(address _playerAddress) public view returns
                (bytes32[])
              </p>
              <input
                type="text"
                name="_playerAddress"
                placeholder="player address..."
                value={window.web3.eth.accounts[0]}
                onChange={this.handleChange}
              />
              <br />
              <button value="Send" onClick={this.handleGetCreatedBets}>
                get created bets{" "}
              </button>
              <div>{getCreatedBets}</div>
              <hr />
            </AccordionItemBody>
          </AccordionItem>



        </Accordion>
      </div>
    );
  }
}

export default App;
