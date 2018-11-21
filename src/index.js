import React from 'react'
import ReactDOM from 'react-dom'
import { set, del } from 'object-path-immutable'
import { version } from '../package.json'
import './index.css'

import { UserHeader } from './components/UserHeader'
import { UserList } from './components/UserList'
import { MessageList } from './components/MessageList'
import { TypingIndicator } from './components/TypingIndicator'
import { CreateMessageForm } from './components/CreateMessageForm'
import { RoomList } from './components/RoomList'
import { RoomHeader } from './components/RoomHeader'
import { CreateRoomForm } from './components/CreateRoomForm'
import { WelcomeScreen } from './components/WelcomeScreen'
import { JoinRoomScreen } from './components/JoinRoomScreen'

import ChatManager from './chatkit'

import Auth from './auth/auth'
import { Route, Router } from 'react-router-dom'
import history from './history'
import loading from '../public/loading.svg'

// --------------------------------------
// Application
// --------------------------------------

class Main extends React.Component {
  state = {
    user: {},
    room: {},
    messages: {},
    typing: {},
    sidebarOpen: false,
    userListOpen: window.innerWidth > 1000,
  }

  actions = {
    // --------------------------------------
    // UI
    // --------------------------------------

    setSidebar: sidebarOpen => this.setState({ sidebarOpen }),
    setUserList: userListOpen => this.setState({ userListOpen }),

    // --------------------------------------
    // User
    // --------------------------------------

    setUser: user => this.setState({ user }),

    // --------------------------------------
    // Room
    // --------------------------------------

    setRoom: room => {
      this.setState({ room, sidebarOpen: false })
      this.actions.scrollToEnd()
    },

    removeRoom: room => this.setState({ room: {} }),

    joinRoom: room => {
      this.actions.setRoom(room)
      this.actions.subscribeToRoom(room)
      this.state.messages[room.id] &&
        this.actions.setCursor(
          room.id,
          Object.keys(this.state.messages[room.id]).pop()
        )
    },

    subscribeToRoom: room =>
      !this.state.user.roomSubscriptions[room.id] &&
      this.state.user.subscribeToRoom({
        roomId: room.id,
        hooks: { onNewMessage: this.actions.addMessage },
      }),

    createRoom: options =>
      this.state.user.createRoom(options).then(this.actions.joinRoom),

    createConvo: options => {
      if (options.user.id !== this.state.user.id) {
        const exists = this.state.user.rooms.find(
          x =>
            x.name === options.user.id + this.state.user.id ||
            x.name === this.state.user.id + options.user.id
        )
        exists
          ? this.actions.joinRoom(exists)
          : this.actions.createRoom({
              name: this.state.user.id + options.user.id,
              addUserIds: [options.user.id],
              private: true,
            })
      }
    },

    addUserToRoom: ({ userId, roomId = this.state.room.id }) =>
      this.state.user
        .addUserToRoom({ userId, roomId })
        .then(this.actions.setRoom),

    removeUserFromRoom: ({ userId, roomId = this.state.room.id }) =>
      userId === this.state.user.id
        ? this.state.user.leaveRoom({ roomId })
        : this.state.user
            .removeUserFromRoom({ userId, roomId })
            .then(this.actions.setRoom),

    // --------------------------------------
    // Cursors
    // --------------------------------------

    setCursor: (roomId, position) =>
      this.state.user
        .setReadCursor({ roomId, position: parseInt(position) })
        .then(x => this.forceUpdate()),

    // --------------------------------------
    // Messages
    // --------------------------------------

    addMessage: payload => {
      const roomId = payload.room.id
      const messageId = payload.id
      // Update local message cache with new message
      this.setState(set(this.state, ['messages', roomId, messageId], payload))
      // Update cursor if the message was read
      if (roomId === this.state.room.id) {
        const cursor = this.state.user.readCursor({ roomId }) || {}
        const cursorPosition = cursor.position || 0
        cursorPosition < messageId && this.actions.setCursor(roomId, messageId)
        this.actions.scrollToEnd()
      }
      // Send notification
      this.actions.showNotification(payload)
    },

    runCommand: command => {
      const commands = {
        invite: ([userId]) => this.actions.addUserToRoom({ userId }),
        remove: ([userId]) => this.actions.removeUserFromRoom({ userId }),
        leave: ([userId]) =>
          this.actions.removeUserFromRoom({ userId: this.state.user.id }),
      }
      const name = command.split(' ')[0]
      const args = command.split(' ').slice(1)
      const exec = commands[name]
      exec && exec(args).catch(console.log)
    },

    scrollToEnd: e =>
      setTimeout(() => {
        const elem = document.querySelector('#messages')
        elem && (elem.scrollTop = 100000)
      }, 0),

    // --------------------------------------
    // Typing Indicators
    // --------------------------------------

    isTyping: (room, user) =>
      this.setState(set(this.state, ['typing', room.id, user.id], true)),

    notTyping: (room, user) =>
      this.setState(del(this.state, ['typing', room.id, user.id])),

    // --------------------------------------
    // Presence
    // --------------------------------------

    setUserPresence: () => this.forceUpdate(),

    // --------------------------------------
    // Notifications
    // --------------------------------------

    showNotification: message => {
      if (
        'Notification' in window &&
        this.state.user.id &&
        this.state.user.id !== message.senderId &&
        document.visibilityState === 'hidden'
      ) {
        const notification = new Notification(
          `New Message from ${message.sender.id}`,
          {
            body: message.text,
            icon: message.sender.avatarURL,
          }
        )
        notification.addEventListener('click', e => {
          this.actions.joinRoom(message.room)
          window.focus()
        })
      }
    },
  }

  componentDidMount() {

    if(auth.isAuthenticated){

      'Notification' in window && Notification.requestPermission()
    
      let userId = localStorage.getItem('chatkit_user')

      let existingUser = { 
        id: userId, 
        accessToken: localStorage.getItem('access_token') 
      }

      fetch('http://localhost:4000/user', {
        method: 'POST',
        body: JSON.stringify(existingUser)
      }).then(
        existingUserId => {
          console.log("Existing user")
          console.log(existingUser)
          ChatManager(this, existingUser)
        }
      )
    }
  }

  render() {
    const {
      user,
      room,
      messages,
      typing,
      sidebarOpen,
      userListOpen,
    } = this.state
    const { createRoom, createConvo, removeUserFromRoom } = this.actions

    console.log(`Authenticated: ${auth.isAuthenticated()}`)
    if(!auth.isAuthenticated()) this.props.auth.login()

    return (
      <main>
        <aside data-open={sidebarOpen}>
          <UserHeader user={user} />
          <RoomList
            user={user}
            rooms={user.rooms}
            messages={messages}
            typing={typing}
            current={room}
            actions={this.actions}
          />
          {user.id && <CreateRoomForm submit={createRoom} />}
        </aside>
        <section>
          <RoomHeader state={this.state} actions={this.actions} />
          {room.id ? (
            <row->
              <col->
                <MessageList
                  user={user}
                  messages={messages[room.id]}
                  createConvo={createConvo}
                />
                <TypingIndicator typing={typing[room.id]} />
                <CreateMessageForm state={this.state} actions={this.actions} />
              </col->
              {userListOpen && (
                <UserList
                  room={room}
                  current={user.id}
                  createConvo={createConvo}
                  removeUser={removeUserFromRoom}
                />
              )}
            </row->
          ) : user.id ? (
            <JoinRoomScreen />
          ) : (
            <WelcomeScreen />
          )}
        </section>
      </main>
    )
  }
}

class Callback extends  React.Component {

  render() {
    const style = {
      position: 'absolute',
      display: 'flex',
      justifyContent: 'center',
      height: '100vh',
      width: '100vw',
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: 'white',

    }
    return (
      <div style={style}>
        <img src={loading} alt="loading"/>
      </div>
    );
  }

  componentDidMount() {
    handleAuthentication(
      this.props, 
      (accessToken, userId) => {
        history.replace('/')
      });
  }

}
// --------------------------------------
// Authentication
// --------------------------------------

const auth = new Auth()

const handleAuthentication = ({location}, callback) => {
  if (/access_token|id_token|error/.test(location.hash)) {
    auth.handleAuthentication(callback);
  }
}

export const makeMainRoutes = () => {
  return (
    <Router history={history}>
        <div>
          <Route path="/" render={(props) => <Main auth={auth} {...props} />} />
          <Route 
            path="/callback" 
            render={(props) => {            
              return <Callback 
                {...props} /> 
          }}/>
        </div>
    </Router>
  )
}

const routes = makeMainRoutes();
ReactDOM.render(
  routes,
  document.getElementById('root')
);

















//Auth0:

// xauth.login();

// window.localStorage.getItem('chatkit-user') && 
//   !window.localStorage.getItem('chatkit-user').match(version) &&
//   window.localStorage.clear()

// // const server = 'https://chatkit-demo-server.herokuapp.com'
// const server = 'http://localhost:4000'
// const redirect = `${server}/success?url=${window.location.href.split('?')[0]}`

// console.log(redirect)

// let nonce = 12345

// const auth = new auth0.WebAuth({
//   domain: 'react-slack-clone-demo.eu.auth0.com',
//   clientID: 'qmpmOyWVfoUXn1gr2vfSqE6TZm0lpXHp',
//   redirectURI: redirect,
//   // responseType: 'token id_token',
//   responseType: "code",
//   scope: 'openid email',
// })

// console.log(auth)
// console.log("yeehaw")

// const params = new URLSearchParams(window.location.search.slice(1))
// const authCode = params.get('code')
// const existingUser = window.localStorage.getItem('chatkit-user')

// console.log("Fuck all");
// let jebote = 4
// console.log(jebote)


// !existingUser && !authCode
//   ? auth.authorize()
//   : ReactDOM.render(<View />, document.querySelector('#root'))
  
   


//Github:

// window.localStorage.getItem('chatkit-user') &&
//   !window.localStorage.getItem('chatkit-user').match(version) &&
//   window.localStorage.clear()

// const params = new URLSearchParams(window.location.search.slice(1))
// const authCode = params.get('code')
// const existingUser = window.localStorage.getItem('chatkit-user')

// const githubAuthRedirect = () => {
//   const client = '20cdd317000f92af12fe'
//   const url = 'https://github.com/login/oauth/authorize'
//   const server = 'https://chatkit-demo-server.herokuapp.com'
//   const redirect = `${server}/success?url=${window.location.href.split('?')[0]}`
//   window.location = `${url}?scope=user:email&client_id=${client}&redirect_uri=${redirect}`
// }

// !existingUser && !authCode
//   ? githubAuthRedirect()
//   : ReactDOM.render(<View />, document.querySelector('#root'))




      // : fetch('https://chatkit-demo-server.herokuapp.com/auth', {
      //     method: 'POST',
      //     body: JSON.stringify({ code: authCode }),
      //   })
      //     .then(res => res.json())
      //     .then(user => {
      //       user.version = version
      //       window.localStorage.setItem('chatkit-user', JSON.stringify(user))
      //       window.history.replaceState(null, null, window.location.pathname)
      //       ChatManager(this, user)
      //     })