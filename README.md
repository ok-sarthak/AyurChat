# AyurChat - Ayurvedic AI Wellness Companion 🌿

A beautiful MERN stack chatbot application with an Ayurvedic theme, featuring a red, pink & violet gradient design with leaf icons. The application provides AI-powered wellness guidance through the Gemini API.

## Features

### 🎨 Beautiful UI/UX
- **Ayurvedic Theme**: Red, pink & violet gradient background with floating leaf animations
- **Glassmorphism Effects**: Modern translucent components with blur effects
- **Responsive Design**: Works perfectly on desktop and mobile devices
- **Smooth Animations**: Floating leaf animations and typing indicators

### 🔐 Authentication System
- **User Registration**: Create account with username, email, and password
- **Secure Login**: JWT-based authentication
- **Password Protection**: BCrypt hashing for secure password storage
- **Auto-logout**: Automatic logout on token expiration

### 💬 Chat Features
- **Multiple Chats**: Create and manage multiple chat conversations
- **AI Integration**: Powered by Google's Gemini AI for intelligent responses
- **Real-time Messaging**: Instant message sending and receiving
- **Message History**: Persistent chat history stored in MongoDB
- **Chat Management**: Delete chats, auto-generated titles
- **Typing Indicators**: Visual feedback during AI response generation

### 🛡️ Security & Performance
- **Rate Limiting**: Prevents API abuse with request limiting
- **CORS Protection**: Secure cross-origin resource sharing
- **Environment Variables**: Secure configuration management
- **Error Handling**: Comprehensive error handling and user feedback

## Tech Stack

### Frontend
- **React 19**: Latest React with hooks and functional components
- **React Router**: Client-side routing and navigation
- **Tailwind CSS**: Utility-first CSS framework for rapid styling
- **Axios**: HTTP client for API requests
- **Lucide React**: Beautiful SVG icons including leaf icons
- **Vite**: Fast build tool and development server

### Backend
- **Node.js**: JavaScript runtime environment
- **Express.js**: Web application framework
- **MongoDB**: NoSQL database for data persistence
- **Mongoose**: MongoDB object modeling
- **JWT**: JSON Web Tokens for authentication
- **BCrypt**: Password hashing
- **Google Generative AI**: Gemini API integration
- **Express Rate Limit**: API rate limiting
- **CORS**: Cross-Origin Resource Sharing
- **dotenv**: Environment variable management

## Project Structure

```
ChatBot/
├── backend/
│   ├── middleware/
│   │   └── auth.js              # JWT authentication middleware
│   ├── models/
│   │   ├── User.js              # User schema and methods
│   │   └── Chat.js              # Chat and message schemas
│   ├── routes/
│   │   ├── auth.js              # Authentication routes
│   │   └── chat.js              # Chat management routes
│   ├── .env                     # Environment variables
│   ├── .env.example            # Environment template
│   ├── package.json            # Backend dependencies
│   └── server.js               # Express server setup
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── auth/
│   │   │   │   ├── Login.jsx    # Login form component
│   │   │   │   └── Register.jsx # Registration form component
│   │   │   └── chat/
│   │   │       ├── ChatDashboard.jsx   # Main chat interface
│   │   │       ├── Sidebar.jsx         # Chat list sidebar
│   │   │       ├── ChatArea.jsx        # Message area
│   │   │       ├── MessageBubble.jsx   # Individual message
│   │   │       └── TypingIndicator.jsx # AI typing animation
│   │   ├── context/
│   │   │   └── AuthContext.jsx  # Authentication context
│   │   ├── hooks/
│   │   │   └── useAuth.js       # Authentication hook
│   │   ├── utils/
│   │   │   └── api.js           # API configuration
│   │   ├── App.jsx              # Main app component
│   │   ├── App.css              # Custom CSS animations
│   │   └── main.jsx             # React entry point
│   ├── package.json             # Frontend dependencies
│   ├── tailwind.config.js       # Tailwind configuration
│   └── vite.config.js           # Vite configuration
└── README.md                    # This file
```

## Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or MongoDB Atlas)
- Google Gemini API key

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment Configuration:**
   Create a `.env` file in the backend directory:
   ```env
   # MongoDB Connection
   MONGODB_URI=mongodb://localhost:27017/ayurchat
   # or for MongoDB Atlas:
   # MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ayurchat

   # JWT Secret (generate a secure random string)
   JWT_SECRET=your_super_secure_jwt_secret_key_here

   # Google Gemini API Key
   GEMINI_API_KEY=your_gemini_api_key_here

   # Server Port
   PORT=5001
   ```

4. **Start the backend server:**
   ```bash
   npm start
   # or for development with nodemon:
   npm run dev
   ```

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser:**
   Navigate to `http://localhost:5173`

## API Endpoints

### Authentication Routes (`/api/auth`)
- `POST /register` - User registration
- `POST /login` - User login
- `GET /me` - Get current user info (protected)

### Chat Routes (`/api/chat`)
- `GET /` - Get all user chats (protected)
- `POST /` - Create new chat (protected)
- `GET /:chatId` - Get specific chat with messages (protected)
- `POST /:chatId/message` - Send message to chat (protected)
- `DELETE /:chatId` - Delete chat (protected)

## Key Features Explained

### 🎨 Ayurvedic Theme Design
- **Gradient Background**: Beautiful red-to-pink-to-violet gradient
- **Leaf Icons**: Lucide React leaf icons throughout the interface
- **Floating Animation**: CSS animations for floating leaf decorations
- **Glassmorphism**: Translucent components with backdrop blur effects

### 🔐 Authentication Flow
1. User registers with username, email, and password
2. Password is hashed using BCrypt before storage
3. JWT token is generated and sent to client
4. Token is stored in localStorage and sent with API requests
5. Protected routes verify token and fetch user data

### 💬 Chat Functionality
1. Users can create multiple chat conversations
2. Messages are sent to Gemini AI API for intelligent responses
3. Chat history is preserved in MongoDB
4. Real-time UI updates with typing indicators
5. Automatic chat title generation from first message

### 🛡️ Security Features
- **Rate Limiting**: 100 requests per 15 minutes per IP
- **JWT Authentication**: Secure token-based auth
- **Password Hashing**: BCrypt with salt rounds
- **CORS Protection**: Configured for specific origins
- **Input Validation**: Server-side validation for all inputs

## Customization

### Changing the Theme
The Ayurvedic theme can be customized in:
- `tailwind.config.js` - Color palette and animations
- `App.css` - Custom CSS animations and effects
- Component files - Gradient classes and styling

### Adding New Features
- **New AI Models**: Replace Gemini API in `routes/chat.js`
- **Additional Auth Providers**: Extend auth routes
- **File Uploads**: Add multer middleware for file handling
- **Voice Messages**: Integrate speech-to-text APIs

## Troubleshooting

### Common Issues

1. **Backend won't start:**
   - Check if MongoDB is running
   - Verify environment variables in `.env`
   - Ensure port 5001 is available

2. **Frontend build errors:**
   - Clear node_modules and reinstall: `rm -rf node_modules && npm install`
   - Check for missing dependencies

3. **Authentication issues:**
   - Verify JWT secret is set
   - Check browser localStorage for token
   - Ensure backend CORS is properly configured

4. **API errors:**
   - Verify Gemini API key is valid
   - Check network connectivity
   - Review server logs for detailed errors

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the ISC License.

## Acknowledgments

- **Google Gemini AI** for providing the AI capabilities
- **Lucide React** for the beautiful icon library
- **Tailwind CSS** for the utility-first CSS framework
- **MongoDB** for the flexible NoSQL database
- **React & Node.js** communities for excellent documentation

---

**Built with ❤️ for Ayurvedic wellness and modern web development**
