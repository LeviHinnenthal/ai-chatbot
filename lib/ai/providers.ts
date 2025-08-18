import {
  customProvider,
  extractReasoningMiddleware,
  wrapLanguageModel,
} from 'ai';
import { createAzure } from "@ai-sdk/azure";
import { openai } from "@ai-sdk/openai";
import { isTestEnvironment } from '../constants';


export const azureProvider = createAzure({
  apiKey: process.env.AZURE_API_KEY!,
  baseURL: process.env.AZURE_RESOURCE_NAME,
  fetch: async (url, options) => {
    console.log("🔍 Request URL:", url);
    console.log("📝 Request Options:", options);

    const response = await fetch(url, options);

    const clone = response.clone(); // Clone so we can read the body twice
    const responseBody = await clone.text();
    console.log("📩 Response Body:", responseBody);

    return response;
  },
});

export const myProvider = customProvider({
      languageModels: {
        'chat-model': openai("gpt-4o"),
        'chat-model-reasoning': wrapLanguageModel({
          model: azureProvider("gpt-5-mini"),
          middleware: extractReasoningMiddleware({ tagName: 'think' }),
        }),
        'title-model': azureProvider("gpt-5-mini"),
        'artifact-model': azureProvider("gpt-5-mini"),
      },
      // imageModels: {
      //   'small-model': azureProvider("gpt-5-mini"),
      // },
    });
