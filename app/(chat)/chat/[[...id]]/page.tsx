import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";

import { auth } from "@/app/(auth)/auth";
import { Chat } from "@/components/chat";
import { getChatById, getMessagesByChatId } from "@/lib/db/queries";
import { DataStreamHandler } from "@/components/data-stream-handler";
import { DEFAULT_CHAT_MODEL } from "@/lib/ai/models";
import { convertToUIMessages, generateUUID } from "@/lib/utils";

interface PageProps {
  params?: { id?: string };
}

export default async function Page({
  params,
}: {
  params: Promise<{ id?: string[] }>;
}) {
  const resolvedParams = await params;
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  const cookieStore = await cookies();
  const chatModelFromCookie = cookieStore.get("chat-model");

  // If no id is provided -> create a new chat
  if (!resolvedParams?.id) {
    const id = generateUUID();

    return (
      <>
        <Chat
          key={id}
          id={id}
          initialMessages={[]}
          initialChatModel={chatModelFromCookie?.value ?? DEFAULT_CHAT_MODEL}
          initialVisibilityType="private"
          isReadonly={false}
          session={session}
          autoResume={false}
          apiEndpoint="/api/chat"
        />
        <DataStreamHandler />
      </>
    );
  }

  // Existing chat logic
  const { id } = resolvedParams;
  // const chat = await getChatById({ id });

  // Determine chatId
  const chatId = id?.[0] ?? generateUUID();

  // Load existing chat if any
  const chat = id ? await getChatById({ id: chatId }) : null;

  if (!chat) {
    notFound();
  }

  if (chat.visibility === "private" && session.user?.id !== chat.userId) {
    notFound();
  }

  const messagesFromDb = chat ? await getMessagesByChatId({ id: chatId }) : [];
  const uiMessages = convertToUIMessages(messagesFromDb);

  return (
    <>
      <Chat
        key={id}
        id={chat.id}
        initialMessages={uiMessages}
        initialChatModel={chatModelFromCookie?.value ?? DEFAULT_CHAT_MODEL}
        initialVisibilityType={chat.visibility}
        isReadonly={session.user?.id !== chat.userId}
        session={session}
        autoResume={true}
        apiEndpoint="/api/chat"
      />
      <DataStreamHandler />
    </>
  );
}
