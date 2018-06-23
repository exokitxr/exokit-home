import React, { Component } from 'react';
import classnames from 'classnames';
import './App.css';

const Tab = ({name, selected, onclick}) => <a className={classnames('tab', 'url', selected ? 'selected' : null)} style={{display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '30px', flex: 1}} onClick={onclick}>{name}</a>;

class App extends Component {
  constructor() {
    super();

    this.state = {
      currentTab: 'URL',
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
        <div>
          <input className='text-input' type='text' value={this.state.url} onChange={e => this.setState({url: e.target.value})}/>
        </div>
      </div>
    );
  }
}

export default App;
