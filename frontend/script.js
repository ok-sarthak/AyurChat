// API Configuration
const API_BASE_URL = 'http://localhost:5001/api';

// State Management
let currentUser = null;
let currentChatId = null;
let chats = [];
let authToken = localStorage.getItem('authToken');

// DOM Elements
const elements = {
    loading: document.getElementById('loading'),
    authContainer: document.getElementById('auth-container'),
    chatApp: document.getElementById('chat-app'),
    loginForm: document.getElementById('login-form'),
    registerForm: document.getElementById('register-form'),
    showRegister: document.getElementById('showRegister'),
    showLogin: document.getElementById('showLogin'),
    loginFormEl: document.getElementById('loginForm'),
    registerFormEl: document.getElementById('registerForm'),
    newChatBtn: document.getElementById('newChatBtn'),
    chatList: document.getElementById('chatList'),
    userUsername: document.getElementById('userUsername'),
    logoutBtn: document.getElementById('logoutBtn'),
    chatTitle: document.getElementById('chatTitle'),
    deleteChatBtn: document.getElementById('deleteChatBtn'),
    messagesContainer: document.getElementById('messagesContainer'),
    messageForm: document.getElementById('messageForm'),
    messageInput: document.getElementById('messageInput'),
    sendBtn: document.getElementById('sendBtn'),
    errorModal: document.getElementById('errorModal'),
    errorMessage: document.getElementById('errorMessage')
};

// Utility Functions
function showError(message) {
    elements.errorMessage.textContent = message;
    elements.errorModal.classList.remove('hidden');
}

function hideError() {
    elements.errorModal.classList.add('hidden');
}

function showLoading() {
    elements.loading.classList.remove('hidden');
}

function hideLoading() {
    elements.loading.classList.add('hidden');
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)}d ago`;
    
    return date.toLocaleDateString();
}

function autoResizeTextarea(textarea) {
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
}

// API Functions
async function apiCall(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
        headers: {
            'Content-Type': 'application/json',
            ...(authToken && { 'Authorization': `Bearer ${authToken}` })
        },
        ...options
    };
    
    if (config.body && typeof config.body !== 'string') {
        config.body = JSON.stringify(config.body);
    }
    
    try {
        const response = await fetch(url, config);
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'API request failed');
        }
        
        return data;
    } catch (error) {
        console.error('API call failed:', error);
        throw error;
    }
}

// Authentication Functions
async function login(email, password) {
    try {
        const data = await apiCall('/auth/login', {
            method: 'POST',
            body: { email, password }
        });
        
        authToken = data.token;
        localStorage.setItem('authToken', authToken);
        currentUser = data.user;
        
        showChatApp();
        await loadChats();
    } catch (error) {
        showError(error.message);
    }
}

async function register(username, email, password) {
    try {
        const data = await apiCall('/auth/register', {
            method: 'POST',
            body: { username, email, password }
        });
        
        authToken = data.token;
        localStorage.setItem('authToken', authToken);
        currentUser = data.user;
        
        showChatApp();
        await loadChats();
    } catch (error) {
        showError(error.message);
    }
}

async function getCurrentUser() {
    try {
        const data = await apiCall('/auth/me');
        currentUser = data.user;
        return data.user;
    } catch (error) {
        logout();
        throw error;
    }
}

function logout() {
    authToken = null;
    currentUser = null;
    currentChatId = null;
    chats = [];
    localStorage.removeItem('authToken');
    showAuthContainer();
}

// Chat Functions
async function loadChats() {
    try {
        chats = await apiCall('/chat');
        renderChatList();
    } catch (error) {
        showError('Failed to load chats');
    }
}

async function createNewChat() {
    try {
        const chat = await apiCall('/chat', {
            method: 'POST',
            body: { title: 'New Chat' }
        });
        
        chats.unshift(chat);
        renderChatList();
        selectChat(chat._id);
    } catch (error) {
        showError('Failed to create new chat');
    }
}

async function loadChat(chatId) {
    try {
        const chat = await apiCall(`/chat/${chatId}`);
        renderMessages(chat.messages);
        updateChatHeader(chat.title);
        enableMessageInput();
    } catch (error) {
        showError('Failed to load chat');
    }
}

async function sendMessage(message) {
    if (!currentChatId || !message.trim()) return;
    
    try {
        // Add user message immediately
        addMessage('user', message);
        
        // Clear input
        elements.messageInput.value = '';
        autoResizeTextarea(elements.messageInput);
        
        // Show typing indicator
        showTypingIndicator();
        
        // Send to API
        const response = await apiCall(`/chat/${currentChatId}/message`, {
            method: 'POST',
            body: { message }
        });
        
        // Remove typing indicator and add AI response
        hideTypingIndicator();
        addMessage('assistant', response.aiMessage.content, response.aiMessage.timestamp);
        
        // Update chat list (title might have changed)
        await loadChats();
        
    } catch (error) {
        hideTypingIndicator();
        showError('Failed to send message');
    }
}

async function deleteChat(chatId) {
    if (!confirm('Are you sure you want to delete this chat?')) return;
    
    try {
        await apiCall(`/chat/${chatId}`, { method: 'DELETE' });
        
        chats = chats.filter(chat => chat._id !== chatId);
        renderChatList();
        
        if (currentChatId === chatId) {
            currentChatId = null;
            showWelcomeMessage();
            disableMessageInput();
        }
    } catch (error) {
        showError('Failed to delete chat');
    }
}

// UI Functions
function showAuthContainer() {
    elements.authContainer.classList.remove('hidden');
    elements.chatApp.classList.add('hidden');
}

function showChatApp() {
    elements.authContainer.classList.add('hidden');
    elements.chatApp.classList.remove('hidden');
    elements.userUsername.textContent = currentUser.username;
}

function showRegisterForm() {
    elements.loginForm.classList.remove('active');
    elements.registerForm.classList.add('active');
}

function showLoginForm() {
    elements.registerForm.classList.remove('active');
    elements.loginForm.classList.add('active');
}

function selectChat(chatId) {
    currentChatId = chatId;
    loadChat(chatId);
    
    // Update UI
    document.querySelectorAll('.chat-item').forEach(item => {
        item.classList.toggle('active', item.dataset.chatId === chatId);
    });
    
    elements.deleteChatBtn.classList.remove('hidden');
}

function renderChatList() {
    elements.chatList.innerHTML = '';
    
    chats.forEach(chat => {
        const chatItem = document.createElement('div');
        chatItem.className = 'chat-item';
        chatItem.dataset.chatId = chat._id;
        chatItem.innerHTML = `
            <h4>${chat.title}</h4>
            <span>${formatDate(chat.updatedAt)}</span>
        `;
        
        chatItem.addEventListener('click', () => selectChat(chat._id));
        elements.chatList.appendChild(chatItem);
    });
}

function renderMessages(messages) {
    elements.messagesContainer.innerHTML = '';
    
    messages.forEach(message => {
        addMessage(message.role, message.content, message.timestamp);
    });
    
    scrollToBottom();
}

function addMessage(role, content, timestamp = new Date()) {
    const messageEl = document.createElement('div');
    messageEl.className = `message ${role}`;
    
    const timeStr = new Date(timestamp).toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
    });
    
    messageEl.innerHTML = `
        <div class="message-content">
            ${content.replace(/\n/g, '<br>')}
            <div class="message-time">${timeStr}</div>
        </div>
    `;
    
    elements.messagesContainer.appendChild(messageEl);
    scrollToBottom();
}

function showTypingIndicator() {
    const typingEl = document.createElement('div');
    typingEl.className = 'typing-indicator';
    typingEl.id = 'typing-indicator';
    typingEl.innerHTML = `
        <div class="message-content">
            <div class="typing-dots">
                <span></span>
                <span></span>
                <span></span>
            </div>
        </div>
    `;
    
    elements.messagesContainer.appendChild(typingEl);
    scrollToBottom();
}

function hideTypingIndicator() {
    const typingEl = document.getElementById('typing-indicator');
    if (typingEl) {
        typingEl.remove();
    }
}

function showWelcomeMessage() {
    elements.messagesContainer.innerHTML = `
        <div class="welcome-message">
            <i class="fas fa-robot welcome-icon"></i>
            <h2>Welcome to AI ChatBot!</h2>
            <p>Start a new conversation or select an existing chat from the sidebar.</p>
        </div>
    `;
    elements.chatTitle.textContent = 'Select a chat to start';
    elements.deleteChatBtn.classList.add('hidden');
}

function updateChatHeader(title) {
    elements.chatTitle.textContent = title;
}

function enableMessageInput() {
    elements.messageInput.disabled = false;
    elements.sendBtn.disabled = false;
    elements.messageInput.placeholder = 'Type your message...';
}

function disableMessageInput() {
    elements.messageInput.disabled = true;
    elements.sendBtn.disabled = true;
    elements.messageInput.placeholder = 'Select a chat to start messaging...';
}

function scrollToBottom() {
    elements.messagesContainer.scrollTop = elements.messagesContainer.scrollHeight;
}

// Event Listeners
elements.showRegister.addEventListener('click', (e) => {
    e.preventDefault();
    showRegisterForm();
});

elements.showLogin.addEventListener('click', (e) => {
    e.preventDefault();
    showLoginForm();
});

elements.loginFormEl.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    showLoading();
    await login(email, password);
    hideLoading();
});

elements.registerFormEl.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('registerUsername').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    
    showLoading();
    await register(username, email, password);
    hideLoading();
});

elements.newChatBtn.addEventListener('click', createNewChat);

elements.logoutBtn.addEventListener('click', logout);

elements.deleteChatBtn.addEventListener('click', () => {
    if (currentChatId) {
        deleteChat(currentChatId);
    }
});

elements.messageForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const message = elements.messageInput.value.trim();
    if (message) {
        sendMessage(message);
    }
});

elements.messageInput.addEventListener('input', () => {
    autoResizeTextarea(elements.messageInput);
});

elements.messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        elements.messageForm.dispatchEvent(new Event('submit'));
    }
});

// Error modal close
elements.errorModal.querySelector('.close').addEventListener('click', hideError);
elements.errorModal.addEventListener('click', (e) => {
    if (e.target === elements.errorModal) {
        hideError();
    }
});

// Initialization
async function init() {
    showLoading();
    
    if (authToken) {
        try {
            await getCurrentUser();
            showChatApp();
            await loadChats();
            showWelcomeMessage();
            disableMessageInput();
        } catch (error) {
            console.error('Failed to initialize with stored token:', error);
            showAuthContainer();
        }
    } else {
        showAuthContainer();
    }
    
    hideLoading();
}

// Start the application
init();
