// route.ts
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const { messages } = await req.json();
  const lastMessage = messages?.[messages.length - 1];

  if (!lastMessage || !lastMessage.parts || lastMessage.parts.length === 0) {
    return new Response(
      JSON.stringify({ error: "Invalid request body" }),
      { status: 400 }
    );
  }

  const prompt = lastMessage.parts[0].text;

  const AZURE_AI_STUDIO_ENDPOINT = "https://ki-studio.services.ai.azure.com";
  const AZURE_API_KEY = process.env.IMAGE_AZURE_API_KEY;
  const DEPLOYMENT_NAME = "FLUX-1.1-pro";

  const url = `${AZURE_AI_STUDIO_ENDPOINT}/openai/deployments/${DEPLOYMENT_NAME}/images/generations?api-version=2025-04-01-preview`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${AZURE_API_KEY}`,
      },
      body: JSON.stringify({
        prompt,
        output_format: "b64_json",
        n: 1,
        size: "1024x1024",
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Azure API error:", response.status, errorText);
      throw new Error(`Failed to generate image: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const base64Image = data.data[0].b64_json;

    // ✅ Return in AI tool-call format
    return new Response(JSON.stringify({
      role: "assistant",
      id: crypto.randomUUID(),
      parts: [
        {
          type: "tool-generateImage",
          state: "output-available",
          toolCallId: crypto.randomUUID(),
          input: { prompt },
          output: { image: base64Image },
        },
      ],
    }), { headers: { "Content-Type": "application/json" } });
  } catch (error: any) {
    console.error("Image generation failed:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
