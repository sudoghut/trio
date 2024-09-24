"use client"; 
import { useState } from 'react';
import { useEffect, useRef } from 'react';
import StatusAndCleanButton from './components/statusAndCleanButton';
import ChatSection from './components/chatSection';
import TaskList from './components/taskList';
import * as webllm from "@mlc-ai/web-llm";

const engine = new webllm.MLCEngine();

export default function Home() {

  const runAllTasks = async () => {
    for (let i = 0; i < sectionStates.length; i++) {
      await runTaskForSection(i);
    }
  };

  // const chatBoxRef = useRef<HTMLTextAreaElement>(null);
  const [sectionStates, setSectionStates] = useState([
    { selectedTask: 'No Task', inputValue: '', outputValue: '' },
    { selectedTask: 'No Task', inputValue: '', outputValue: '' },
    { selectedTask: 'No Task', inputValue: '', outputValue: '' }
  ]);

  interface SectionState {
    selectedTask: string;
    inputValue: string;
    outputValue: string;
  }

  const setSectionStatesAsync = (
    newStatus: SectionState[]
  ): Promise<SectionState[]> => {
    return new Promise((resolve) => {
      setSectionStates(newStatus); // update state with the correct type
      resolve(newStatus);
    });
  };
  

  const [taskListVisibility, setTaskListVisibility] = useState([false, false, false]); // Array of booleans for task list visibility

  const runLLMEngine = async (input: string, index: number, systemPrompt: string, prompt: string, llmName: string, llmTemp: number, llmTopP: number): Promise<void> => {
    console.log("1-2 Running LLM Engine");
    let output = "";

    interface EngineProgressReport {
        progress: number;
        text: string;
    }

    const updateEngineInitProgressCallback = (report: EngineProgressReport): void => {
        const downloadStatus = document.getElementById("status");
        if (downloadStatus) {
            downloadStatus.textContent = report.text;
        }
    };

    engine.setInitProgressCallback(updateEngineInitProgressCallback);

    const initializeWebLLMEngine = async (): Promise<void> => {
        const selectedModel = llmName;
        const config = {
            temperature: llmTemp,
            top_p: llmTopP,
        };
        await engine.reload(selectedModel, config);
    };

    const streamingGenerating = async (
        messages: any[],
        onUpdate: (message: string) => void,
        onFinish: (finalMessage: string, usage: any) => void,
        onError: (error: any) => void
    ): Promise<void> => {
        console.log("1-3 Streaming Generating");
        await initializeWebLLMEngine();
        try {
            let curMessage = "";
            let usage: any;
            const completion = await engine.chat.completions.create({
                stream: true,
                messages,
                stream_options: { include_usage: true },
            });
            console.log("1-4 Completion");
            for await (const chunk of completion) {
                console.log("1-5 Chunk...");
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
        console.log("1-6 Updating Last Message");
        output = content;
        setSectionStates(prevStates => {
            const newSectionStates = [...prevStates];
            newSectionStates[index].outputValue = output; // Update output value continuously
            return newSectionStates;
        });
    };

    let messages = [
        {
            content: systemPrompt,
            role: "system",
        },
    ];
    const message = {
        content: prompt + input,
        role: "user",
    };
    messages.push(message);

    if (input.length === 0) {
        return;
    }

    const onFinishGenerating = async (finalMessage: any, usage: any) => {
        console.log("1-7 Finishing Generating");
        updateLastMessage(finalMessage);
        console.log("1-8 finishe updateLastMessage");
        const usageText =
            `prompt_tokens: ${usage.prompt_tokens}, ` +
            `completion_tokens: ${usage.completion_tokens}, ` +
            `prefill: ${usage.extra.prefill_tokens_per_s.toFixed(4)} tokens/sec, ` +
            `decoding: ${usage.extra.decode_tokens_per_s.toFixed(4)} tokens/sec`;

        const chatStatsElement = document.getElementById("status");
        if (chatStatsElement) {
            chatStatsElement.textContent = usageText;
        }
        console.log("1-9 Usage Text");
        const updatedStates = [...sectionStates];
        if (updatedStates[index + 1]) {
          updatedStates[index + 1].inputValue = output; // Update output value continuously
        }
        console.log("1-10 New Section States - final");
        const newSectionStates = await setSectionStatesAsync(updatedStates);
        return newSectionStates;
      
    };

    await streamingGenerating(messages, updateLastMessage, onFinishGenerating, console.error);
};

  const taskFunctionMap: Record<string, (input: string, index: number) => Promise<void>> = {
    "Neutral Rewrite": async (input, index) => {
      console.log("1-1 Starting Neutral Rewrite");
      const llmName = "Qwen2-1.5B-Instruct-q4f16_1-MLC";
      const temperature = 0.8;
      const top_p = 0.6;
      const systemPrompt = "You are tasked with rewriting text in a neutral, declarative tone...";
      const prompt = "Rewrite the provided text only in its original language...";
  
      await runLLMEngine(input, index, systemPrompt, prompt, llmName, temperature, top_p);
    },
    "Clean text": async (input, index) => {
      // Implement the clean text functionality
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulating some async work
    },
    "Redo previous cell": async (input, index) => {
      // Implement the redo previous cell functionality
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulating some async work
    },
    "Consolidate results above": async (input, index) => {
      // Implement the consolidate results functionality
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulating some async work
    },
    "Customized prompt": async (input, index) => {
      const llmName = "Qwen2-1.5B-Instruct-q4f16_1-MLC";
      const temperature = 0.8;
      const top_p = 0.6;
      const systemPrompt = "You are a helpful AI assistant";
      const prompt = "";
  
      await runLLMEngine(input, index, systemPrompt, prompt, llmName, temperature, top_p);
    },
     "No Task": async (input, index) => {
      console.log("2-1 No Task");
      const updatedStates = [...sectionStates];
      updatedStates[index].outputValue = input;
      if (updatedStates[index + 1]) {
        updatedStates[index + 1].inputValue = input; // Update input value for the next section
      }
      console.log("2-2 New Section States - final");
      await setSectionStatesAsync(updatedStates);
    }
  };
  

  const taskNames: string[] = Object.keys(taskFunctionMap);


  const runTaskForSection = async (index: number): Promise<void> => {
    console.log(`Running task for section ${index}`);
    const currentSection = sectionStates[index];
    const selectedTask = currentSection.selectedTask;
    const input = currentSection.inputValue;
  
    if (selectedTask && taskFunctionMap[selectedTask]) {
      const newSectionStates = [...sectionStates];
      setSectionStates(newSectionStates);
      return taskFunctionMap[selectedTask](input, index);
    }
  };

  const handleTaskSelect = (index: number, task: string) => {
    const newSectionStates = [...sectionStates];
    newSectionStates[index] = { ...newSectionStates[index], selectedTask: task };
    setSectionStates(newSectionStates);
    const newVisibility = [...taskListVisibility];
    toggleTaskListVisibility(index);
  };

  const handleInputChange = (index: number, value: string) => {
    const newSectionStates = [...sectionStates];
    newSectionStates[index] = { ...newSectionStates[index], inputValue: value };
    setSectionStates(newSectionStates);
  };

  const toggleTaskListVisibility = (index: number) => {
    const newVisibility = [...taskListVisibility];
    newVisibility[index] = !newVisibility[index]; // Toggle the visibility of the corresponding task list
    setTaskListVisibility(newVisibility);
  };

  useEffect(() => {}, []); 

  return (
    <main className="flex min-h-screen flex-col items-center justify-between lg:p-24 md:p-24 sm:p-5">
      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex">
        <p className="fixed left-0 top-0 flex w-full justify-center bg-gradient-to-b pb-6 pt-8 backdrop-blur-2xl dark:from-inherit lg:static lg:w-auto lg:rounded-xl lg:p-4 text-lg">
          <img src="trio-log.png" alt="Trio Logo" className="w-20 h-20 lg:w-16 lg:h-16 mr-4" />
          <span className="text-3xl mt-4"> TRIO - by oopus</span>
        </p>
      </div>
      <div className="flex flex-col items-center justify-center w-full max-w-5xl p-8 space-y-2 bg-white rounded-xl shadow-lg dark:bg-zinc-800/30 lg:space-y-4 lg:gap-4 lg:p-8 lg:bg-gray-200 lg:dark:bg-zinc-800/30">
        <StatusAndCleanButton />
        <button className="p-2 w-full text-lg font-semibold text-white bg-blue-500 rounded-md shadow-md dark:bg-blue-700 active:scale-95 transition-transform duration-150" onClick={runAllTasks}>Run All</button>

        {/* ChatSection 1 */}
        <div className='w-full p-2 space-y-4 text-lg bg-gray-100 rounded-lg dark:bg-zinc-800/30 h-30 mt-6'>
          <label className="text-lg font-bold text-gray-800 dark:text-gray-200">Task 1</label>
          <textarea
            className="w-full p-2 text-lg bg-gray-100 rounded-lg dark:bg-zinc-800/30 h-30 bold"
            value={sectionStates[0].inputValue}
            onChange={(e) => handleInputChange(0, e.target.value)}
            placeholder="Put your text here"
          />
          <button
            onClick={() => toggleTaskListVisibility(0)}
            className="p-2 mt-2 text-base font-semibold text-white bg-blue-500 rounded-md shadow-md dark:bg-blue-700 active:scale-95 transition-transform duration-150"
          >
            {taskListVisibility[0] ? "Hide the First Task List" : "Show the First Task List"}
          </button>
          {taskListVisibility[0] && <TaskList tasks={taskNames} onSelectTask={(task) => handleTaskSelect(0, task)} />}
          <ChatSection
            selectedTask={sectionStates[0].selectedTask}
            onRunTask={() => runTaskForSection(0)}
            outputValue={sectionStates[0].outputValue}
          />
        </div>

        {/* ChatSection 2 */}
        <div className='w-full space-y-4 p-2 text-lg bg-gray-100 rounded-lg dark:bg-zinc-800/30 h-30 mt-6'>
          <label className="text-lg font-bold text-gray-800 dark:text-gray-200">Task 2</label>
          <textarea
            className="w-full p-2 text-lg bg-gray-100 rounded-lg dark:bg-zinc-800/30 h-30"
            value={sectionStates[1].inputValue}
            onChange={(e) => handleInputChange(1, e.target.value)}
            placeholder="Put your text here"
          />
          <button
            onClick={() => toggleTaskListVisibility(1)}
            className="p-2 mt-2 text-base font-semibold text-white bg-blue-500 rounded-md shadow-md dark:bg-blue-700 active:scale-95 transition-transform duration-150"
          >
            {taskListVisibility[1] ? "Hide the Second Task List" : "Show the Second Task List"}
          </button>
          {taskListVisibility[1] && <TaskList tasks={taskNames} onSelectTask={(task) => handleTaskSelect(1, task)} />}
          <ChatSection
            selectedTask={sectionStates[1].selectedTask}
            onRunTask={() => runTaskForSection(1)}
            outputValue={sectionStates[1].outputValue}
          />
        </div>

        {/* ChatSection 3 */}
        <div className='w-full space-y-4 p-2 text-lg bg-gray-100 rounded-lg dark:bg-zinc-800/30 h-30 mt-6'>
          <label className="text-lg font-bold text-gray-800 dark:text-gray-200">Task 3</label>
          <textarea
            className="w-full p-2 text-lg bg-gray-100 rounded-lg dark:bg-zinc-800/30 h-30"
            value={sectionStates[2].inputValue}
            onChange={(e) => handleInputChange(2, e.target.value)}
            placeholder="Put your text here"
          />
          <button
            onClick={() => toggleTaskListVisibility(2)}
            className="p-2 mt-2 text-base font-semibold text-white bg-blue-500 rounded-md shadow-md dark:bg-blue-700 active:scale-95 transition-transform duration-150"
          >
            {taskListVisibility[2] ? "Hide the Third Task List" : "Show the Third Task List"}
          </button>
          {taskListVisibility[2] && <TaskList tasks={taskNames} onSelectTask={(task) => handleTaskSelect(2, task)} />}
          <ChatSection
            selectedTask={sectionStates[2].selectedTask}
            onRunTask={() => runTaskForSection(2)}
            outputValue={sectionStates[2].outputValue}
          />
        </div>
      </div>
    </main>
  );
}
