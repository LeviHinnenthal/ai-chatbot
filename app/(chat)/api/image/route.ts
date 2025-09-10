import { NextRequest, NextResponse } from "next/server";
import { auth, type UserType } from "@/app/(auth)/auth";
import { ChatSDKError } from "@/lib/errors";

const IMAGE_AZURE_ENDPOINT = process.env.IMAGE_AZURE_ENDPOINT!;

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json();
    if (!prompt)
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );

    const response = await fetch(IMAGE_AZURE_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": process.env.IMAGE_AZURE_API_KEY!,
      },
      body: JSON.stringify({
        prompt,
        size: "1024x1024",
        n: 1,
      }),
    });

    const data = await response.json();
    console.log("=== /api/image route ===");
    console.log("Prompt:", prompt);
    console.log("Azure response:", data);

    const b64 = data?.data?.[0]?.b64_json;
    console.log("Base64 length:", b64?.length ?? "undefined");

    if (!b64) {
      console.error("Azure failed to return Base64:", data);
      return NextResponse.json(
        { error: "Azure failed", details: data },
        { status: 500 }
      );
    }

    // Convert Base64 to data URL
    const imageUrl = `data:image/png;base64,${b64}`;

    // 👇 Add a debug log here
    console.log("🟢 Returning from /api/image:", {
      length: imageUrl.length,
      preview: imageUrl.substring(0, 100) + "...",
    });

    return NextResponse.json({ imageUrl });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { error: "Server error", details: err.message },
      { status: 500 }
    );
  }
}
