const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const Chat = require('../models/Chat');
const auth = require('../middleware/auth');

const router = express.Router();

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Get all chats for user
router.get('/', auth, async (req, res) => {
  try {
    const chats = await Chat.find({ userId: req.user._id })
      .sort({ updatedAt: -1 })
      .select('title createdAt updatedAt');
    
    res.json(chats);
  } catch (error) {
    console.error('Get chats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get specific chat
router.get('/:chatId', auth, async (req, res) => {
  try {
    const chat = await Chat.findOne({ 
      _id: req.params.chatId, 
      userId: req.user._id 
    });
    
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }
    
    res.json(chat);
  } catch (error) {
    console.error('Get chat error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new chat
router.post('/', auth, async (req, res) => {
  try {
    const { title } = req.body;
    
    const chat = new Chat({
      userId: req.user._id,
      title: title || 'New Chat',
      messages: []
    });
    
    await chat.save();
    res.status(201).json(chat);
  } catch (error) {
    console.error('Create chat error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Send message to chat
router.post('/:chatId/message', auth, async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message || !message.trim()) {
      return res.status(400).json({ message: 'Message is required' });
    }

    const chat = await Chat.findOne({ 
      _id: req.params.chatId, 
      userId: req.user._id 
    });
    
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    // Add user message to chat
    chat.messages.push({
      role: 'user',
      content: message,
      timestamp: new Date()
    });

    try {
      // Get AI response from Gemini
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      
      // Build conversation history for context
      const conversationHistory = chat.messages.map(msg => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }]
      }));

      const chatSession = model.startChat({
        history: conversationHistory.slice(0, -1), // Exclude the current message
        generationConfig: {
          temperature: 0.7,
          topK: 1,
          topP: 1,
          maxOutputTokens: 2048,
        },
      });

      const result = await chatSession.sendMessage(message);
      const aiResponse = result.response.text();

      // Add AI response to chat
      chat.messages.push({
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date()
      });

      // Update chat title if it's the first message
      if (chat.messages.length === 2 && chat.title === 'New Chat') {
        chat.title = message.length > 50 ? message.substring(0, 50) + '...' : message;
      }

      await chat.save();

      res.json({
        userMessage: {
          role: 'user',
          content: message,
          timestamp: chat.messages[chat.messages.length - 2].timestamp
        },
        aiMessage: {
          role: 'assistant',
          content: aiResponse,
          timestamp: chat.messages[chat.messages.length - 1].timestamp
        }
      });

    } catch (aiError) {
      console.error('AI API error:', aiError);
      
      // Add error message to chat
      chat.messages.push({
        role: 'assistant',
        content: 'I apologize, but I encountered an error processing your request. Please try again.',
        timestamp: new Date()
      });

      await chat.save();

      res.status(500).json({ 
        message: 'AI service temporarily unavailable',
        userMessage: {
          role: 'user',
          content: message,
          timestamp: chat.messages[chat.messages.length - 2].timestamp
        }
      });
    }

  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete chat
router.delete('/:chatId', auth, async (req, res) => {
  try {
    const chat = await Chat.findOneAndDelete({ 
      _id: req.params.chatId, 
      userId: req.user._id 
    });
    
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }
    
    res.json({ message: 'Chat deleted successfully' });
  } catch (error) {
    console.error('Delete chat error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
