// app/api/image/route.ts
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const { messages } = await req.json();
  const lastMessage = messages?.[messages.length - 1];

  if (!lastMessage || !lastMessage.parts?.length) {
    return new Response(JSON.stringify({ error: "Invalid request body" }), { status: 400 });
  }

  const prompt = lastMessage.parts[0].text;
  if (!prompt) return new Response(JSON.stringify({ error: "Missing prompt" }), { status: 400 });

  const AZURE_AI_STUDIO_ENDPOINT = "https://ki-studio.services.ai.azure.com";
  const DEPLOYMENT_NAME = "FLUX-1.1-pro";
  const API_VERSION = "2025-04-01-preview";
  const API_KEY = process.env.IMAGE_AZURE_API_KEY!;

  const url = `${AZURE_AI_STUDIO_ENDPOINT}/openai/deployments/${DEPLOYMENT_NAME}/images/generations?api-version=${API_VERSION}`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        prompt,
        n: 1,
        size: "1024x1024",
        output_format: "jpeg",
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Flux API error:", response.status, errorText);
      return new Response(JSON.stringify({ error: errorText }), { status: response.status });
    }

    const data = await response.json();
    const base64Image = data.data[0].b64_json;

    return new Response(
      JSON.stringify({
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
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    console.error("Image generation failed:", err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
