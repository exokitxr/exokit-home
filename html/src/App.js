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
  [fieldMap, fieldMap2, ['Options', 'Help', 'Logout']],
  // [player, player2],
  // [oneHandedStraghtSword, oneHandedStraghtSword2],
  [items, items2, ['Options', 'Help', 'Logout']],
  [invite, invite2, ['Options', 'Help', 'Logout']],
  // [skills, skills2],
  // [searching, searching2],
  // [friend, friend2],
  [party, party2, ['Options', 'Help', 'Logout']],
  [option, option2, ['Options', 'Help', 'Logout']],
  [help, help2, ['Options', 'Help', 'Logout']],
  [logout, logout2, ['Options', 'Help', 'Logout']],
  [calling, calling2, ['Options', 'Help', 'Logout']],
  // [yes, yes2],
  // [no, no2],
];

const Tab = ({name, selected, onclick}) =>
  <a
    className={classnames('tab', 'url', selected ? 'selected' : null)}
    style={{display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '30px', flex: 1}}
    onClick={onclick}>
      {name}
  </a>;

class Button extends Component {
  constructor() {
    super();
  }

  render() {
    return <div style={{display: 'flex'}}>
      <img
        src={this.props.src}
        style={{padding: '10px 0'}}
        onClick={this.props.onclick}/>
      {this.props.children}
      {this.props.selected ? <div className="menu">
        <ul className="menu-list">
          <li className="menu-list-item">Options</li>
          <li className="menu-list-item">Help</li>
          <li className="menu-list-item">Logout</li>
        </ul>
      </div> : null}
    </div>
  }
}

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
          {/*['URL', 'Apps', 'Files', 'Party', 'Config'].map(t => <Tab name={t} selected={this.state.currentTab === t} onclick={() => this.setState({currentTab: t})} key={t}/>)*/}
        </div>
        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
          <input className='text-input' type='text' value={this.state.url} onChange={e => this.setState({url: e.target.value})}/>
          {buttons.map((button, i) => {
            const menu = this.props.selected ? <div className="menu">
              <ul className="menu-list">
                {button[2].map((option, i) => <li className="menu-list-item" key={i}>Options</li>)}
              </ul>
            </div> : null;
            if (this.state.selectedButton !== i) {
              return <Button src={button[0]} onclick={() => this.setState({selectedButton: i})} selected={false} key={i}>
                {menu}
              </Button>;
            } else {
              return <Button src={button[1]} onclick={() => this.setState({selectedButton: -1})} selected={true} key={i}>
                {menu}
              </Button>;
            }
          })}
        </div>
      </div>
    );
  }
}

export default App;
