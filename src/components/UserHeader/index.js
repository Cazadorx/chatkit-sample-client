import React from 'react'
import style from './index.module.css'
import { Link } from 'react-router-dom';

const placeholder =
  'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'

export const UserHeader = ({ user = {} }) => (
  <header className={style.component}>
    <img src={user.avatarURL || placeholder} alt={user.name} />
    <div>
      <h3>{user.name}</h3>
      <h5>{user.id && `${user.id}`}</h5>

class Toggle extends React.Component {
  constructor(props) {
    super(props);
    this.state = {isToggleOn: true};

    // This binding is necessary to make `this` work in the callback
    this.handleClick = this.handleClick.bind(this);
  }

  handleClick() {
    this.setState(state => ({
      isToggleOn: !state.isToggleOn
    }));
  }

  render() {
    return (
      <button onClick={this.handleClick}>
        {this.state.isToggleOn ? 'ON' : 'OFF'}
      </button>
    );
  }
}

ReactDOM.render(
  <Toggle />,
  document.getElementById('root')
);
    
</div>

  </header>
)
