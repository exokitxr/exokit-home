import React, { Component } from 'react';
import classnames from 'classnames';
import './App.css';

import player from './img/Player.svg';
import player2 from './img/Player_on.svg';
import oneHandedStraghtSword from './img/One-Handed Straight Sword.svg';
import oneHandedStraghtSword2 from './img/One-Handed Straight Sword_on.svg';
import items from './img/Items.svg';
import items2 from './img/Items_on.svg';
// import equipment from './img/Equipment.svg';
import fieldMap from './img/Field Map & Position Check.svg';
import fieldMap2 from './img/Field Map & Position Check_on.svg';
import invite from './img/Invite.svg';
import invite2 from './img/Invite_on.svg';
import skills from './img/Skills.svg';
import skills2 from './img/Skills_on.svg';
import searching from './img/Searching.svg';
import searching2 from './img/Searching_on.svg';
import friend from './img/Friend.svg';
import friend2 from './img/Friend_on.svg';
import party from './img/Party & Profile.svg';
import party2 from './img/Party & Profile_on.svg';
import option from './img/Option.svg';
import option2 from './img/Option_on.svg';
import help from './img/Help & Unknown.svg';
import help2 from './img/Help & Unknown_on.svg';
import logout from './img/Logout.svg';
import logout2 from './img/Logout_on.svg';
import calling from './img/Calling.svg';
import calling2 from './img/Calling_on.svg';
import yes from './img/Yes.svg';
import yes2 from './img/Yes_on.svg';
import no from './img/No.svg';
import no2 from './img/No_on.svg';

const buttons = [
  [fieldMap, fieldMap2],
  // [player, player2],
  // [oneHandedStraghtSword, oneHandedStraghtSword2],
  [items, items2],
  [invite, invite2],
  // [skills, skills2],
  // [searching, searching2],
  // [friend, friend2],
  [party, party2],
  [option, option2],
  [help, help2],
  [logout, logout2],
  [calling, calling2],
  // [yes, yes2],
  // [no, no2],
];

const Tab = ({name, selected, onclick}) => <a className={classnames('tab', 'url', selected ? 'selected' : null)} style={{display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '30px', flex: 1}} onClick={onclick}>{name}</a>;

class App extends Component {
  constructor() {
    super();

    this.state = {
      currentTab: 'URL',
      selectedButton: 0,
      url: 'http://',
    };
  }

  componentDidMount() {
    function getParameterByName(url, name) {
      name = name.replace(/[[\]]/g, "\\$&");
      const regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
      if (!results) return null;
      if (!results[2]) return '';
      return decodeURIComponent(results[2].replace(/\+/g, " "));
    }
    function render() {
      const t = getParameterByName(window.location.href, 't');
      if (t) {
        const tabEl = document.querySelector('.tab.' + t);
        tabEl.classList.add('selected');
      }
    }

    if (document.readyState === 'complete') {
      render();
    }
    document.addEventListener('readystatechange', function() {
      if (document.readyState === 'complete') {
        render();
      }
    });
  }

  render() {
    return (
      <div>
        <div style={{display: 'flex', justifyContent: 'stretch', backgroundColor: '#CCC', color: '#808080'}}>
          {['URL', 'Apps', 'Files', 'Party', 'Config'].map(t => <Tab name={t} selected={this.state.currentTab === t} onclick={() => this.setState({currentTab: t})} key={t}/>)}
        </div>
        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
          <input className='text-input' type='text' value={this.state.url} onChange={e => this.setState({url: e.target.value})}/>
          {buttons.map((button, i) => {
            if (this.state.selectedButton !== i) {
              return <img src={button[0]} style={{padding: '10px 0'}} onClick={() => this.setState({selectedButton: i})} key={i}/>
            } else {
              return <img src={button[1]} style={{padding: '10px 0'}} onClick={() => this.setState({selectedButton: -1})} key={i}/>
            }
          })}
        </div>
      </div>
    );
  }
}

export default App;
