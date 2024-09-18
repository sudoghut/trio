import React, { useEffect, useRef } from 'react';
import * as webllm from "@mlc-ai/web-llm";

interface ChatSectionProps {
  selectedTask: string;
  onRunTask: () => void;
  outputValue: string;
}

const ChatSection: React.FC<ChatSectionProps> = ({ selectedTask, onRunTask, outputValue }) => {
  const chatBoxRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    interface EngineProgressReport {
      progress: number;
      text: string;
    }
    
    const engine = new webllm.MLCEngine();

    const onMessageSend = function onMessageSend(): void {
      let messages = [
        {
          content: "You are a useful llm model",
          role: "system",
        },
      ];
      const inputElement = document.getElementById("user-input") as HTMLInputElement;
      const input = inputElement ? inputElement.value.trim() : '';
      const message = {
        content: input,
        role: "user",
      };
      messages.push(message);

      if (input.length === 0) {
        return;
      }
      
      const sendButton = document.getElementById("send") as HTMLButtonElement;
      sendButton.disabled = true;

      const onFinishGenerating = (finalMessage: any, usage: any) => {
        updateLastMessage(finalMessage);
        sendButton.disabled = false;

        const usageText =
          `prompt_tokens: ${usage.prompt_tokens}, ` +
          `completion_tokens: ${usage.completion_tokens}, ` +
          `prefill: ${usage.extra.prefill_tokens_per_s.toFixed(4)} tokens/sec, ` +
          `decoding: ${usage.extra.decode_tokens_per_s.toFixed(4)} tokens/sec`;

        const chatStatsElement = document.getElementById("status");
        if (chatStatsElement) {
          chatStatsElement.textContent = usageText;
        }
      };

      streamingGenerating(messages, updateLastMessage, onFinishGenerating, console.error);
    };

    const sendButton = document.getElementById("send") as HTMLButtonElement;
    if (sendButton) {
      sendButton.addEventListener("click", onMessageSend);
    }

    const copyButton = document.getElementById("copy") as HTMLButtonElement;
    if (copyButton) {
      copyButton.addEventListener("click", () => {
        const inputElement = document.getElementById("user-input") as HTMLInputElement;
        if (inputElement) inputElement.value = "";
        const chatBox = chatBoxRef.current;
        if (chatBox) {
          if (navigator.clipboard) {
            navigator.clipboard.writeText(chatBox.value)
              .then(() => {
                const chatStatsElement = document.getElementById("status");
                if (chatStatsElement) {
                  chatStatsElement.textContent = 'Text copied to clipboard';
                }
              })
              .catch(err => {
                const chatStatsElement = document.getElementById("status");
                if (chatStatsElement) {
                  chatStatsElement.textContent = "Failed to copy text";
                }
                console.error('Failed to copy text: ', err);
              });
          } else {
            console.error("Clipboard API not supported");
          }
        }
      });
    }

    const updateEngineInitProgressCallback = (report: EngineProgressReport): void => {
      const downloadStatus = document.getElementById("status");
      if (downloadStatus) {
        downloadStatus.textContent = report.text;
      }
    };

    engine.setInitProgressCallback(updateEngineInitProgressCallback);

    const initializeWebLLMEngine = async (): Promise<void> => {
      const selectedModel = "Qwen2-0.5B-Instruct-q4f16_1-MLC";
      const config = {
        temperature: 1,
        top_p: 0.6,
      };
      await engine.reload(selectedModel, config);
    };

    initializeWebLLMEngine().then(() => {
      const sendButton = document.getElementById("send") as HTMLButtonElement;
      if (sendButton) {
        sendButton.disabled = false;
      }
    });

    const streamingGenerating = async (
      messages: any[],
      onUpdate: (message: string) => void,
      onFinish: (finalMessage: string, usage: any) => void,
      onError: (error: any) => void
    ): Promise<void> => {
      try {
        let curMessage = "";
        let usage: any;
        const completion = await engine.chat.completions.create({
          stream: true,
          messages,
          stream_options: { include_usage: true },
        });

        for await (const chunk of completion) {
          const curDelta = chunk.choices[0]?.delta.content;
          if (curDelta) {
            curMessage += curDelta;
          }
          if (chunk.usage) {
            usage = chunk.usage;
          }
          onUpdate(curMessage);
        }

        const finalMessage = await engine.getMessage();
        onFinish(finalMessage, usage);
      } catch (err) {
        onError(err);
      }
    };

    const updateLastMessage = (content: string) => {
      const chatBox = document.getElementById("chat-box") as HTMLTextAreaElement;
      if (chatBox) {
        chatBox.value = content;
      }
    };

  }, []);

  return (
    <div className="w-full">
      <div className='mb-3 mt-1 items-left'>
        <label className="text-lg text-gray-800 dark:text-gray-200">Task: </label>
        <label className="text-lg text-gray-800 dark:text-gray-200">{selectedTask || "No Task"}</label>
      </div>
      <div className="flex space-x-4">
        <button onClick={onRunTask} className="p-2 text-base font-semibold text-white bg-blue-500 rounded-md shadow-md dark:bg-blue-700">Run Me&Below</button>
        <button className="p-2 text-base font-semibold text-white bg-blue-500 rounded-md shadow-md dark:bg-blue-700">Run Me</button>
        <button className="p-2 text-base font-semibold text-white bg-blue-500 rounded-md shadow-md dark:bg-blue-700" id="copy">Copy Result</button>
      </div>
      <textarea
        className="w-full p-2 text-lg bg-gray-100 rounded-lg dark:bg-zinc-800/30 h-30 mt-6"
        value={outputValue}
        placeholder="Output"
        readOnly
      />
    </div>
  );
};

export default ChatSection;
