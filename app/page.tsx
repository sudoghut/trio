"use client"; 
import { useState } from 'react';
import { useEffect, useRef } from 'react';
import StatusAndCleanButton from './components/statusAndCleanButton';
import ChatSection from './components/chatSection';
import TaskList from './components/taskList';

export default function Home() {
  const chatBoxRef = useRef<HTMLTextAreaElement>(null);

  const [sectionStates, setSectionStates] = useState([
    { selectedTask: 'No Task', inputValue: '', outputValue: '' },
    { selectedTask: 'No Task', inputValue: '', outputValue: '' },
    { selectedTask: 'No Task', inputValue: '', outputValue: '' }
  ]);

  const [taskListVisibility, setTaskListVisibility] = useState([false, false, false]); // Array of booleans for task list visibility

  const taskFunctionMap: Record<string, (input: string) => string> = {
    "Neutral Rewrite": (input) => `Neutral rewrite: ${input}`,
    "Clean text": (input) => `Cleaned text: ${input}`,
    "Redo previous cell": (input) => `Redo previous cell: ${input}`,
    "Consolidate results above": (input) => `Consolidated: ${input}`,
    "Customized prompt": (input) => `Customized: ${input}`,
    "No Task": (input) => input
  };

  const runTaskForSection = (index: number) => {
    const currentSection = sectionStates[index];
    const selectedTask = currentSection.selectedTask;
    const input = currentSection.inputValue;

    if (selectedTask && taskFunctionMap[selectedTask]) {
      const output = taskFunctionMap[selectedTask](input);

      const newSectionStates = [...sectionStates];
      newSectionStates[index] = { ...currentSection, outputValue: output };
      setSectionStates(newSectionStates);
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
      <div className="flex flex-col items-center justify-center w-full max-w-5xl p-8 space-y-4 bg-white rounded-xl shadow-lg dark:bg-zinc-800/30 lg:space-y-0 lg:gap-4 lg:p-8 lg:bg-gray-200 lg:dark:bg-zinc-800/30">
        <StatusAndCleanButton />

        {/* ChatSection 1 */}
          <textarea
            className="w-full p-2 text-lg bg-gray-100 rounded-lg dark:bg-zinc-800/30 h-30"
            value={sectionStates[0].inputValue}
            onChange={(e) => handleInputChange(0, e.target.value)}
            placeholder="Put your text here"
          />
          <button
            onClick={() => toggleTaskListVisibility(0)}
            className="p-2 mt-2 text-base font-semibold text-white bg-blue-500 rounded-md shadow-md dark:bg-blue-700"
          >
            {taskListVisibility[0] ? "Hide the First Task List" : "Show the First Task List"}
          </button>
          {taskListVisibility[0] && <TaskList onSelectTask={(task) => handleTaskSelect(0, task)} />}
          <ChatSection
            selectedTask={sectionStates[0].selectedTask}
            onRunTask={() => runTaskForSection(0)}
            outputValue={sectionStates[0].outputValue}
          />

        {/* ChatSection 2 */}
        <textarea
          className="w-full p-2 text-lg bg-gray-100 rounded-lg dark:bg-zinc-800/30 h-30"
          value={sectionStates[1].inputValue}
          onChange={(e) => handleInputChange(1, e.target.value)}
          placeholder="Put your text here"
        />
        <button
          onClick={() => toggleTaskListVisibility(1)}
          className="p-2 mt-2 text-base font-semibold text-white bg-blue-500 rounded-md shadow-md dark:bg-blue-700"
        >
          {taskListVisibility[1] ? "Hide the Second Task List" : "Show the Second Task List"}
        </button>
        {taskListVisibility[1] && <TaskList onSelectTask={(task) => handleTaskSelect(1, task)} />}
        <ChatSection
          selectedTask={sectionStates[1].selectedTask}
          onRunTask={() => runTaskForSection(1)}
          outputValue={sectionStates[1].outputValue}
        />

        {/* ChatSection 3 */}
        <textarea
          className="w-full p-2 text-lg bg-gray-100 rounded-lg dark:bg-zinc-800/30 h-30"
          value={sectionStates[2].inputValue}
          onChange={(e) => handleInputChange(2, e.target.value)}
          placeholder="Put your text here"
        />
        <button
          onClick={() => toggleTaskListVisibility(2)}
          className="p-2 mt-2 text-base font-semibold text-white bg-blue-500 rounded-md shadow-md dark:bg-blue-700"
        >
          {taskListVisibility[2] ? "Hide the Third Task List" : "Show the Third Task List"}
        </button>
        {taskListVisibility[2] && <TaskList onSelectTask={(task) => handleTaskSelect(2, task)} />}
        <ChatSection
          selectedTask={sectionStates[2].selectedTask}
          onRunTask={() => runTaskForSection(2)}
          outputValue={sectionStates[2].outputValue}
        />
      </div>
    </main>
  );
}
