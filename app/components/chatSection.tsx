import React, { useRef } from 'react';

interface ChatSectionProps {
  selectedTask: string;
  onRunTask: () => void;
  outputValue: string;
}

const ChatSection: React.FC<ChatSectionProps> = ({ selectedTask, onRunTask, outputValue }) => {
  const chatBoxRef = useRef<HTMLTextAreaElement>(null);
  
  const copyText = () => {
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
  };

  return (
    <div className="w-full text-lg rounded-lg h-30 mt-6">
      <div className='mb-3 mt-1 items-left'>
        <label className="text-lg text-gray-800 dark:text-gray-200">Todo: </label>
        <label className="text-lg text-gray-800 dark:text-gray-200">{selectedTask || "No Task"}</label>
      </div>
      <div className="flex space-x-4 ">
        <button onClick={onRunTask} className="p-2 text-base font-semibold text-white bg-blue-500 rounded-md shadow-md dark:bg-blue-700 active:scale-95 transition-transform duration-150">Run Me</button>
        <button onClick={copyText} className="p-2 text-base font-semibold text-white bg-blue-500 rounded-md shadow-md dark:bg-blue-700 active:scale-95 transition-transform duration-150">Copy Result</button>
      </div>
      <textarea
        ref={chatBoxRef}
        className="w-full p-2 text-lg bg-gray-100 rounded-lg dark:bg-zinc-800/30 h-30 mt-6"
        value={outputValue}
        placeholder="Output"
        readOnly
        maxLength={3000}
      />
    </div>
  );
};

export default ChatSection;
