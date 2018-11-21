import { ChatManager, TokenProvider } from '@pusher/chatkit-client'

const credentials = {
  url: (accessToken) =>
    // `https://chatkit-demo-server.herokuapp.com/token?token=${authToken}`,
    `http://localhost:4000/token?token=${accessToken}`,
  instanceLocator: 'v1:us1:de629ea3-2b82-46db-9380-906ef165c1db',
}

const { instanceLocator, url } = credentials
export default ({ state, actions }, { id, accessToken }) => {   
  new ChatManager({
    tokenProvider: new TokenProvider({ url: url(accessToken) }),
    instanceLocator,
    userId: id,
  })
    .connect({
      onUserStartedTyping: actions.isTyping,
      onUserStoppedTyping: actions.notTyping,
      onAddedToRoom: actions.subscribeToRoom,
      onRemovedFromRoom: actions.removeRoom,
      onUserCameOnline: actions.setUserPresence,
      onUserWentOffline: actions.setUserPresence,
    })
    .then(user => {
      // Subscribe to all rooms the user is a member of
      Promise.all(
        user.rooms.map(room =>
          user.subscribeToRoom({
            roomId: room.id,
            hooks: { onNewMessage: actions.addMessage },
          })
        )
      ).then(rooms => {
        actions.setUser(user)
        // Join the first room in the users room list
        user.rooms.length > 0 && actions.joinRoom(user.rooms[0])
      })
    })
    .catch(error => console.log('Error on connection', error))

  }