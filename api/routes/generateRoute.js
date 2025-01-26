// api/routes/generateRoute.js
const express = require('express');
const {generateText} = require('../googleAI'); // Google AI fonksiyonunu içe aktar
const router = express.Router();

router.post('/', async (req, res) => {
  const {eventName, location, date, time, field} = req.body;

  if (!eventName || !location || !date || !time) {
    return res
      .status(400)
      .json({message: 'Event name, location, date, and time are required'});
  }

  let prompt;
  if (field === 'description') {
    prompt = `
      Generate a detailed and engaging event description for:
      - Event Name: ${eventName}
      - Location: ${location}
      - Date: ${date}
      - Time: ${time}

      The description should highlight the significance of the event, what attendees can expect, and why they should participate.
    `;
  } else if (field === 'tags') {
    prompt = `
      Generate 5 to 10 unique, relevant, and comma-separated tags for an event with:
      - Event Name: ${eventName}
      - Description: (Based on the event name and general concept)
      - Location: ${location}
      - Date: ${date}
      - Time: ${time}

      Tags should be short, meaningful, and event-specific, separated by commas.
    `;
  } else {
    return res.status(400).json({message: 'Invalid field type'});
  }

  try {
    const response = await generateText(prompt);
    res.status(200).json({response});
  } catch (error) {
    console.error('Error generating content:', error.message);
    res.status(500).json({message: 'Failed to generate content'});
  }
});

module.exports = router;
