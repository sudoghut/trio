import React, { useState, useEffect, useRef } from 'react';
import * as webllm from "@mlc-ai/web-llm";
import TaskList from './taskList';


const ChatSection = () => {
    const [showTasks, setShowTasks] = useState(false); // State to show/hide the TaskList component
    const [selectedTask, setSelectedTask] = useState<string | null>(null); // State to keep track of the selected task title

    const chatBoxRef = useRef<HTMLTextAreaElement>(null);

    const handleLoadTasks = () => {
        setShowTasks(!showTasks); // Toggle the TaskList visibility
    };

    const handleCloseTaskList = () => {
        setShowTasks(false); // Close the TaskList component
    };

    const handleSelectTask = (task: string) => {
        setSelectedTask(task); // Set the selected task title
        setShowTasks(false); // Close the TaskList once a task is selected
    };

    useEffect(() => {
        interface EngineProgressReport {
            progress: number;
            text: string;
            }
        const engine = new webllm.MLCEngine();
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
        const sendButton = document.getElementById("send") as HTMLButtonElement;
        if (sendButton) {
          sendButton.disabled = true;
          sendButton.addEventListener("click", onMessageSend);
        }
        
        const copyButton = document.getElementById("copy") as HTMLButtonElement;
        if (copyButton) {
          copyButton.addEventListener("click", () => {
            const inputElement = document.getElementById("user-input") as HTMLInputElement;
            inputElement.value = "";
            const chatBox = chatBoxRef.current;
            // const chatBox = document.getElementById("chat-box") as HTMLTextAreaElement;
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
        <div className="flex flex-col items-center justify-center w-full max-w-5xl p-8 bg-white rounded-xl shadow-lg dark:bg-zinc-800/30 lg:space-y-0 lg:gap-4 lg:p-8 lg:bg-gray-200 lg:dark:bg-zinc-800/30">
            <div className='mb-3 mt-1 items-left'>
                <div className='pb-3'>
                    {/* Conditionally render TaskList */}
                    {showTasks && (
                        <TaskList onSelectTask={handleSelectTask} />
                    )}
                </div>
                <label className="text-lg text-gray-800 dark:text-gray-200">Task: </label>
                <label className="text-lg text-gray-800 dark:text-gray-200" id="task-name">{selectedTask || "No Task"}</label>    
                <button onClick={handleLoadTasks} className="p-1 ml-5 text-base font-semibold text-white bg-blue-500 rounded-md shadow-md dark:bg-blue-700 whitespace-nowrap transform active:scale-95 transition-transform duration-150">{showTasks ? "Hide Tasks" : "Load Tasks"}</button>
            </div>
            <div className="flex space-x-4">
                <button className="p-2 text-base font-semibold text-white bg-blue-500 rounded-md shadow-md dark:bg-blue-700 whitespace-nowrap transform active:scale-95 transition-transform duration-150" id="send">Run Me&Below</button>
                <button className="p-2 text-base font-semibold text-white bg-blue-500 rounded-md shadow-md dark:bg-blue-700 whitespace-nowrap transform active:scale-95 transition-transform duration-150">Run Me</button>
                <button className="p-2 text-base font-semibold text-white bg-blue-500 rounded-md shadow-md dark:bg-blue-700 whitespace-nowrap transform active:scale-95 transition-transform duration-150" id="copy">Copy Result</button>
          </div>
          <textarea className="w-full p-2 text-lg bg-gray-100 rounded-lg dark:bg-zinc-800/30 h-30 mt-6" id="chat-box" placeholder="Output" readOnly/>
        </div>
    );
    }

export default ChatSection;