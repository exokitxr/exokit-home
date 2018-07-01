import React, { Component } from 'react';
import classnames from 'classnames';
import * as THREE from './js/three.js';
import skin from './js/skin.js';
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
import dungeonMap from './img/Dungeon Map.svg';
import dungeonMap2 from './img/Dungeon Map_on.svg';
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

const REGISTRY_QUERY_URL = 'https://registry.webmr.io/q';

const localVector = new THREE.Vector3();
const localVector2 = new THREE.Vector3();

const _resJson = res => {
  if (res.ok) {
    return res.json();
  } else {
    return Promise.reject(new Error('invalid status code: ' + res.status));
  }
};
const _requestSkinPreview = (canvas, src) => new Promise((accept, reject) => {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
  });
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(90, 1/2, 0.1, 1024);

  const mesh = skin(THREE)({
    limbs: true,
  });
  mesh.position.set(0, -1.5/2, -1.2);
  mesh.quaternion.setFromUnitVectors(
    localVector.set(0, 0, -1),
    localVector2.set(0, 0, 1)
  );
  scene.add(mesh);

  const skinImg = new Image();
  skinImg.crossOrigin = 'Anonymous';
  skinImg.src = src;
  skinImg.onload = () => {
    mesh.setImage(skinImg);

    renderer.render(scene, camera);

    accept(canvas);
  };
  skinImg.onerror = err => {
    reject(err);
  };
});

class UrlBar extends Component {
  constructor() {
    super();

    this.state = {
      url: 'http://',
    };
  }

  render() {
    return <div style={{display: 'flex', marginRight: '2vw', backgroundColor: '#000', borderLeft: '2vw solid #29b6f6'}}>
      {/*<img src={dungeonMap} style={{width: '8vw', height: '8vw'}}/>*/}
      <input type='text' value={this.state.url} style={{display: 'flex', height: '8vw', padding: '1vw', flex: 1, backgroundColor: '#000', border: 0, color: '#FFF', fontFamily: 'inherit', fontSize: '3vw', outline: 'none'}} onChange={e => this.setState({url: e.target.value})}/>
    </div>;
  }
}

class Party extends Component {
  render() {
    return <ul>
      {this.props.servers.map((server, i) => <li key={i}>
        {server.url}
      </li>)}
    </ul>;
  }
}

const Label = ({children, width = '15vw', height = '8vw'}) => <span style={{display: 'flex', width, height, marginRight: '2vw', padding: '2vw', backgroundColor: '#000', color: '#FFF', fontSize: '3vw', fontWeight: 300, alignItems: 'center'}}>{children}</span>;

class Button extends Component {
  constructor() {
    super();

    this.state = {
      hovered: false,
    };
  }

  render() {
    return <div style={{position: 'relative', display: 'flex', margin: '0.2vw 0', marginRight: '2vw', backgroundColor: this.state.hovered ? '#EEE' : 'rgba(255, 255, 255, 0.9)'}} onMouseOver={() => this.setState({hovered: true})} onMouseOut={() => this.setState({hovered: false})} onClick={this.props.onclick}>
      <Label>{this.props.label}</Label>
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
  ['Apps', fieldMap, fieldMap2, null],
  // [player, player2],
  // [oneHandedStraghtSword, oneHandedStraghtSword2],
  ['Party', party, party2, ({props, state}) => {
    console.log('got servers', props, state);
    return <Party servers={props.servers}/>;
  }],
  ['Items', items, items2, defaultFile],
  // ['Invite', invite, invite2, defaultOptions],
  // [skills, skills2],
  // [searching, searching2],
  // [friend, friend2],
  ['Option', option, option2, defaultOptions],
  ['Help', help, help2, defaultOptions],
  ['Logout', logout, logout2, ({onlogout}) => <li className="menu-list-item" onClick={onlogout}>Log out</li>],
  // ['Calling', calling, calling2, defaultOptions],
  // [yes, yes2],
  // [no, no2],
];

class Buttons extends Component {
  constructor() {
    super();

    this.state = {
      selectedButton: -1,
    };
  }

  render() {
    if (this.state.selectedButton >= 0) {
      const button = buttons[this.state.selectedButton];
      const content = typeof button[3] === 'function' ?
        button[3]({props: this.props, state: this.state})
      :
        button[3];

      return <div style={{display: 'flex', flex: 1, flexDirection: 'column'}}>
        <Label width='auto'>
          <div style={{display: 'flex', height: '8vw', width: '8vw', margin: '-2vw', marginRight: '2vw', backgroundColor: '#29B6F6', justifyContent: 'center', alignItems: 'center'}} onClick={() => this.setState({selectedButton: -1})}>
            <div style={{marginTop: '-1vw', fontSize: '5vw'}}>‹</div>
          </div>
          <span>{button[0]}</span>
        </Label>
        {content}
      </div>
    } else {
      return <div style={{display: 'flex', flex: 1, flexDirection: 'column'}}>
        <UrlBar/>
        {buttons.map((button, i) => {
          return <Button label={button[0]} src={button[1]} onclick={() => this.setState({selectedButton: i})} key={i}>
          </Button>;
        })}
      </div>;
    }
  }
}

class App extends Component {
  constructor() {
    super();

    this.state = {
      user: null,
      // currentTab: 'URL',
      selectedButton: 0,
      servers: [],
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
          this.setState({user});
        })
        .catch(err => {
          console.warn(err.stack);
        });
    };
    _openLogin();

    const _openServers = () => {
      fetch(REGISTRY_QUERY_URL)
        .then(_resJson)
        .then(j => {
          const {xrmultiplayerHosts, xrUrls} = j;

          const newServers = [];
          return Promise.all(xrmultiplayerHosts.map(xrmpHost => {
            const prefix = xrmpHost + '/servers';

            return fetch('https://' + prefix)
              .then(_resJson)
              .then(j => {
                const {servers} = j;

                for (let i = 0; i < servers.length; i++) {
                  const server = servers[i];
                  const {name, players, objects} = server;
                  newServers.push({
                    name,
                    url: prefix + '/' + name,
                    players,
                    objects,
                  });
                }
              })
              .catch(err => {
                console.warn(err.stack);
              });
          }))
            .then(() => {
              this.setState({servers: newServers});
            });
        });
    };
    _openServers();
  }

  componentDidUpdate() {
    this._refreshSkin();
  }

  _refreshSkin() {
    if (this.state.user) {
      const canvas = this.refs.canvas;
      canvas.width = 400;
      canvas.height = 800;
      _requestSkinPreview(canvas, 'https://rawgit.com/webmixedreality/exokit-home/master/img/skins/male.png')
        .then(() => {
          console.log({
            _type: 'update',
          });
        })
        .catch(err => {
          console.warn(err);
        });
    }
  }

  render() {
    if (!this.state.user) {
      return <Modal onyes={() => this.setState({user: {}})} onno={() => this.setState({user: null})}/>;
    } else {
      return <div style={{display: 'flex', minHeight: '100vh'}}>
        <Buttons servers={this.state.servers}/>
        <div style={{display: 'flex', width: '25vw', flexDirection: 'column'}}>
          <Label width='100%'>Avaer Kazmer</Label>
          <canvas width={400} height={800} style={{width: 'calc(25vw/2)', height: 'calc(25vw*2/2)', backgroundColor: 'rgba(255, 255, 255, 0.8)'}} ref='canvas'/>
        </div>
      </div>;
    }
  }
}

export default App;
