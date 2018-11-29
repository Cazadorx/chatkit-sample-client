import React from 'react'
import style from './index.module.css'
import Linkify from 'react-linkify'

const time = string => {
  const date = new Date(string)
  const minutes = date.getMinutes()
  return `${date.getHours()}:${minutes < 10 ? '0' + minutes : minutes}`
}

class Attachment extends React.Component {
  render() {
    if(this.props.type === 'image'){
      return  <img controls={true} src={this.props.link} alt={this.props.name} />
    }
    if(this.props.type === 'video'){
      return <video controls={true} src={this.props.link} />
    }
    if(this.props.type === 'audio'){
      return <audio controls={true} src={this.props.link} />
    }
    return <a href={this.props.link} download>Download File</a>
  }
}

export const Message = ({ user, createConvo }) => message =>
  message.sender ? (
    <li key={message.id} className={style.component}>
      <img
        onClick={e => createConvo({ user: message.sender })}
        src={message.sender.avatarURL}
        alt={message.sender.name}
      />
      <div>
        <span
          className={
            message.sender.id === user.id ||
            (message.sender.presence &&
              message.sender.presence.state === 'online')
              ? style.online
              : null
          }
        >{`${message.sender.name} | ${time(message.createdAt)}`}</span>
        <p>
          <Linkify properties={{ target: '_blank' }}>{message.text}</Linkify>
        </p>
        {message.attachment ? (
          <Attachment
            link={message.attachment.link}
            type={message.attachment.type}
            name={message.attachment.name}
          />
        ) : null}
      </div>
    </li>
  ) : null
