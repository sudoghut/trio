  "use client"; 
  import { useEffect, useRef } from 'react';
  // import * as webllm from "https://esm.run/@mlc-ai/web-llm";
  import * as webllm from "@mlc-ai/web-llm";

  export default function Home() {
    const handleSend = () => {
      const sendButton = document.getElementById('send') as HTMLButtonElement;
      sendButton?.click();
    };
    const handleCopy = () => {
      const copyButton = document.getElementById('copy') as HTMLButtonElement;
      copyButton?.click();
    };

    const chatBoxRef = useRef<HTMLTextAreaElement>(null);
    interface EngineProgressReport {
      progress: number;
      text: string;
    }
    const engine = new webllm.MLCEngine();
    const runOnPageLoad = () => {
      if (chatBoxRef.current) {
        chatBoxRef.current.focus();
      }

      const sendButton = document.getElementById("send") as HTMLButtonElement;
      if (sendButton) {
        sendButton.disabled = true;
        sendButton.addEventListener("click", onMessageSend);
      }
      
      const clearCacheButton = document.getElementById("clear-cache") as HTMLButtonElement;
      if (clearCacheButton) {
        clearCacheButton.addEventListener("click", async () => {
          if ('caches' in window) {
            const cacheNames = await caches.keys();
            cacheNames.forEach(async (cacheName) => {
              await caches.delete(cacheName);
            });
            const chatStatsElement = document.getElementById("status");
            if (chatStatsElement) {
              chatStatsElement.textContent = 'Cache Storage cleared';
            }
          } else {
            const chatStatsElement = document.getElementById("status");
            if (chatStatsElement) {
              chatStatsElement.textContent = "Cache API not supported";
            }
          };
          window.location.reload();
        });

      }

      const copyButton = document.getElementById("copy") as HTMLButtonElement;
      if (copyButton) {
        copyButton.addEventListener("click", () => {
          const inputElement = document.getElementById("user-input") as HTMLInputElement;
          inputElement.value = "";

          const chatBox = document.getElementById("chat-box") as HTMLTextAreaElement;
          if (chatBox) {
            const chatStatsElement = document.getElementById("status");
            if (navigator.clipboard) {
              navigator.clipboard.writeText(chatBox.value)
                .then(() => {
                  if (chatStatsElement) {
                    chatStatsElement.textContent = 'Text copied to clipboard';
                  }
                })
                .catch(err => {
                  if (chatStatsElement) {
                    chatStatsElement.textContent = "Failed to copy text";
                  }
                  console.error('Failed to copy text: ', err);
                });
            } else {
              console.error("Clipboard API not supported");
              if (chatStatsElement) {
                chatStatsElement.textContent = "Clipboard API not supported";
              }
            }
          }
        });
      }
      
      const updateEngineInitProgressCallback = (report: EngineProgressReport): void => {
        // console.log("initialize", report.progress);
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
    };
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
    const onMessageSend = function onMessageSend(): void {
      // let messages = [
      //   {
      //     content: "You are tasked with rewriting text in a neutral, declarative tone. Your objective is to remove all expressions of strong emotions, subjective opinions, and replace any emotionally charged punctuation, such as exclamation marks or emphatic question marks, with neutral alternatives. Preserve the original meaning while ensuring the text cannot be easily linked to the original author's distinctive style. Avoid poetic, exaggerated, or emotionally loaded language. Your output should reflect a calm, objective, and clear tone.",
      //     role: "system",
      //   },
      // ];
      let messages = [
        {
          content: "You are a useful llm model",
          role: "system",
        },
      ];
      const inputElement = document.getElementById("user-input") as HTMLInputElement;
      // const prompt_prefix = "Rewrite the provided text only in its original language, without translating or altering the meaning. Remove any personal bias, vulgar language, and emotional expressions. If none of these elements are present, return the text exactly as it was provided. Do not translate or change the language in any way. Provide the rewritten text below: "
      const prompt_prefix = ""
      const input = prompt_prefix + inputElement.value.trim();
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
    
    const appendMessage = (message: { content: string; role: string }) => {
      const chatBox = document.getElementById("chat-box") as HTMLElement;
      const container = document.createElement("div");
      container.classList.add("message-container");
      
      const newMessage = document.createElement("div");
      newMessage.classList.add("message");
      newMessage.textContent = message.content;
    
      if (message.role === "user") {
        container.classList.add("user");
      } else {
        container.classList.add("assistant");
      }
    
      container.appendChild(newMessage);
      chatBox?.appendChild(container);
      chatBox.scrollTop = chatBox.scrollHeight; // Scroll to the latest message
    };
    
    const updateLastMessage = (content: string) => {
      const chatBox = document.getElementById("chat-box") as HTMLTextAreaElement;
      if (chatBox) {
        chatBox.value = content;
      }
    };
    
    useEffect(() => {
      runOnPageLoad();
      const handleKeyDown = (event: KeyboardEvent) => {
        if ((event.ctrlKey && event.key === 'Enter') ||  (event.metaKey && event.key === 'Enter')) {
          handleSend();
        }
        // Detect Copy shortcut for both Windows (Ctrl+Shift+C) and Mac (Cmd+Shift+C)
        if ((event.altKey && event.shiftKey && event.code === 'KeyC') || (event.ctrlKey && event.shiftKey && event.code === 'KeyC') || (event.metaKey && event.shiftKey && event.code === 'KeyC')) {
          handleCopy();
          // console.log('Ctrl + Shift + C pressed!');
        }
      };
      // console.log(event);
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        window.removeEventListener('keydown', handleKeyDown);
      };
    }, []); // Empty dependency array ensures it runs only once on mount

    return (
      <main className="flex min-h-screen flex-col items-center justify-between lg:p-24 md:p-24 sm:p-5">
        <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex">
          <p className="fixed left-0 top-0 flex w-full justify-center bg-gradient-to-b from-zinc-200 pb-6 pt-8 backdrop-blur-2xl dark:bg-zinc-800/30 dark:from-inherit lg:static lg:w-auto  lg:rounded-xl lg:bg-gray-200 lg:p-4 lg:dark:bg-zinc-800/30 text-lg">
          Blend into the Crowd - by oopus
          </p>
        </div>
        <div className="flex flex-col items-center justify-center w-full max-w-5xl p-8 space-y-4 bg-white rounded-xl shadow-lg dark:bg-zinc-800/30 lg:space-y-0 lg:gap-4 lg:p-8 lg:bg-gray-200 lg:dark:bg-zinc-800/30">
          <textarea className="w-full p-2 text-lg bg-gray-100 rounded-lg dark:bg-zinc-800/30 h-30" id="user-input" placeholder="Put your text here" ref={chatBoxRef}/>
          <p className="w-full p-2 text-lg bg-gray-100 rounded-lg dark:bg-zinc-800/30">
          <label className="text-sm text-gray-800 dark:text-gray-200">Status: </label>
          <label className="text-sm text-gray-800 dark:text-gray-200" id="status">No Error</label>
          </p>
          <p className="flex space-x-4">
          <button className="p-2 text-base font-semibold text-white bg-blue-500 rounded-md shadow-md dark:bg-blue-700 whitespace-nowrap transform active:scale-95 transition-transform duration-150" id="send">Convert</button>
          <button className="p-2 text-base font-semibold text-white bg-blue-500 rounded-md shadow-md dark:bg-blue-700 whitespace-nowrap transform active:scale-95 transition-transform duration-150" id="copy">Copy Result</button>
          <button className="p-2 text-base font-semibold text-white bg-blue-500 rounded-md shadow-md dark:bg-yellow-700 whitespace-nowrap transform active:scale-95 transition-transform duration-150" id="clear-cache">Clear Cache</button>
          </p>
          <textarea className="w-full p-2 text-lg bg-gray-100 rounded-lg dark:bg-zinc-800/30 h-30 mt-6" id="chat-box" placeholder="Output" readOnly/>
        </div>

        <div className="mb-32 grid text-center lg:mb-0 lg:w-full lg:max-w-5xl lg:grid-cols-4 lg:text-left">

        </div>
      </main>
    );
  }
