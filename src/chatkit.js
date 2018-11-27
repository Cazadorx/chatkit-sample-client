import { ChatManager, TokenProvider } from '@pusher/chatkit-client'

const credentials = {
  url: (accessToken) =>
    `https://zmarkan-chatkit-sample-server.glitch.me/token?token=${accessToken}`,
  instanceLocator: 'v1:us1:7954c374-f491-4c08-b71e-5abfc0a3dc89',
}

const { instanceLocator, url } = credentials
export default ({ state, actions }, { id, accessToken }) => {   

  console.log(`id: ${id}`)
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

      console.log(user)
      
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