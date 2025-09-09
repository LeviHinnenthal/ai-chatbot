import { tool } from "ai";

export const generateImageTool = {
  name: "generateImage",
  description: "Generate an image from a text prompt",
  parameters: {
    type: "object",
    properties: {
      prompt: {
        type: "string",
        description: "The description of the image to generate",
      },
      size: {
        type: "string",
        enum: ["256x256", "512x512", "1024x1024"],
        description: "Image size",
      },
      format: {
        type: "string",
        enum: ["jpeg", "png"],
        description: "Output format",
      },
    },
    required: ["prompt"],
    additionalProperties: false,
  },
  async execute({ prompt, size = "1024x1024", format = "jpeg" }) {
    const AZURE_AI_STUDIO_ENDPOINT = "https://ki-studio.services.ai.azure.com";
    const DEPLOYMENT_NAME = "FLUX-1.1-pro";
    const API_VERSION = "2025-04-01-preview";
    const API_KEY = process.env.IMAGE_AZURE_API_KEY!;

    const url = `${AZURE_AI_STUDIO_ENDPOINT}/openai/deployments/${DEPLOYMENT_NAME}/images/generations?api-version=${API_VERSION}`;

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({ prompt, n: 1, size, output_format: format }),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Image generation failed: ${text}`);
    }

    const buffer = await res.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");

    return {
      type: "tool-generateImage",
      state: "output-available",
      toolCallId: crypto.randomUUID(),
      input: { prompt },
      output: { image: base64 },
    };
  },
};

