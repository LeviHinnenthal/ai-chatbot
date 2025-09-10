import {
  convertToModelMessages,
  type InferUITools,
  stepCountIs,
  streamText,
  type UIMessage,
  experimental_generateImage,
  tool,
} from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";
import { azureProviderImage, azureProvider } from "@/lib/ai/providers";

const modelImage = azureProviderImage("FLUX-1.1-pro");
const modelText = azureProvider("gpt-5-mini");

export type ChatTools = InferUITools<typeof tools>;

export async function POST(request: Request) {
  const { messages }: { messages: UIMessage[] } = await request.json();
  try {
    const url = new URL(request.url);

    // Define image generation tool
    const generateImageTool = tool({
      description: "Generate an image from a prompt",
      inputSchema: z.object({
        prompt: z.string().describe("The prompt to generate the image from"),
      }),
      execute: async ({ prompt }) => {
        const { image } = await experimental_generateImage({
          model: azureProviderImage("FLUX-1.1-pro"),
          prompt,
        });
        // Return base64; in production you might save to blob storage and return a URL
        return { image: image.base64, prompt };
      },
    });

    const tools = {
      generateImageTool,
    };

    const result = streamText({
      model: openai("gpt-4o"),
      messages: convertToModelMessages(messages),
      stopWhen: stepCountIs(5),
      tools,
    });

    return result.toUIMessageStreamResponse();
  } catch (err: any) {
    console.error(err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
