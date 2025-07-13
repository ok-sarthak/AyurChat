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
      // Get AI response from Gemini with Ayurvedic context
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      
      // Build conversation history for context
      const conversationHistory = chat.messages.map(msg => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }]
      }));

      // Ayurvedic system prompt
      const systemPrompt = `You are an expert Ayurvedic wellness assistant with deep knowledge of traditional Indian medicine. Your responses should be:

1. Rooted in authentic Ayurvedic principles and practices
2. Practical and actionable for modern lifestyles
3. Emphasize natural healing, prevention, and holistic wellness
4. Include relevant Sanskrit terms when appropriate (with explanations)
5. Consider the three doshas (Vata, Pitta, Kapha) in your advice
6. Mention herbs, lifestyle practices, yoga, meditation when relevant
7. Always suggest consulting with qualified Ayurvedic practitioners for serious health concerns
8. Be warm, wise, and encouraging in tone

Focus on wellness, not medical diagnosis or treatment of diseases. Provide educational information about Ayurvedic approaches to health and well-being.

User question: ${message}`;

      const chatSession = model.startChat({
        history: conversationHistory.slice(0, -1), // Exclude the current message
        generationConfig: {
          temperature: 0.7,
          topK: 1,
          topP: 1,
          maxOutputTokens: 2048,
        },
      });

      const result = await chatSession.sendMessage(systemPrompt);
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

      // Return the complete updated message list
      res.json({
        messages: chat.messages,
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
        messages: chat.messages,
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

// Generate dynamic Ayurvedic prompts
router.post('/generate-prompts', auth, async (req, res) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const promptRequest = `Generate 5 diverse and interesting Ayurvedic wellness questions that users might ask. 
    Make them specific, practical, and focused on different aspects of Ayurveda like:
    - Herbs and their benefits
    - Dosha balancing
    - Daily routines (Dinacharya)
    - Seasonal practices (Ritucharya)
    - Yoga and meditation
    - Ayurvedic nutrition
    - Lifestyle practices
    - Mental wellness
    
    Return only the questions as a simple array, no explanations. Each question should be concise and engaging.
    Example format: ["Question 1?", "Question 2?", "Question 3?", "Question 4?", "Question 5?"]`;

    const result = await model.generateContent(promptRequest);
    const response = result.response.text();
    
    try {
      // Try to parse the response as JSON
      const prompts = JSON.parse(response);
      if (Array.isArray(prompts) && prompts.length === 5) {
        res.json({ prompts });
      } else {
        throw new Error('Invalid format');
      }
    } catch (parseError) {
      // If parsing fails, extract questions manually
      const questions = response.match(/"([^"]+\?)/g);
      if (questions && questions.length >= 5) {
        const cleanQuestions = questions.slice(0, 5).map(q => q.replace(/"/g, ''));
        res.json({ prompts: cleanQuestions });
      } else {
        // Fallback to default prompts
        res.json({ 
          prompts: [
            "What are the benefits of Ashwagandha in daily wellness?",
            "How can I determine my Ayurvedic constitution (Prakriti)?",
            "What's an ideal Ayurvedic morning routine for better health?",
            "How does seasonal eating benefit our well-being in Ayurveda?",
            "What are the best Ayurvedic practices for mental clarity?"
          ]
        });
      }
    }
  } catch (error) {
    console.error('Generate prompts error:', error);
    // Return fallback prompts
    res.json({ 
      prompts: [
        "What are the benefits of Ashwagandha in daily wellness?",
        "How can I determine my Ayurvedic constitution (Prakriti)?",
        "What's an ideal Ayurvedic morning routine for better health?",
        "How does seasonal eating benefit our well-being in Ayurveda?",
        "What are the best Ayurvedic practices for mental clarity?"
      ]
    });
  }
});

module.exports = router;
