import React from 'react'
import { User, Leaf } from 'lucide-react'

const MessageBubble = ({ message, isUser }) => {
  const formatTime = (timestamp) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const formatMessage = (content) => {
    // Simple markdown-like formatting for better readability
    return content
      .split('\n')
      .map((line, index) => (
        <div key={index} className={index > 0 ? 'mt-2' : ''}>
          {line}
        </div>
      ))
  }

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} message-enter`}>
      <div className={`flex max-w-[80%] ${isUser ? 'flex-row-reverse' : 'flex-row'} space-x-3`}>
        {/* Avatar */}
        <div className={`flex-shrink-0 ${isUser ? 'ml-3' : 'mr-3'}`}>
          <div className={`
            w-8 h-8 rounded-full flex items-center justify-center
            ${isUser 
              ? 'bg-white text-gray-800' 
              : 'bg-gradient-to-br from-green-400 to-green-600 text-white'
            }
          `}>
            {isUser ? <User size={16} /> : <Leaf size={16} />}
          </div>
        </div>

        {/* Message Content */}
        <div className={`
          flex flex-col space-y-1
          ${isUser ? 'items-end' : 'items-start'}
        `}>
          <div className={`
            px-4 py-3 rounded-2xl max-w-full
            ${isUser 
              ? 'bg-white text-gray-800 rounded-br-md' 
              : 'glass text-white rounded-bl-md border border-white/20'
            }
          `}>
            <div className="text-sm leading-relaxed whitespace-pre-wrap">
              {formatMessage(message.content)}
            </div>
          </div>
          
          {/* Timestamp */}
          <div className={`
            text-xs text-white/50 px-2
            ${isUser ? 'text-right' : 'text-left'}
          `}>
            {formatTime(message.timestamp)}
          </div>
        </div>
      </div>
    </div>
  )
}

export default MessageBubble
