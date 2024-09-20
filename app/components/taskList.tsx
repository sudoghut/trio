import React from 'react';

interface TaskListProps {
    tasks: string[];
    onSelectTask: (task: string) => void; // Function to handle task selection
}

const TaskList: React.FC<TaskListProps> = ({tasks, onSelectTask }) => {
    return (
        <div className="p-4 bg-gray-200 rounded-lg shadow-md dark:bg-zinc-800 space-y-4">
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">Tasks</h2>
            <ul className="list-disc pl-5 space-y-2 text-gray-700 dark:text-gray-300">
                {tasks.map((task, index) => (
                    <li key={index} className="flex justify-between items-center">
                        {task}
                        <button 
                            onClick={() => {onSelectTask(task)}} // Pass the selected task title
                            className="ml-4 text-sm text-white bg-green-500 rounded-md p-1 dark:bg-green-700 hover:bg-green-600"
                        >
                            Select ({task.charAt(0).toUpperCase()})
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default TaskList;
