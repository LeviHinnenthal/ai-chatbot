// app/image/[id]/page.tsx
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";

import { auth } from "@/app/(auth)/auth";
import { Chat } from "@/components/chat";
import { getChatById, getMessagesByChatId } from "@/lib/db/queries";
import { DataStreamHandler } from "@/components/data-stream-handler";
import { DEFAULT_CHAT_MODEL } from "@/lib/ai/models";
import { convertToUIMessages, generateUUID } from "@/lib/utils";
import type { ChatMessage } from "@/lib/types";

interface PageProps {
  params?: { id?: string };
}

export default async function Page({ params }: PageProps) {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  // Define a default model for image generation if needed
  const DEFAULT_IMAGE_MODEL = "gpt-4o";

  const cookieStore = await cookies();
  const imageModelFromCookie = cookieStore.get("image-model");

  // If no id is provided -> create a new chat
  if (!params?.id) {
    const id = generateUUID();
    return (
      <>
        <Chat
          key={id}
          id={id}
          initialMessages={[]}
          initialChatModel={imageModelFromCookie?.value ?? DEFAULT_IMAGE_MODEL}
          initialVisibilityType="private"
          isReadonly={false}
          session={session}
          autoResume={false}
          apiEndpoint="/api/image" // <-- Pass the image generation endpoint
        />
        <DataStreamHandler />
      </>
    );
  }

  // Existing chat logic (same as the text page)
  const { id } = params;
  const chat = await getChatById({ id });

  if (!chat) {
    notFound();
  }

  if (chat.visibility === "private" && session.user?.id !== chat.userId) {
    notFound();
  }

  const messagesFromDb = await getMessagesByChatId({ id });
  // The UI messages need to be formatted correctly for the image chat
  const uiMessages = convertToUIMessages(messagesFromDb);

  return (
    <>
      <Chat
        key={id}
        id={chat.id}
        initialMessages={uiMessages}
        initialChatModel={imageModelFromCookie?.value ?? DEFAULT_IMAGE_MODEL}
        initialVisibilityType={chat.visibility}
        isReadonly={session.user?.id !== chat.userId}
        session={session}
        autoResume={true}
        apiEndpoint="/api/image" // <-- Pass the image generation endpoint
      />
      <DataStreamHandler />
    </>
  );
}
