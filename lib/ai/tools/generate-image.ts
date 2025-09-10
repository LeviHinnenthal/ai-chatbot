export async function generateImageTool({
  input,
}: {
  input: { prompt: string };
}) {
  console.log("=== generateImageTool ===");
  console.log("Calling /api/image with input:", input);

  console.log("Sending prompt:", input.prompt);
  const res = await fetch(`http://localhost:3000/api/image`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt: input.prompt }),
    cache: "no-store", // ensures fresh request
    credentials: "omit", // <-- important
  });

  console.log("Response status:", res.status);

  const data = await res.json();
  console.log("Data received from /api/image:", data);

  if (!res.ok || !data.imageUrl) {
    throw new Error("Image generation failed");
  }
  console.log("Tool returning imageUrl:", data.imageUrl);
  return { imageUrl: data.imageUrl };
}
