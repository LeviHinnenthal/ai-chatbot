// lib/ai/custom-flux-provider.ts

import { customProvider } from "ai";
import { loadApiKey, withoutTrailingSlash } from "@ai-sdk/provider-utils";
import { Buffer } from "buffer";

export interface FluxProviderSettings {
  /**
   * Your Flux API key. Falls back to the FLUX_API_KEY env var.
   */
  apiKey?: string;
  /**
   * Base URL for Flux API hosted on Azure AI Foundry.
   */
  baseURL?: string;
}

interface StartResponse {
  id?: string;
  [key: string]: any;
}

interface PollResponse {
  status: string;
  result?: { sample?: string };
  [key: string]: any;
}

interface GeneratedImage {
  base64: string;
  mimeType?: string;
}

export function createFluxProvider(options: FluxProviderSettings = {}) {
  const baseURL = withoutTrailingSlash(
    options.baseURL ?? "https://your-flux-hosted-azure-endpoint"
  );

  const apiKey = loadApiKey({
    apiKey: options.apiKey,
    environmentVariableName: "FLUX_API_KEY",
    description: "Flux AI API Key",
  });

  async function pollImage(id: string): Promise<string> {
    let resultUrl: string | null = null;

    for (let i = 0; i < 30; i++) {
      if (i > 0) await new Promise((res) => setTimeout(res, 1000));

      const pollRes = await fetch(
        `${baseURL}/v1/get_result?id=${encodeURIComponent(id)}`,
        { headers: { "X-Key": apiKey } }
      );

      const data: PollResponse = await pollRes.json();

      if (data.status === "Ready" && data.result?.sample) {
        resultUrl = data.result.sample;
        break;
      }

      if (data.status === "Failed") {
        throw new Error(
          `Flux image generation failed: ${JSON.stringify(data)}`
        );
      }
    }

    if (!resultUrl) throw new Error("Timed out or no image URL returned");
    return resultUrl;
  }

  function createDoGenerate(modelId: string) {
    return async ({ prompt }: { prompt: string }) => {
      // Start generation
      const startRes = await fetch(`${baseURL}/v1/${modelId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Key": apiKey,
        },
        body: JSON.stringify({
          prompt,
          width: 1024,
          height: 768,
          steps: 28,
          prompt_upsampling: false,
          seed: 42,
          guidance: 3,
          safety_tolerance: 2,
          output_format: "jpeg",
        }),
      });

      const startData: StartResponse = await startRes.json();
      const id = startData.id;
      if (!id) throw new Error("No generation ID returned from Flux");

      // Poll until ready
      const resultUrl = await pollImage(id);

      // Fetch and convert to base64
      const imgRes = await fetch(resultUrl);
      const buffer = await imgRes.arrayBuffer();
      const base64 = Buffer.from(buffer).toString("base64");

      return {
        images: [{ base64, mimeType: "image/jpeg" }],
        warnings: [],
        response: {
          timestamp: new Date(),
          modelId,
        },
      };
    };
  }

  const imageModels = {
    "flux-1.1-pro": {
      provider: "flux-azure",
      modelId: "flux-1.1-pro",
      maxImagesPerCall: 1,
      specificationVersion: "v1",
      doGenerate: createDoGenerate("flux-1.1-pro"),
    },
    "flux-kontext": {
      provider: "flux-azure",
      modelId: "flux-kontext",
      maxImagesPerCall: 1,
      specificationVersion: "v1",
      doGenerate: createDoGenerate("flux-kontext"),
    },
  };

  return customProvider({ imageModels });
}

/**
 * Default Flux provider instance.
 */
export const fluxProvider = createFluxProvider();
