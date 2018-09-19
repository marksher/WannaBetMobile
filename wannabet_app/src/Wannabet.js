import React, { Component } from 'react';

import abi from './wannabet.json';

class Wannabet extends Component {
  constructor (props) {
    super (props);

    const MyContract = window.web3.eth.contract(abi);

    this.state = {
      ContractInstance : MyContract.at('0x0cb4745c09ea890f880b50348fede345c69a3750'),
      contractState : ''
    }

    this.querySecret = this.querySecret.bind (this);
    this.queryContractState = this.queryContractState.bind (this);
    this.handleContractStateSubmit = this.handleContractStateSubmit.bind (this);
    this.queryConditionResult = this.queryConditionResult.bind (this);
    this.activateExperiment = this.activateExperiment.bind (this);
    this.state.event = this.state.ContractInstance.ExperimentComplete()
  }

  querySecret() {
    const { getSecret } = this.state.ContractInstance;

    getSecret ((err, secret) => {
      if (err) console.error ('an error::::', err);
      console.log('this is the secret::::', secret);
    })
  }

  queryContractState() {
    const { getState } = this.state.ContractInstance;

    getState ((err, state) => {
      if (err) console.error ('error::::', err);
      console.log ('contract state::::', state)
    })
  }

  handleContractStateSubmit (event) {
    event.preventDefault();

    const { setState } = this.state.ContractInstance;
    const { contractState : newState } = this.state;

    setState (
      newState,
      {
        gas: 300000,
        from: window.web3.eth.accounts[0],
        value: window.web3.toWei( 0.01, 'ether')
      }, (err, result) => {
        console.log('smart contracted changing')
      })
  }

  queryConditionResult () {
    const { pseudoRandomResult } = this.state.ContractInstance;

    pseudoRandomResult ((err, result ) => {
      console.log('this is the smart contract conditional::::', result)
      console.log ('addy::::', window.web3.eth.accounts[0]);
    })
  }

  activateExperiment () {
    const { setExperimentInMotion } = this.state.ContractInstance;

    setExperimentInMotion ({
      gas: 300000,
      from: window.web3.eth.accounts[0],
      value: window.web3.toWei (.01, 'ether')
    }, ( err, result ) => {
      console.log ('experiment started');
      console.log ('addy::::', window.web3.eth.accounts[0]);
    })
  }

  render () {
    this.state.event.watch ((err, event) => {
      if (err) console.error ('error::::', err);
      console.log('event::::', event);
      console.log('result::::', event.args.result);
    })
    return (
      <div className="App">
        <header>fuck off</header>
        <br />
        <br />
        <button onClick={ this.querySecret }> querySecret value </button>
        <br />
        <button onClick={ this.queryContractState }> queryContractState value </button>
        <br />
        <form onSubmit={ this.handleContractStateSubmit }>
          <input
            type = "text"
            name = "state-change"
            placeholder = "enter new state"
            value = { this.state.contractState }
            onChange = { event => this.setState ({ contractState : event.target.value}) } />
          <button type="submit"> submit </button>
        </form>
        <br />
        <button onClick={ this.queryConditionResult }> query conditional resutl </button>
        <br />
        <button onClick={ this.activateExperiment }> start experiment </button>
      </div>
    );
  }
}


export default App;