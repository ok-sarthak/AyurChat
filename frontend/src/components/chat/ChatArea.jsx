import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Send, Menu, Leaf, Sparkles } from 'lucide-react'
import api from '../../utils/api'
import TypingIndicator from './TypingIndicator'

// Utility function to format text with markdown-like formatting
const formatMessage = (text) => {
  if (!text) return text

  // Handle bold text (**text** or __text__)
  text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
  text = text.replace(/__(.*?)__/g, '<strong>$1</strong>')
  
  // Handle italic text (*text* or _text_)
  text = text.replace(/\*(.*?)\*/g, '<em>$1</em>')
  text = text.replace(/_(.*?)_/g, '<em>$1</em>')
  
  // Handle code blocks (`text`)
  text = text.replace(/`(.*?)`/g, '<code class="bg-black/20 px-1 py-0.5 rounded text-sm">$1</code>')
  
  // Handle line breaks
  text = text.replace(/\n/g, '<br>')
  
  return text
}

// Utility function to format timestamp
const formatTime = (timestamp) => {
  const date = new Date(timestamp)
  const now = new Date()
  const diffInMinutes = Math.floor((now - date) / (1000 * 60))
  
  if (diffInMinutes < 1) return 'now'
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`
  if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
  
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

const ChatArea = ({
  activeChat,
  setActiveChat,
  createNewChat,
  updateChatTitle,
  isSidebarOpen,
  setIsSidebarOpen,
}) => {
  const [messages, setMessages] = useState([])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [ayurvedicPrompts, setAyurvedicPrompts] = useState([])
  const [isLoadingPrompts, setIsLoadingPrompts] = useState(false)

  const messagesEndRef = useRef(null)
  const textareaRef = useRef(null)
  const activeChatIdRef = useRef(null)

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, isTyping, scrollToBottom])

  // Load messages when active chat changes
  const loadMessages = useCallback(async (chatId) => {
    if (!chatId) return
    try {
      setIsLoading(true)
      const response = await api.get(`/chat/${chatId}`)
      await new Promise((resolve) => setTimeout(resolve, 500))
      setMessages(response.data.messages || [])
    } catch (err) {
      console.error('Error loading messages:', err)
      setMessages([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    const currentChatId = activeChat?._id ? String(activeChat._id) : null

    if (!currentChatId) {
      if (activeChatIdRef.current !== null) {
        setMessages([])
        activeChatIdRef.current = null
      }
      return
    }

    if (activeChatIdRef.current !== currentChatId) {
      activeChatIdRef.current = currentChatId
      loadMessages(currentChatId)
    }
  }, [activeChat, loadMessages])

  useEffect(() => {
    const loadPrompts = async () => {
      if (activeChat) return

      setIsLoadingPrompts(true)
      try {
        const response = await api.post('/chat/generate-prompts')
        setAyurvedicPrompts(response.data.prompts || defaultPrompts)
      } catch {
        setAyurvedicPrompts(defaultPrompts)
      } finally {
        setIsLoadingPrompts(false)
      }
    }

    const defaultPrompts = [
      'What are the benefits of turmeric in Ayurveda?',
      'How can I balance my doshas naturally?',
      "What's the best Ayurvedic morning routine?",
      'Tell me about pranayama breathing techniques',
      'How can Ayurveda help with stress management?',
    ]

    loadPrompts()
  }, [activeChat])

  const sendMessage = useCallback(async () => {
    if (!inputMessage.trim() || isTyping) return

    const message = inputMessage.trim()
    setInputMessage('')
    setIsTyping(true)

    let targetChat = activeChat

    if (!targetChat) {
      try {
        const title = message.length > 50 ? message.substring(0, 50) + '...' : message
        targetChat = await createNewChat(title)
        if (!targetChat) return

        setActiveChat(targetChat)
        activeChatIdRef.current = String(targetChat._id)
        setMessages([])

        await new Promise((resolve) => setTimeout(resolve, 200))
      } catch (error) {
        console.error('Error creating chat:', error)
        setIsTyping(false)
        return
      }
    }

    const userMessage = {
      role: 'user',
      content: message,
      timestamp: new Date().toISOString(),
    }

    setMessages((prev) => [...prev, userMessage])

    try {
      const response = await api.post(`/chat/${targetChat._id}/message`, { message })
      await new Promise((resolve) => setTimeout(resolve, 1000))

      if (Array.isArray(response.data.messages)) {
        setMessages(response.data.messages)
      } else if (response.data.aiMessage) {
        setMessages((prev) => [...prev, response.data.aiMessage])
      }

      if (response.data.aiMessage && messages.length === 0) {
        const newTitle = message.length > 50 ? message.substring(0, 50) + '...' : message
        updateChatTitle(targetChat._id, newTitle)
      }
    } catch (error) {
      console.error('Error sending message:', error)
      const errorMessage = {
        role: 'assistant',
        content: 'I encountered an error. Please try again.',
        timestamp: new Date().toISOString(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsTyping(false)
    }
  }, [inputMessage, isTyping, activeChat, createNewChat, setActiveChat, updateChatTitle, messages.length])

  const handleKeyPress = useCallback(
    (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        sendMessage()
      }
    },
    [sendMessage]
  )

  const handleInputChange = useCallback((e) => {
    setInputMessage(e.target.value)
    const textarea = e.target
    textarea.style.height = 'auto'
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px'
  }, [])

  const handlePromptClick = useCallback((prompt) => {
    setInputMessage(prompt)
    textareaRef.current?.focus()
  }, [])

  if (!activeChat) {
    return (
      <div className="flex-1 flex flex-col">
        <div className="glass-dark border-b border-white/10 p-4">
          <div className="flex items-center space-x-4">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="lg:hidden text-white/80 hover:text-white">
              <Menu size={20} />
            </button>
            <div className="flex items-center space-x-3">
              <div className="bg-white/20 p-2 rounded-lg">
                <Leaf className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-white font-semibold">🌿 Namaste! Welcome to AyurChat</h1>
                <p className="text-white/60 text-sm">Your AI Ayurvedic Wellness Companion</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center p-8">
          <div className="max-w-2xl mx-auto text-center">
            <div className="mb-8">
              <div className="bg-white/20 p-6 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                <Leaf className="w-12 h-12 text-white" />
              </div>
              <h2 className="text-4xl font-bold text-white mb-4 gradient-text">
                🌿 Namaste! Welcome to AyurChat
              </h2>
              <p className="text-white/80 text-lg mb-8">
                Your personal AI companion for Ayurvedic wisdom, natural healing, and holistic wellness guidance.
              </p>
            </div>

            <div className="grid gap-4 mb-8">
              <h3 className="text-white font-semibold mb-4 flex items-center justify-center space-x-2">
                <Sparkles className="w-5 h-5" />
                <span>Try asking about:</span>
              </h3>
              <div className="max-h-80 overflow-y-auto custom-scrollbar space-y-3 pr-2">
                {isLoadingPrompts ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div>
                    <span className="ml-2 text-white/60">Loading Ayurvedic wisdom...</span>
                  </div>
                ) : (
                  ayurvedicPrompts.map((prompt, index) => (
                    <button
                      key={index}
                      onClick={() => handlePromptClick(prompt)}
                      className="w-full glass p-4 rounded-lg text-left text-white/90 hover:bg-white/20 transition duration-200 flex items-start space-x-3"
                    >
                      <Leaf className="w-4 h-4 text-green-300 mt-1 flex-shrink-0" />
                      <span>{prompt}</span>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="glass-dark border-t border-white/10 p-4">
          <div className="max-w-4xl mx-auto flex space-x-4">
            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                value={inputMessage}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                placeholder="Ask me about Ayurvedic herbs, doshas, yoga, meditation, natural remedies, or holistic wellness..."
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent resize-none min-h-[50px] max-h-[120px]"
                rows={1}
              />
            </div>
            <button
              onClick={sendMessage}
              disabled={!inputMessage.trim()}
              className="bg-white text-gray-800 p-3 rounded-lg hover:bg-white/90 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col">
      <div className="glass-dark border-b border-white/10 p-4">
        <div className="flex items-center space-x-4">
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="lg:hidden text-white/80 hover:text-white">
            <Menu size={20} />
          </button>
          <div className="flex items-center space-x-3">
            <div className="bg-white/20 p-2 rounded-lg">
              <Leaf className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-white font-semibold">{activeChat?.title || 'New Chat'}</h1>
              <p className="text-white/60 text-sm">AI Ayurvedic Assistant</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-white border-t-transparent"></div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="text-center text-white/60 py-8">
                <p>No messages yet. Start a conversation!</p>
              </div>
            ) : (
              messages.map((message, index) => (
                <div
                  key={`${message.timestamp}-${index}`}
                  className={`flex flex-col space-y-1 animate-in slide-in-from-bottom-2 duration-300 ${
                    message.role === 'user' ? 'items-end' : 'items-start'
                  }`}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div
                    className={`message-bubble p-4 rounded-2xl max-w-[80%] shadow-lg relative overflow-hidden transform transition-all duration-300 hover:scale-[1.02] ${
                      message.role === 'user'
                        ? 'liquid-bg text-white'
                        : 'liquid-bg text-white'
                    }`}
                    style={{
                      background: message.role === 'user' 
                        ? 'linear-gradient(135deg, #10b981, #059669, #047857, #065f46)'
                        : 'linear-gradient(135deg, #047857, #065f46, #064e3b, #052e16)',
                      backgroundSize: '400% 400%'
                    }}
                  >
                    {/* Animated liquid overlay */}
                    <div className="absolute inset-0 liquid-overlay">
                      <div 
                        className="absolute inset-0 opacity-20"
                        style={{
                          background: 'radial-gradient(circle at 30% 70%, rgba(255,255,255,0.3) 0%, transparent 50%), radial-gradient(circle at 70% 30%, rgba(255,255,255,0.2) 0%, transparent 50%)',
                          animation: 'liquidPulse 4s ease-in-out infinite'
                        }}
                      ></div>
                      <div 
                        className="absolute inset-0 opacity-15"
                        style={{
                          background: 'linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.1) 50%, transparent 70%)',
                          animation: 'shimmer 3s ease-in-out infinite'
                        }}
                      ></div>
                    </div>
                    
                    <div className="relative z-10 message-content">
                      <div 
                        dangerouslySetInnerHTML={{ __html: formatMessage(message.content) }}
                        className="whitespace-pre-wrap leading-relaxed"
                      />
                    </div>
                  </div>
                  <div className={`text-xs text-white/60 px-2 transition-opacity duration-200 ${
                    message.role === 'user' ? 'text-right' : 'text-left'
                  }`}>
                    {formatTime(message.timestamp)}
                  </div>
                </div>
              ))
            )}
            {isTyping && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <div className="glass-dark border-t border-white/10 p-4">
        <div className="max-w-4xl mx-auto flex space-x-4">
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={inputMessage}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder="Ask me about Ayurvedic herbs, doshas, yoga, meditation, natural remedies, or holistic wellness..."
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent resize-none min-h-[50px] max-h-[120px]"
              rows={1}
            />
          </div>
          <button
            onClick={sendMessage}
            disabled={!inputMessage.trim() || isTyping}
            className="bg-white text-gray-800 p-3 rounded-lg hover:bg-white/90 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  )
}

export default ChatArea
