import { put } from "@vercel/blob";

export async function saveImageToBlob(
  base64Image: string,
  filename: string
): Promise<string> {
  // Convert base64 to buffer
  const buffer = Buffer.from(base64Image, "base64");

  try {
    const { url } = await put(filename, buffer, {
      access: "public",
      contentType: "image/png",
    });

    return url;
  } catch (error) {
    console.error("Failed to save image to blob storage:", error);
    throw error;
  }
}
