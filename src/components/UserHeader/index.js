import React from 'react'
import style from './index.module.css'
import { Link } from 'react-router-dom';
import {logout} from '/src/auth/'

const placeholder =
  'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'

export const UserHeader = ({ user = {} }) => (
  <header className={style.component}>
    <img src={user.avatarURL || placeholder} alt={user.name} />
    <div>
      <h3>{user.name}</h3>
      <h5>{user.id && `${user.id}`}</h5>

<button
                onClick={() => auth.logout()}
                className="btn btn-light"
              >
                Log Out
              </button> 
</div>

  </header>
)
