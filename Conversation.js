// conversation.js
const axios = require('axios');

let conversationHistory = []; // Store conversation history for context

// Query the LLaMA model and return the response
async function queryAI(query) {
    const apiKey = process.env.OPENROUTER_API_KEY; // API Key from the .env file
    const apiUrl = 'https://openrouter.ai/api/v1/chat/completions'; // OpenRouter API endpoint

    try {
        // Add the new query to the conversation history
        conversationHistory.push({ role: 'user', content: query });

        // Prepare the request body with the conversation history
        const response = await axios.post(apiUrl, {
            model: 'meta-llama/llama-4-maverick:free',
            messages: conversationHistory
        }, {
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            }
        });

        // Extract AI response from the response data
        const aiMessage = response.data.choices && response.data.choices[0].message
            ? response.data.choices[0].message.content
            : 'Sorry, I could not process your query. Please try again.';

        // Add the AI response to the conversation history
        conversationHistory.push({ role: 'assistant', content: aiMessage });

        return aiMessage;
    } catch (error) {
        console.error('❌ Error querying AI:', error);
        return 'Sorry, there was an issue with the query. Please try again later.';
    }
}

// Function to reset the conversation (optional, in case you want to clear the context)
function resetConversation() {
    conversationHistory = [];
}

module.exports = { queryAI, resetConversation };
