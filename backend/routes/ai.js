const express = require('express');
const router = express.Router();
const aiService = require('../services/aiService');

// AI Chat endpoint
router.post('/chat', async (req, res) => {
  try {
    const { message, history } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Mesaj boş olamaz' });
    }
    
    const response = await aiService.generateResponse(message, history);
    res.json({ response });
  } catch (error) {
    console.error('AI Chat hatası:', error);
    res.status(500).json({ error: 'Bir hata oluştu' });
  }
});

module.exports = router; 