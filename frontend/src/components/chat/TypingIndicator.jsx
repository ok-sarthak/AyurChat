import React from 'react'
import { Leaf } from 'lucide-react'

const TypingIndicator = () => {
  return (
    <div className="flex justify-start">
      <div className="flex max-w-[80%] space-x-3">
        {/* Avatar */}
        <div className="flex-shrink-0">
          <div className="w-8 h-8 rounded-full flex items-center justify-center bg-gradient-to-br from-green-400 to-green-600 text-white">
            <Leaf size={16} />
          </div>
        </div>

        {/* Typing Animation */}
        <div className="glass text-white rounded-2xl rounded-bl-md border border-white/20 px-4 py-3">
          <div className="flex items-center space-x-1">
            <div className="text-sm text-white/80 mr-2">AI is thinking</div>
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-white/60 rounded-full typing-dot"></div>
              <div className="w-2 h-2 bg-white/60 rounded-full typing-dot"></div>
              <div className="w-2 h-2 bg-white/60 rounded-full typing-dot"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TypingIndicator
