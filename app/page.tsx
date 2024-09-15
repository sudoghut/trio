  "use client"; 
  import { useEffect, useRef } from 'react';
  // import * as webllm from "https://esm.run/@mlc-ai/web-llm";
  // import * as webllm from "@mlc-ai/web-llm";
  import StatusAndCleanButton from './components/statusAndCleanButton';
  import ChatSection from './components/chatSection';

  export default function Home() {
    const chatBoxRef = useRef<HTMLTextAreaElement>(null);
    
    useEffect(() => {
      
    }, []); // Empty dependency array ensures it runs only once on mount

    return (
      <main className="flex min-h-screen flex-col items-center justify-between lg:p-24 md:p-24 sm:p-5">
        <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex">
          <p className="fixed left-0 top-0 flex w-full justify-center bg-gradient-to-b pb-6 pt-8 backdrop-blur-2xl dark:from-inherit lg:static lg:w-auto  lg:rounded-xl lg:p-4 text-lg">
          <img src="trio-log.png" alt="Trio Logo" className="w-20 h-20 lg:w-16 lg:h-16 mr-4" />
          <span className="text-3xl mt-4"> TRIO - by oopus</span>
          </p>
        </div>
        <div className="flex flex-col items-center justify-center w-full max-w-5xl p-8 space-y-4 bg-white rounded-xl shadow-lg dark:bg-zinc-800/30 lg:space-y-0 lg:gap-4 lg:p-8 lg:bg-gray-200 lg:dark:bg-zinc-800/30">
          <StatusAndCleanButton />
          <textarea className="w-full p-2 text-lg bg-gray-100 rounded-lg dark:bg-zinc-800/30 h-30" id="user-input" placeholder="Put your text here" ref={chatBoxRef}/>
          <ChatSection />
          <ChatSection />
          <ChatSection />
        </div>

      </main>
    );
  }
