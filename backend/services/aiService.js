const axios = require('axios');

class AIService {
  constructor() {
    this.apiKey = process.env.GROK_API_KEY;
    this.apiUrl = 'https://api.grok.ai/v1/chat/completions';
  }

  async generateMessageSuggestions(campaignObjective, audienceType) {
    try {
      const prompt = `Generate 3 personalized marketing messages for a campaign with the following details:
      - Campaign Objective: ${campaignObjective}
      - Target Audience: ${audienceType}
      
      The messages should:
      - Include {{customerName}} placeholder for personalization
      - Be engaging and action-oriented
      - Be specific to the campaign objective
      - Consider the audience type
      - Be concise (max 160 characters)
      - Have a clear call to action
      
      Return exactly 3 messages, one per line.`;

      const response = await axios.post(
        this.apiUrl,
        {
          model: 'grok-1',
          messages: [
            {
              role: 'system',
              content: 'You are a marketing message generator that creates personalized, engaging campaign messages.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 300
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return this.parseAIResponse(response.data.choices[0].message.content);
    } catch (error) {
      console.error('Error generating message suggestions:', error);
      throw new Error('Failed to generate message suggestions');
    }
  }

  parseAIResponse(content) {
    const lines = content.split('\n').filter(line => 
      line.trim() && 
      line.includes('{{customerName}}') && 
      !line.startsWith('-') && 
      !line.startsWith('*')
    );
    return lines;
  }

  async generateCampaignInsights(campaignStats) {
    try {
      const prompt = `Analyze the following campaign statistics and provide insights:
      - Total Audience: ${campaignStats.audienceSize}
      - Messages Sent: ${campaignStats.sent}
      - Failed Deliveries: ${campaignStats.failed}
      
      Provide insights on:
      1. Delivery performance
      2. Areas for improvement
      3. Recommendations for future campaigns
      
      Format the response as a clear, bulleted summary.`;

      const response = await axios.post(
        this.apiUrl,
        {
          model: 'grok-1',
          messages: [
            {
              role: 'system',
              content: 'You are a campaign analytics expert providing insights on marketing campaign performance.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.5,
          max_tokens: 300
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data.choices[0].message.content;
    } catch (error) {
      console.error('Error generating campaign insights:', error);
      throw new Error('Failed to generate campaign insights');
    }
  }

  async convertToSegmentRules(naturalLanguage) {
    try {
      const prompt = `Convert the following natural language targeting criteria to segment rules:
      "${naturalLanguage}"
      
      Generate rules for:
      - Time-based conditions (last purchase)
      - Spending conditions (total spend)
      - Purchase frequency
      - Average order value
      
      Return the response as a valid JSON array of rules with this structure:
      [{
        "operator": "AND",
        "rules": [
          {
            "field": "fieldName",
            "operator": "operatorType",
            "value": "value"
          }
        ]
      }]`;

      const response = await axios.post(
        this.apiUrl,
        {
          model: 'grok-1',
          messages: [
            {
              role: 'system',
              content: 'You are a targeting criteria analyzer that converts natural language to structured segment rules.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.3,
          max_tokens: 300
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const aiRules = JSON.parse(response.data.choices[0].message.content);
      return Array.isArray(aiRules) ? aiRules : [aiRules];
    } catch (error) {
      console.error('Error converting to segment rules:', error);
      throw new Error('Failed to convert targeting criteria');
    }
  }
}

module.exports = new AIService(); 