import React, { Component } from 'react';
import classnames from 'classnames';
import './js/xrid.js';

import './App.css';
import './css/experiments.css';

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

import stick from './img/items/stick.png';

/* const Tab = ({name, selected, onclick}) =>
  <a
    className={classnames('tab', 'url', selected ? 'selected' : null)}
    style={{display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '30px', flex: 1}}
    onClick={onclick}>
      {name}
  </a>; */

class UrlBar extends Component {
  constructor() {
    super();

    this.state = {
      url: 'http://',
    };
  }

  render() {
    return <input className='text-input' type='text' value={this.state.url} onChange={e => this.setState({url: e.target.value})}/>;
  }
}

class Button extends Component {
  constructor() {
    super();

    this.state = {
      hovered: false,
    };
  }

  render() {
    console.log('render', this.state.hovered);

    return <div style={{position: 'relative', display: 'flex', margin: '0.2vw 0', backgroundColor: this.state.hovered ? '#EEE' : '#FFF'}} onMouseOver={() => this.setState({hovered: true})} onMouseOut={() => this.setState({hovered: false})} onClick={this.props.onclick}>
      <span style={{display: 'flex', width: '15vw', height: '8vw', marginRight: '2vw', padding: '2vw', backgroundColor: '#000', color: '#FFF', fontSize: '4vw', fontWeight: 300, alignItems: 'center'}}>{this.props.label}</span>
      <img
        src={this.props.src}
        style={{width: '8vw', height: '8vw'}}
      />
      {this.props.children}
    </div>
  }
}

class Modal extends Component {
  render() {
    return <div className="experimentSAOModalRoot">
      <div data-keyboard="false" data-backdrop="static" id="SAOModal" role="dialog" aria-labelledby="SAOModalLabel" aria-hidden="true">
        <div className="modal-dialog open" role="document">
          <div className="modal-content">
            <div className="modal-header text-xs-center">
              <h4 className="modal-title" id="SAOModalTitle">Log in</h4>
            </div>
            <div className="modal-body text-xs-center p-x-3">
              <div id="SAOModalBody" className='modal-body-heading'>Wanna log in?</div>
              <input type='text' placeholder='your@email.com'/>
              <input type='password' placeholder='Password'/>
            </div>
            <div className="modal-footer container-fluid p-y-2">
              <div className="row btnrow">
                <div className="col-xs-6 c-hcenter text-xs-center btnholder" id="SAOModalAccept">
                  <nav onClick={this.props.onyes}>
                    <img className='btn' src={yes} />
                  </nav>
                </div>
                <div className="col-xs-6 c-hcenter text-xs-center btnholder" id="SAOModalDeny">
                  <nav onClick={this.props.onno}>
                    <img className='btn' src={no}/>
                  </nav>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>;
  }
}

const defaultOptions = ['Options', 'Help', 'Logout'].map((option, i) => <li className="menu-list-item" key={i}>{option}</li>);
const defaultFile = ['Apple', 'Carrot', 'Stick'].map((file, i) =>
  <li className="menu-list-item" key={i}>
    <div className='file'>
      <img src={stick}/>
      <div>{file}</div>
    </div>
  </li>
);
const buttons = [
  ['Map', fieldMap, fieldMap2, <UrlBar/>],
  // [player, player2],
  // [oneHandedStraghtSword, oneHandedStraghtSword2],
  ['Items', items, items2, defaultFile],
  ['Invite', invite, invite2, defaultOptions],
  // [skills, skills2],
  // [searching, searching2],
  // [friend, friend2],
  ['Party', party, party2, defaultOptions],
  ['Option', option, option2, defaultOptions],
  ['Help', help, help2, defaultOptions],
  ['Logout', logout, logout2, ({onlogout}) => <li className="menu-list-item" onClick={onlogout}>Log out</li>],
  ['Calling', calling, calling2, defaultOptions],
  // [yes, yes2],
  // [no, no2],
];

class App extends Component {
  constructor() {
    super();

    this.state = {
      user: null,
      // currentTab: 'URL',
      selectedButton: 0,
    };
  }

  componentDidMount() {
    /* function getParameterByName(url, name) {
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
    }); */

    const xrid = new window.XRID('https://id.webmr.io');
    const _openLogin = () => { // XXX
      xrid.login({
        username: 'lol@lol.zol',
        password: 'zol',
      })
        .then(user => {
          this.setState({user})

          console.log('log in', user);
        })
        .catch(err => {
          console.warn(err.stack);
        });
    };
    _openLogin();
  }

  render() {
    return (
      <div>
        <div style={{display: 'flex', justifyContent: 'stretch', backgroundColor: '#CCC', color: '#808080'}}>
          {/*['URL', 'Apps', 'Files', 'Party', 'Config'].map(t => <Tab name={t} selected={this.state.currentTab === t} onclick={() => this.setState({currentTab: t})} key={t}/>)*/}
        </div>
        <div style={{display: 'flex', flexDirection: 'column'}}>
          {!this.state.user ? <Modal onyes={() => this.setState({user: {}})} onno={() => this.setState({user: null})}/> : null}
          {this.state.user ? buttons.map((button, i) => {
            const selected = this.state.selectedButton === i;
            const opts = typeof button[3] === 'function' ? button[3]({onlogout: () => this.setState({selectedButton: -1, user: null})}) : button[3];
            const menu = selected ? <div className={classnames('menu',
              (i === 0) ?
                'top'
              : (
                (i % 2) === 1 ? 'left' : 'right'
              )
            )}>
              <ul className="menu-list">
                {opts}
              </ul>
            </div> : null;
            if (!selected) {
              return <Button label={button[0]} src={button[1]} onclick={() => this.setState({selectedButton: i})} selected={selected} key={i}>
                {menu}
              </Button>;
            } else {
              return <Button label={button[0]} src={button[2]} onclick={() => this.setState({selectedButton: -1})} selected={selected} key={i}>
                {menu}
              </Button>;
            }
          }) : null}
        </div>
      </div>
    );
  }
}

export default App;
