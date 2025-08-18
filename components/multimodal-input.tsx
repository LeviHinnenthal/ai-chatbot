"use client";

import {
  memo,
  useRef,
  useState,
  useEffect,
  useCallback,
  type Dispatch,
  type SetStateAction,
  type ChangeEvent,
} from "react";
import { toast } from "sonner";
import { useLocalStorage, useWindowSize } from "usehooks-ts";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowDown, Paperclip, Square, Send } from "lucide-react";

import type { UIMessage } from "ai";
import type { UseChatHelpers } from "@ai-sdk/react";
import type { VisibilityType } from "./visibility-selector";
import type { Attachment, ChatMessage } from "@/lib/types";

import { PreviewAttachment } from "./preview-attachment";
import { SuggestedActions } from "./suggested-actions";
import { useScrollToBottom } from "@/hooks/use-scroll-to-bottom";

import {
  PromptInput,
  PromptInputTextarea,
  PromptInputToolbar,
  PromptInputTools,
  PromptInputButton,
  PromptInputSubmit,
  PromptInputModelSelect,
  PromptInputModelSelectContent,
  PromptInputModelSelectItem,
  PromptInputModelSelectTrigger,
  PromptInputModelSelectValue,
} from "@/components/ai-elements/prompt-input";
import { Suggestions, Suggestion } from "@/components/ai-elements/suggestion";
import { sub } from "date-fns";

function PureMultimodalInput({
  chatId,
  input,
  setInput,
  status,
  stop,
  attachments,
  setAttachments,
  messages,
  setMessages,
  sendMessage,
  selectedVisibilityType,
}: {
  chatId: string;
  input: string;
  setInput: Dispatch<SetStateAction<string>>;
  status: UseChatHelpers<ChatMessage>["status"];
  stop: () => void;
  attachments: Array<Attachment>;
  setAttachments: Dispatch<SetStateAction<Array<Attachment>>>;
  messages: Array<UIMessage>;
  setMessages: UseChatHelpers<ChatMessage>["setMessages"];
  sendMessage: UseChatHelpers<ChatMessage>["sendMessage"];
  selectedVisibilityType: VisibilityType;
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { width } = useWindowSize();
  const [localStorageInput, setLocalStorageInput] = useLocalStorage(
    "input",
    ""
  );
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadQueue, setUploadQueue] = useState<Array<string>>([]);
  const { isAtBottom, scrollToBottom } = useScrollToBottom();

  // Model selector state
  const [model, setModel] = useState("gpt-5-mini");
  const models = [
    { value: "gpt-5-mini", name: "GPT-5-mini" },
    { value: "gpt-5nano", name: "GPT-5-nano" },
  ];

  useEffect(() => {
    if (textareaRef.current) {
      setInput(textareaRef.current.value || localStorageInput || "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setLocalStorageInput(input);
  }, [input, setLocalStorageInput]);

  const handleInput = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(event.target.value);
  };

  const resetHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "98px";
    }
  };

  const submitForm = useCallback(
    (textOverride?: string) => {
      const textToSend = textOverride ?? input;
      if (!textToSend && attachments.length === 0) return;

      window.history.replaceState({}, "", `/chat/${chatId}`);

      sendMessage({
        role: "user",
        parts: [
          ...attachments.map((attachment) => ({
            type: "file" as const,
            url: attachment.url,
            name: attachment.name,
            mediaType: attachment.contentType,
          })),
          { type: "text", text: textToSend },
        ],

        // optionally: metadata: { model }
      });

      setAttachments([]);
      setLocalStorageInput("");
      resetHeight();
      setInput("");

      if (width && width > 768) textareaRef.current?.focus();
    },
    [
      input,
      attachments,
      sendMessage,
      chatId,
      setInput,
      setAttachments,
      setLocalStorageInput,
      width,
      model,
    ]
  );

  const uploadFile = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/files/upload", {
        method: "POST",
        body: formData,
      });
      if (response.ok) {
        const data = await response.json();
        return {
          url: data.url,
          name: data.pathname,
          contentType: data.contentType,
        };
      }
      const { error } = await response.json();
      toast.error(error);
    } catch {
      toast.error("Failed to upload file, please try again!");
    }
  };
  const suggestions = [
    "Here come the suggestions",
    "Tell me a joke",
    "Summarize this for me",
    "Whats the weather like?",
    "Whats the weather like?",
    "Whats the weather like?",
  ];

  const handleFileChange = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(event.target.files || []);
      setUploadQueue(files.map((file) => file.name));

      try {
        const uploadPromises = files.map((file) => uploadFile(file));
        const uploadedAttachments = await Promise.all(uploadPromises);
        const successful = uploadedAttachments.filter(Boolean) as Attachment[];
        setAttachments((curr) => [...curr, ...successful]);
      } finally {
        setUploadQueue([]);
      }
    },
    [setAttachments]
  );

  useEffect(() => {
    if (status === "submitted") scrollToBottom();
  }, [status, scrollToBottom]);

  return (
    <div className="relative w-full flex flex-col gap-1">
      {/* Scroll-to-bottom floating button */}
      <AnimatePresence>
        {!isAtBottom && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute left-1/2 bottom-48 -translate-x-1/2 z-50"
          >
            <PromptInputButton
              variant="outline"
              onClick={(e) => {
                e.preventDefault();
                scrollToBottom();
              }}
            >
              <ArrowDown size={16} />
            </PromptInputButton>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Suggestions */}

      <Suggestions>
        {suggestions.map((s, i) => (
          <Suggestion
            key={i}
            suggestion={s}
            onClick={(suggestion) => submitForm(suggestion)}
          />
        ))}
      </Suggestions>
      {/* Hidden file input */}
      <input
        type="file"
        className="hidden"
        ref={fileInputRef}
        multiple
        onChange={handleFileChange}
      />
      {/* Attachments preview */}
      {(attachments.length > 0 || uploadQueue.length > 0) && (
        <div className="flex flex-row gap-2 overflow-x-scroll items-end">
          {attachments.map((attachment) => (
            <PreviewAttachment key={attachment.url} attachment={attachment} />
          ))}
          {uploadQueue.map((filename) => (
            <PreviewAttachment
              key={filename}
              attachment={{ url: "", name: filename, contentType: "" }}
              isUploading
            />
          ))}
        </div>
      )}
      {/* Main input */}
      <PromptInput onSubmit={submitForm} className="mt-2">
        <PromptInputTextarea
          ref={textareaRef}
          placeholder="Send a message..."
          onChange={handleInput}
          value={input}
          onKeyDown={(e) => {
            if (
              e.key === "Enter" &&
              !e.shiftKey &&
              !e.nativeEvent.isComposing
            ) {
              e.preventDefault();
              if (status !== "ready")
                toast.error(
                  "Please wait for the model to finish its response!"
                );
              else submitForm();
            }
          }}
        />

        <PromptInputToolbar>
          <PromptInputTools>
            {/* Attachments */}
            <PromptInputButton
              variant="ghost"
              onClick={(e) => {
                e.preventDefault();
                fileInputRef.current?.click();
              }}
              disabled={status !== "ready"}
            >
              <Paperclip size={16} />
            </PromptInputButton>

            {/* Stop */}
            {status === "submitted" && (
              <PromptInputButton onClick={stop}>
                <Square size={16} />
              </PromptInputButton>
            )}

            {/* Model Selector */}
            {/* <PromptInputModelSelect onValueChange={setModel} value={model}>
              <PromptInputModelSelectTrigger>
                <PromptInputModelSelectValue />
              </PromptInputModelSelectTrigger>
              <PromptInputModelSelectContent>
                {models.map((m) => (
                  <PromptInputModelSelectItem key={m.value} value={m.value}>
                    {m.name}
                  </PromptInputModelSelectItem>
                ))}
              </PromptInputModelSelectContent>
            </PromptInputModelSelect> */}
          </PromptInputTools>

          {/* Submit */}
          <PromptInputSubmit
            disabled={!input || uploadQueue.length > 0}
            status={status}
          >
            <Send size={16} />
          </PromptInputSubmit>
        </PromptInputToolbar>
      </PromptInput>
    </div>
  );
}

export const MultimodalInput = memo(PureMultimodalInput);
