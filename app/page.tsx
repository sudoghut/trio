"use client"; 
import { useState } from 'react';
import { useEffect, useRef } from 'react';
import StatusAndCleanButton from './components/statusAndCleanButton';
import ChatSection from './components/chatSection';
import TaskList from './components/taskList';
import * as webllm from "@mlc-ai/web-llm";

const engine = new webllm.MLCEngine();

export default function Home() {
  // const llmName = "Llama-3.2-1B-Instruct-q4f32_1-MLC";
  const llmName = "Qwen2.5-1.5B-Instruct-q4f32_1-MLC";

  const runAllTasks = async () => {
    for (let i = 0; i < sectionStates.length; i++) {
      await runTaskForSection(i);
    }
  };

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
      setSectionStates(newStatus);
      resolve(newStatus);
    });
  };
  

  const [taskListVisibility, setTaskListVisibility] = useState([false, false, false]);

  const [highlightedSection, setHighlightedSection] = useState<number | null>(null);
  const setHighlightedSectionAsync = (
    newHighlightedSection: number | null
  ): Promise<number | null> => {
    return new Promise((resolve) => {
      setHighlightedSection(newHighlightedSection); // This should be the direct state setter
      resolve(newHighlightedSection);
    });
  };
  
  

  const runTaskForSection = async (index: number): Promise<void> => {
    console.log(`Running task for section ${index}`);
    const currentSection = sectionStates[index];
    const selectedTask = currentSection.selectedTask;
    const input = currentSection.inputValue;
  
    if (selectedTask && taskFunctionMap[selectedTask]) {
      await setHighlightedSectionAsync(index);
      await taskFunctionMap[selectedTask](input, index);
    } else {
      alert("Incorrect task:" + selectedTask);
    }

    await setHighlightedSectionAsync(null);

  };

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
        await setSectionStatesAsync(updatedStates);      
    };

    await streamingGenerating(messages, updateLastMessage, onFinishGenerating, console.error);
};

  const taskFunctionMap: Record<string, (input: string, index: number) => Promise<void>> = {
    "Neutral Rewrite": async (input, index) => {
      console.log("1-1 Starting Neutral Rewrite");
      const temperature = 0.8;
      const top_p = 0.6;
      const systemPrompt = "You are tasked with rewriting text in a neutral, declarative tone. Your objective is to remove all expressions of strong emotions, subjective opinions, and replace any emotionally charged punctuation, such as exclamation marks or emphatic question marks, with neutral alternatives. Preserve the original meaning while ensuring the text cannot be easily linked to the original author's distinctive style. Avoid poetic, exaggerated, or emotionally loaded language. Your output should reflect a calm, objective, and clear tone.";
      const prompt = "Rewrite the provided text only in its original language, without translating or altering the meaning. Remove any personal bias, vulgar language, and emotional expressions. If none of these elements are present, return the text exactly as it was provided. Do not translate or change the language in any way. Provide the rewritten text below: \n";
  
      await runLLMEngine(input, index, systemPrompt, prompt, llmName, temperature, top_p);
    },
    "Clean Text": async (input, index) => {
      console.log("3-1 Starting Neutral Rewrite");
      const temperature = 0.8;
      const top_p = 0.6;
      const systemPrompt = "Your task is to clean and polish the input text by correcting grammatical errors, fixing punctuation, removing extra spaces and unnecessary line breaks, and ensuring the text flows smoothly. Maintain the original wording and sentence structure as closely as possible to preserve the author's intent. Do not add new content or alter the meaning of the text.";
      const prompt = "Please clean the text by correcting grammar, fixing punctuation, removing extra spaces and line breaks, and keeping the original words and sentence structure as much as possible: ";
  
      await runLLMEngine(input, index, systemPrompt, prompt, llmName, temperature, top_p);
    },
    "Redo Previous Cell": async (input, index) => {
      console.log("4-1 Starting Neutral Rewrite for Task" + index);
      if (index == 1) {
        console.log("4-2 Start index 2 for Task" + index);
        const updatedStates = [...sectionStates];
        const previousTaskName = updatedStates[index - 1].selectedTask;
        const previousInput = updatedStates[index - 1].inputValue;
        updatedStates[index].inputValue = previousInput;
        console.log("4-3 Update the input value for Task" + index);
        await setSectionStatesAsync(updatedStates);
        if (taskFunctionMap[previousTaskName]) {
          console.log("4-4 Run Task" + previousTaskName + " for Task" + index);
          await taskFunctionMap[previousTaskName](previousInput, index);
        }
      }else if (index == 2){
        // Prepare for Task 2
        console.log("4-5 Start index 3 for Task" + index)
        const updatedStates = [...sectionStates];
        let previousTaskName = updatedStates[index - 1].selectedTask;
        let previousInput = updatedStates[index - 1].inputValue;
        // If Task 2 is also a redo task
        console.log("4-6 Got the previous task name and input value from Task2 for Task" + index);
        if (previousTaskName == "Redo Previous Cell") {
          // When Task 2 is a redo task, whatever the Task 1 is,
          // Task 3 will take task 1's input
          console.log("4-7 Finding Task 2 is also a redo task for Task" + index);
          previousTaskName = updatedStates[index - 2].selectedTask;
          previousInput = updatedStates[index - 2].inputValue;
          console.log("4-8 Finish finding the task name and input value from Task1 for Task" + index);
          // Task 1 is also a redo task
          if (previousTaskName == "Redo Previous Cell") {
            console.log("4-9 Task 1 is also a redo task for Task" + index);
            previousTaskName = "No Task";
          }else{
          // Task 1 is not a redo task
            console.log("4-10 Task 1 is not a redo task for Task" + index);
            previousTaskName = updatedStates[index - 2].selectedTask;
          } 
          } else {
            // Task 2 is not a redo task,
            // has prepared in "Prepare for Task 2"
        }
        // Update the current input value. Don't copy
        // the redo task name to the current task
        console.log("4-11 Update the input value for Task" + index);
        updatedStates[index].inputValue = previousInput;
        console.log("4-12 Update task list for Task" + index);
        await setSectionStatesAsync(updatedStates);
        if (taskFunctionMap[previousTaskName]) {
          console.log("4-13 Run Task" + previousTaskName + " for Task" + index);
          console.log("4-13.1 Previous Task Name: " + previousTaskName);
          console.log("4-13.2 Previous Input: " + previousInput);
          await taskFunctionMap[previousTaskName](previousInput, index);
        }
      } else {
        // index == 1
        console.log("4-14 Throw to No Task for Task" + index);
        await taskFunctionMap["No Task"](input, index);
      }
      // Implement the redo previous cell functionality
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulating some async work
    },
    "Consolidate Previous Cell": async (input, index) => {
      // Implement the consolidate results functionality
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulating some async work
    },
    "Customized Prompt": async (input, index) => {
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
        {/* <div className='w-full p-2 space-y-4 text-lg bg-gray-100 rounded-lg dark:bg-zinc-800/30 h-30 mt-6'> */}
        <div className={`w-full p-2 space-y-4 text-lg bg-gray-100 rounded-lg dark:bg-zinc-800/30 h-30 mt-6 ${highlightedSection === 0 ? 'border-2 border-yellow-400' : ''}`}>
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
        <div className={`w-full p-2 space-y-4 text-lg bg-gray-100 rounded-lg dark:bg-zinc-800/30 h-30 mt-6 ${highlightedSection === 1 ? 'border-2 border-yellow-400' : ''}`}>
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
        <div className={`w-full p-2 space-y-4 text-lg bg-gray-100 rounded-lg dark:bg-zinc-800/30 h-30 mt-6 ${highlightedSection === 2 ? 'border-2 border-yellow-400' : ''}`}>
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
