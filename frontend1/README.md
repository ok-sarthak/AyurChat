# ChatBot Frontend

A simple, modern frontend for the AI ChatBot application built with HTML, CSS, and vanilla JavaScript.

## Features

- **User Authentication**: Login and registration
- **Chat Management**: Create, view, and delete chat conversations
- **Real-time Messaging**: Send messages and receive AI responses
- **Responsive Design**: Works on desktop and mobile devices
- **Modern UI**: Clean, gradient-based design with smooth animations

## Setup Instructions

### Option 1: Direct File Opening (Recommended for Development)
1. Simply open `index.html` in your web browser
2. Make sure the backend is running on `http://localhost:5000`

### Option 2: Using the Express Server
1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the server:
   ```bash
   npm start
   ```

3. Open your browser and go to `http://localhost:3000`

## Backend Requirements

Make sure the backend is running before using the frontend:

1. Navigate to the backend directory
2. Create a `.env` file based on `.env.example`
3. Install dependencies: `npm install`
4. Start the backend: `npm run dev`

The backend should be accessible at `http://localhost:5000`

## API Endpoints Used

The frontend communicates with these backend endpoints:

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user info
- `GET /api/chat` - Get all user chats
- `GET /api/chat/:chatId` - Get specific chat
- `POST /api/chat` - Create new chat
- `POST /api/chat/:chatId/message` - Send message
- `DELETE /api/chat/:chatId` - Delete chat

## File Structure

```
frontend/
├── index.html          # Main HTML file
├── styles.css          # CSS styles
├── script.js           # JavaScript functionality
├── server.js           # Optional Express server
├── package.json        # Node.js dependencies
└── README.md          # This file
```

## Browser Compatibility

The frontend uses modern JavaScript features and CSS. It's compatible with:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Development Notes

- The frontend expects the backend to be running on `http://localhost:5000`
- CORS is handled by the backend
- Authentication tokens are stored in localStorage
- The UI automatically refreshes chat lists and handles real-time updates
- Error handling is implemented with user-friendly messages

## Customization

You can easily customize the appearance by modifying the CSS variables in `styles.css`:

```css
:root {
    --primary-color: #667eea;
    --secondary-color: #764ba2;
    --background-color: #f8fafc;
    /* ... other variables */
}
```
