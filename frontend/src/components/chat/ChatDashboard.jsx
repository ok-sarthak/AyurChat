import React, { useState, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'
import Sidebar from './Sidebar'
import ChatArea from './ChatArea'
import axios from 'axios'

const ChatDashboard = () => {
  const { user } = useAuth()
  const [chats, setChats] = useState([])
  const [activeChat, setActiveChat] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  useEffect(() => {
    const loadChats = async () => {
      try {
        const response = await axios.get('/chat')
        setChats(response.data)
        // Don't auto-select first chat - show welcome screen instead
      } catch (error) {
        console.error('Error fetching chats:', error)
      } finally {
        setIsLoading(false)
      }
    }
    
    loadChats()
  }, [])

  const createNewChat = async (title = 'New Chat') => {
    try {
      const response = await axios.post('/chat', { title })
      const newChat = response.data
      setChats(prev => [newChat, ...prev])
      // Set the new chat as active immediately
      setActiveChat(newChat)
      return newChat
    } catch (error) {
      console.error('Error creating chat:', error)
      return null
    }
  }

  const updateChatTitle = (chatId, newTitle) => {
    setChats(prev => 
      prev.map(chat => 
        chat._id === chatId ? { ...chat, title: newTitle } : chat
      )
    )
    if (activeChat && activeChat._id === chatId) {
      setActiveChat(prev => ({ ...prev, title: newTitle }))
    }
  }

  const deleteChat = async (chatId) => {
    try {
      await axios.delete(`/chat/${chatId}`)
      setChats(prev => prev.filter(chat => chat._id !== chatId))
      if (activeChat && activeChat._id === chatId) {
        const remainingChats = chats.filter(chat => chat._id !== chatId)
        setActiveChat(remainingChats.length > 0 ? remainingChats[0] : null)
      }
    } catch (error) {
      console.error('Error deleting chat:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="h-screen flex overflow-hidden">
      <Sidebar
        chats={chats}
        activeChat={activeChat}
        setActiveChat={setActiveChat}
        createNewChat={createNewChat}
        deleteChat={deleteChat}
        user={user}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
      />
      <ChatArea
        activeChat={activeChat}
        setActiveChat={setActiveChat}
        createNewChat={createNewChat}
        updateChatTitle={updateChatTitle}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      />
    </div>
  )
}

export default ChatDashboard
