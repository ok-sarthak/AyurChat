import React from 'react'
import { 
  Plus, 
  MessageSquare, 
  Trash2, 
  User, 
  LogOut, 
  Leaf, 
  Menu,
  X
} from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'

const Sidebar = ({ 
  chats, 
  activeChat, 
  setActiveChat, 
  createNewChat, 
  deleteChat, 
  user,
  isOpen,
  setIsOpen
}) => {
  const { logout } = useAuth()

  const handleNewChat = () => {
    createNewChat()
  }

  const handleDeleteChat = (e, chatId, chatTitle) => {
    e.stopPropagation()
    const confirmMessage = `Are you sure you want to delete the chat "${chatTitle}"? This action cannot be undone.`
    if (window.confirm(confirmMessage)) {
      deleteChat(chatId)
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now - date)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 1) return 'Today'
    if (diffDays === 2) return 'Yesterday'
    if (diffDays <= 7) return `${diffDays - 1} days ago`
    return date.toLocaleDateString()
  }

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed lg:relative z-30 h-full w-80 glass-dark border-r border-white/10 
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        flex flex-col
      `}>
        {/* Header */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="bg-white/20 p-2 rounded-lg">
                <Leaf className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-white font-bold text-lg">🌿 AyurChat</h1>
                <p className="text-white/60 text-sm">Ayurvedic AI Wisdom</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="lg:hidden text-white/60 hover:text-white"
            >
              <X size={20} />
            </button>
          </div>

          <button
            onClick={handleNewChat}
            className="w-full flex items-center justify-center space-x-2 bg-white/20 hover:bg-white/30 text-white py-3 px-4 rounded-lg transition duration-200"
          >
            <Plus size={18} />
            <span>New Ayurvedic Chat</span>
          </button>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="p-4 space-y-2">
            {chats.length === 0 ? (
              <div className="text-center text-white/60 py-8">
                <MessageSquare size={48} className="mx-auto mb-4 opacity-50" />
                <p>No chats yet</p>
                <p className="text-sm">Start a conversation to begin</p>
              </div>
            ) : (
              chats.map((chat) => (
                <div
                  key={chat._id}
                  onClick={() => setActiveChat(chat)}
                  className={`
                    group flex items-center justify-between p-3 rounded-lg cursor-pointer transition duration-200
                    ${activeChat?._id === chat._id 
                      ? 'bg-white/20 border border-white/30' 
                      : 'hover:bg-white/10'
                    }
                  `}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <MessageSquare size={16} className="text-white/60" />
                      <h3 className="text-white font-medium text-sm truncate">
                        {chat.title}
                      </h3>
                    </div>
                    <p className="text-white/50 text-xs">
                      {formatDate(chat.updatedAt)}
                    </p>
                  </div>
                  
                  <button
                    onClick={(e) => handleDeleteChat(e, chat._id, chat.title)}
                    className="opacity-0 group-hover:opacity-100 text-white/50 hover:text-red-400 p-1 transition duration-200 rounded"
                    title={`Delete "${chat.title}"`}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* User Section */}
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-white/20 p-2 rounded-full">
                <User className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-white font-medium text-sm">{user?.username}</p>
                <p className="text-white/60 text-xs">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="text-white/60 hover:text-red-400 p-2 rounded-lg hover:bg-white/10 transition duration-200"
              title="Logout"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

export default Sidebar
