import process from "process";
import { ChatGPTAPI, ChatMessage } from "chatgpt";
import { type Message } from "whatsapp-web.js";

// Environment variables
require("dotenv").config();

// ChatGPT Client
const api = new ChatGPTAPI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Mapping from number to last conversation id
const conversations = {};

export const handleMessageGPT = async (message: Message, prompt: string) => {
  try {
    // Get last conversation
    const lastConversation = conversations[message.from];

    console.log(
      "[Whatsapp ChatGPT] Received prompt from " + message.from + ": " + prompt
    );

    const start = Date.now();

    // Check if we have a conversation with the user
    let response: ChatMessage;

    if (lastConversation) {
      // Handle message with previous conversation
      response = await api.sendMessage(prompt, lastConversation);
    } else {
      // Handle message with new conversation
      response = await api.sendMessage(prompt);
    }

    const end = Date.now() - start;

    console.log(
      `[Whatsapp ChatGPT] Answer to ${message.from}: ${response.text}  | OpenAI request took ${end}ms)`
    );

    // Set the conversation
    conversations[message.from] = {
      conversationId: response.conversationId,
      parentMessageId: response.id,
    };

    // Send the response to the chat
    message.reply(response.text);
  } catch (error: any) {
    console.error("An error occured", error);
    message.reply(
      "An error occured, please contact the administrator. (" +
        error.message +
        ")"
    );
  }
};
