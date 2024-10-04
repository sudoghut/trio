"use client"; 
import { useState, useEffect, useRef } from 'react';
import StatusAndCleanButton from './components/statusAndCleanButton';
import ChatSection from './components/chatSection';
import TaskList from './components/taskList';
import * as webllm from "@mlc-ai/web-llm";
import ReactGA from 'react-ga4';

const engine = new webllm.MLCEngine();

export default function Home() {

  ReactGA.initialize('G-PF05LLDPN8');

  useEffect(() => {
    ReactGA.send({ hitType: "pageview", page: window.location.pathname });
    
  }, []);

  // const llmName = "Llama-3.2-1B-Instruct-q4f32_1-MLC";
  const llmName = "Qwen2.5-1.5B-Instruct-q4f32_1-MLC";

  const [isRunning, setIsRunning] = useState(false);

  const hasAutoRun = useRef(false);

  // Use sendToAPI for manual trigger
  const [sendToApi, setSendToApi] = useState(false);
  // Use sendToApiRef for auto trigger
  let sendToApiRef = useRef(false);

  const [apiUrl, setApiUrl] = useState('');
  let apiUrlRef = useRef('');

  const setIsRunningAsync = (value: boolean): Promise<void> => {
    return new Promise((resolve) => {
      setIsRunning(value);
      resolve();
    });
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
  
  const copyTasks = async () => {
    const task1 = sectionStates[0].selectedTask;
    const task2 = sectionStates[1].selectedTask;
    const task3 = sectionStates[2].selectedTask;
    const input1 = sectionStates[0].inputValue;
    let ext_url = encodeURIComponent(apiUrl);
    const base_url = window.location.href.split('?')[0];
    // const full_url = `${base_url}?task1=${task1}&task2=${task2}&task3=${task3}&input1=${input1}&ext_url=${ext_url}&auto_run=true`;
    const full_url = `${base_url}?task1=${task1}&task2=${task2}&task3=${task3}&input1=${input1}&ext_url=${ext_url}`;
    // Copy to clipboard
    await navigator.clipboard.writeText(full_url);
    const chatStatsElement = document.getElementById("status");
    if (chatStatsElement) {
        chatStatsElement.textContent = "Tasks copied to clipboard";
    }
  };
  
  const firstTextAreaRef = useRef<HTMLTextAreaElement>(null); // Create a ref for the first textarea

  useEffect(() => {
    console.log("!!!sendToApi has changed:", sendToApi);
    if (firstTextAreaRef.current) {
      firstTextAreaRef.current.focus(); // Automatically focus on the first textarea when the component mounts
    }

    // New URL parameter handling logic
    console.log("0.09 Read window.location.href",window.location.href);
    const params = new URLSearchParams(window.location.search);
    console.log("0.1 Get URL Parameters: ", params.toString());
    const task1 = (params.get('task1') || '');
    const task2 = (params.get('task2') || '');
    const task3 = (params.get('task3') || '');
    const input1 = (params.get('input1') || '').slice(0, 3000);
    const ext_url = (params.get('ext_url') || '');
    const auto_run = params.get('auto_run') === 'true';
    console.log("0.11 Get URL Parameters: ", task1, task2, task3, input1, ext_url, auto_run);
    console.log("0.12 Get task1 from URL Parameters: ", task1);
    let updatedStates = [...sectionStates]; 
    updatedStates[0].selectedTask = task1 || 'No Task';
    updatedStates[0].inputValue = input1 || '';
    updatedStates[1].selectedTask = task2 || 'No Task';
    updatedStates[2].selectedTask = task3 || 'No Task';
    console.log("0.2 Ready to run setSectionStatesAsync");
    setSectionStates(updatedStates);
    console.log("0.3 Finished setSectionStatesAsync");
    console.log(sectionStates);
    console.log("auto_run: ", auto_run); 

    // Set ext_url for sendToApi and apiUrl
    if (ext_url) {
      sendToApiRef.current = true;
      setSendToApi(true);
      apiUrlRef.current = ext_url;
      setApiUrl(ext_url);
    }
    console.log("!!! SendToApi:" + sendToApi);
    // Auto-run tasks if auto_run is true
    if (auto_run && !hasAutoRun.current) {
      console.log("Auto-running tasks...");
      console.log("0.4 Ready to run runAllTasks");
      hasAutoRun.current = true;
      console.log("!!! Before auto run runall SendToApi:" + sendToApi);
      runAllTasks();
    } else {
        console.log("Tasks have been auto-run...");
    }
      console.log("0.5 Finished runAllTasks");
  }, []);  
  
  // Function to handle checkbox change
  const handleCheckboxChange = () => {
    setSendToApi(!sendToApi);
    sendToApiRef.current = !sendToApiRef.current;
  };

  // Function to handle API URL change
  const handleApiUrlChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setApiUrl(event.target.value);
    apiUrlRef.current = event.target.value;
  };

  // Function to send Task 3 output to the external API
  const sendOutputToApi = async (output: string) => {
    console.log("Sending output to API");
    console.log("apiUrl:", apiUrlRef.current);
    if (!apiUrlRef.current) {
      alert("Please provide a valid API URL.");
      return;
    }
    console.log("output:", output);
    // Ensure that output is safely encoded for use in the URL
    const formattedOutput = encodeURIComponent(output); 
    console.log("apiURL:", apiUrlRef.current);
    console.log("formattedOutput:", formattedOutput);
    const fullUrl = `${apiUrlRef.current}${formattedOutput}`; // Construct the URL with the query parameter
    console.log("Ready to open URL:", fullUrl);
    // Open the URL in a new tab
    window.open(fullUrl, '_blank');
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

  const runAllTasks = async () => {
    console.log("!!! Starting auto run runall SendToApi:" + sendToApi);
    await setIsRunningAsync(true);
    for (let i = 0; i < sectionStates.length; i++) {
      await runTaskForSection(i);
    }
    await setIsRunningAsync(false);
    console.log("!!! Ready to trigger ext API SendToApi:" + sendToApi);
    if (sendToApi || sendToApiRef.current) {
      console.log("API triggered");
      const task3Output = sectionStates[2].outputValue;
      if (task3Output) {
        await sendOutputToApi(task3Output);
      } else {
        alert("Task 3 output is empty. Cannot send to API.");
      }
    } else {
      console.log("API not triggered");
    }
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
        try {
          await engine.reload(selectedModel, config);
        } catch (err) {
            console.error(err);
            const downloadStatus = document.getElementById("status");
            if (downloadStatus) {
                downloadStatus.textContent = "Error: " + err;
            }
        }
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
            const downloadStatus = document.getElementById("status");
            if (downloadStatus) {
                downloadStatus.textContent = "Error: " + err;
            }
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
      const systemPrompt = "You are tasked with rewriting text in a neutral, declarative tone. Your objective is to remove all expressions of strong emotions, subjective opinions, and replace any emotionally charged punctuation, such as exclamation marks or emphatic question marks, with neutral alternatives. Preserve the original meaning while ensuring the text cannot be easily linked to the original author's distinctive style. Avoid poetic, exaggerated, or emotionally loaded language. Don't generate any unnecessary information. Don't generate anyintroductory phrases. Don't generate any repetitive content. Only generate the output text. Your output should reflect a calm, objective, and clear tone.";
      const prompt = "Rewrite the provided text only in its original language, without translating or altering the meaning. Remove any personal bias, vulgar language, and emotional expressions. If none of these elements are present, return the text exactly as it was provided. Do not translate or change the language in any way. Don't generate any unnecessary information. Don't generate anyintroductory phrases. Don't generate any repetitive content. Only generate the output text. Provide the rewritten text below: \n";
  
      await runLLMEngine(input, index, systemPrompt, prompt, llmName, temperature, top_p);
    },
    "Clean Text": async (input, index) => {
      console.log("3-1 Starting Neutral Rewrite");
      const temperature = 0.8;
      const top_p = 0.6;
      const systemPrompt = "Your task is to clean and polish the input text by correcting grammatical errors, fixing punctuation, removing extra spaces and unnecessary line breaks, and ensuring the text flows smoothly. Maintain the original wording and sentence structure as closely as possible to preserve the author's intent. Don't generate any unnecessary information. Don't generate anyintroductory phrases. Don't generate any repetitive content. Only generate the output text. Do not add new content or alter the meaning of the text.";
      const prompt = "Please clean the text by correcting grammar, fixing punctuation, removing extra spaces and line breaks, and keeping the original words and sentence structure as much as possible: \n";
  
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
    },
    "Email Reply Generation": async (input, index) => {
      const temperature = 0.8;
      const top_p = 0.6;
      const systemPrompt = "You are a language model that drafts formal and professional email replies. Your task is to generate polite, respectful, and clear responses that address the points or requests in the original email. Ensure the tone is professional, maintain proper grammar, and structure the email with clear paragraphs. Don't generate any unnecessary information. Don't generate anyintroductory phrases. Don't generate any repetitive content. Only generate the output text. The reply should acknowledge the original message and provide a courteous, thoughtful response.";
      const prompt = "I need to draft a formal and professional reply to the following email. The reply should acknowledge the points mentioned, address any questions or requests, and offer a clear and courteous response. Don't generate any unnecessary information. Don't generate anyintroductory phrases. Don't generate any repetitive content. Only generate the output text. The tone should remain polite, professional, and respectful throughout. Here is the original email that needs a response: \n";
  
      await runLLMEngine(input, index, systemPrompt, prompt, llmName, temperature, top_p);
    },
    "Expand Paragraph": async (input, index) => {
      const temperature = 0.8;
      const top_p = 0.6;
      const systemPrompt = "You are a language model tasked with expanding text. Your goal is to take short paragraphs and expand them by adding relevant details, examples, and additional context, all while maintaining the original meaning. Ensure that the expansion is smooth, clear, and coherent. Don't generate any unnecessary information. Don't generate anyintroductory phrases. Don't generate any repetitive content. Only generate the output text. Avoid adding unnecessary complexity, but do provide enough elaboration to enhance the reader's understanding of the topic.";
      const prompt = "Expand the following paragraph by adding more details, examples, and context. Ensure that the expanded version flows smoothly while keeping the original meaning intact. Don't generate any unnecessary information. Don't generate anyintroductory phrases. Don't generate any repetitive content. Only generate the output text. Use clear, concise language and aim to elaborate on the key points mentioned: \n";
  
      await runLLMEngine(input, index, systemPrompt, prompt, llmName, temperature, top_p);
    },
    "Summarize Paragraph": async (input, index) => {
      const temperature = 0.8;
      const top_p = 0.6;
      const systemPrompt = "You are a language model tasked with summarizing text. Your goal is to take paragraphs and condense them into shorter versions, focusing on the core message and key details. Don't generate any unnecessary information. Don't generate anyintroductory phrases. Don't generate any repetitive content. Only generate the output text. Ensure that the summary is clear, concise, and maintains the original meaning without losing important information.";
      const prompt = "Summarize the following paragraph by condensing its key points into a shorter version. Ensure that the summary retains the main idea and important details. Don't generate any unnecessary information. Don't generate anyintroductory phrases. Don't generate any repetitive content. Only generate the output text. Use clear and concise language: \n";
  
      await runLLMEngine(input, index, systemPrompt, prompt, llmName, temperature, top_p);
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
        <button className={`p-2 w-full text-lg font-semibold text-white rounded-md shadow-md ${
                  isRunning
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-500 dark:bg-blue-700 active:scale-95 transition-transform duration-150'
                  }`}
                onClick={runAllTasks}
                disabled={isRunning}>
          {isRunning ? "Running..." : "Run All"}
        </button>

        {/* ChatSection 1 */}
        {/* <div className='w-full p-2 space-y-4 text-lg bg-gray-100 rounded-lg dark:bg-zinc-800/30 h-30 mt-6'> */}
        <div className={`w-full p-2 space-y-4 text-lg bg-gray-100 rounded-lg dark:bg-zinc-800/30 h-30 mt-6 ${highlightedSection === 0 ? 'border-2 border-yellow-400' : ''}`}>
          <label className="text-lg font-bold text-gray-800 dark:text-gray-200">Task 1</label>
          <textarea
            className="w-full p-2 text-lg bg-gray-100 rounded-lg dark:bg-zinc-800/30 h-30 bold"
            value={sectionStates[0].inputValue}
            onChange={(e) => handleInputChange(0, e.target.value)}
            placeholder="Place your text for Task 1 here. The maximum word count is 3,000"
            ref={firstTextAreaRef}
            maxLength={3000}
          />
          <button
            onClick={() => toggleTaskListVisibility(0)}
            className="p-2 mt-2 text-base font-semibold text-white bg-blue-500 rounded-md shadow-md dark:bg-blue-700 active:scale-95 transition-transform duration-150"
          >
            {taskListVisibility[0] ? "Hide First Task List" : "Show First Task List"}
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
            placeholder="This will be automatically filled with the output from Task 1"
            maxLength={3000}
          />
          <button
            onClick={() => toggleTaskListVisibility(1)}
            className="p-2 mt-2 text-base font-semibold text-white bg-blue-500 rounded-md shadow-md dark:bg-blue-700 active:scale-95 transition-transform duration-150"
          >
            {taskListVisibility[1] ? "Hide Second Task List" : "Show Second Task List"}
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
            placeholder="This will be automatically filled with the output from Task 2"
            maxLength={3000}
          />
          <button
            onClick={() => toggleTaskListVisibility(2)}
            className="p-2 mt-2 text-base font-semibold text-white bg-blue-500 rounded-md shadow-md dark:bg-blue-700 active:scale-95 transition-transform duration-150"
          >
            {taskListVisibility[2] ? "Hide Third Task List" : "Show Third Task List"}
          </button>
          {taskListVisibility[2] && <TaskList tasks={taskNames} onSelectTask={(task) => handleTaskSelect(2, task)} />}
          <ChatSection
            selectedTask={sectionStates[2].selectedTask}
            onRunTask={() => runTaskForSection(2)}
            outputValue={sectionStates[2].outputValue}
          />
        </div>

        {/* External API */}
        <div className="w-full p-2 space-y-4 text-lg bg-gray-100 rounded-lg dark:bg-zinc-800/30 h-30 mt-6">
          <label className="flex items-center space-x-4 cursor-pointer">
            <input type="checkbox" className="w-5 h-5" checked={sendToApi} onChange={handleCheckboxChange} />
            <span className="text-lg font-bold text-gray-800 dark:text-gray-200">Jump to External API Using Task 3 Output</span>
          </label>
          <input 
            className="w-full p-2 text-lg bg-gray-100 rounded-lg dark:bg-zinc-800/30 h-30" 
            placeholder="Put your API URL here"
            value={apiUrl}
            onChange={handleApiUrlChange} 
          />
        </div>
        <button className="p-2 w-full text-lg font-semibold text-white rounded-md shadow-md bg-blue-500 dark:bg-blue-700 active:scale-95 transition-transform duration-150"
                onClick={copyTasks}>
          Copy Tasks
        </button>



      </div>
    </main>
  );
}
