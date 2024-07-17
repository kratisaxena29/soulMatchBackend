require('dotenv').config();
const express = require('express');
const axios = require('axios');

const openaiApiKey = process.env.OPENAI_API_KEY || "QXOCLFSYX9Q2T1w9iyIDT3BlbkFJp9q0sLjgIhDvPcrzTun7";

const generate_AboutUs = async (req, res) => {
  try {
    const prompt = 'Generate a professional "About Us" section for a company that specializes in AI and machine learning solutions.';

    const response = await axios.post(
      'https://api.openai.com/v1/engines/gemini/completions',
      {
        prompt,
        max_tokens: 150, // Adjust the max_tokens as needed
      },
      {
        headers: {
          'Authorization': `Bearer ${openaiApiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const aboutUsText = response.data.choices[0].text;
    res.status(200).json({ aboutUs: aboutUsText });
  } catch (error) {
    console.error('Error generating About Us:', error);
    res.status(500).json({ error: 'Failed to generate About Us' });
  }
};

module.exports = {
  generate_AboutUs,
};
