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
  }, []);

  return (
    <div className="w-full text-lg rounded-lg h-30 mt-6">
      <div className='mb-3 mt-1 items-left'>
        <label className="text-lg text-gray-800 dark:text-gray-200">Todo: </label>
        <label className="text-lg text-gray-800 dark:text-gray-200">{selectedTask || "No Task"}</label>
      </div>
      <div className="flex space-x-4 ">
        <button className="p-2 text-base font-semibold text-white bg-blue-500 rounded-md shadow-md dark:bg-blue-700">Run Me&Below</button>
        <button onClick={onRunTask} className="p-2 text-base font-semibold text-white bg-blue-500 rounded-md shadow-md dark:bg-blue-700">Run Me</button>
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
