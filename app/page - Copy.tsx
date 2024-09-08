"use client"; 
import { useEffect, useRef } from 'react';
import Image from "next/image";
import { Disclosure, DisclosureButton, DisclosurePanel, Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
import { Bars3Icon, BellIcon, XMarkIcon } from '@heroicons/react/24/outline'

export default function Home() {
  const chatBoxRef = useRef<HTMLTextAreaElement>(null);
  const runOnPageLoad = () => {
    // console.log("Page has loaded, running function...");
    // You can add any logic you want here:
    if (chatBoxRef.current) {
      chatBoxRef.current.focus();
    }
  };

  useEffect(() => {
    runOnPageLoad(); // Call the function on page load
  }, []); // Empty dependency array ensures it runs only once on mount

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex">
        <p className="fixed left-0 top-0 flex w-full justify-center bg-gradient-to-b from-zinc-200 pb-6 pt-8 backdrop-blur-2xl dark:bg-zinc-800/30 dark:from-inherit lg:static lg:w-auto  lg:rounded-xl lg:bg-gray-200 lg:p-4 lg:dark:bg-zinc-800/30 text-lg">
        Blend into the crowd
        </p>
        <div className="fixed bottom-0 left-0 flex h-48 w-full items-end justify-center bg-gradient-to-t from-white via-white dark:from-black dark:via-black lg:static lg:size-auto lg:bg-none">
          <a
            className="pointer-events-none flex place-items-center gap-2 p-8 lg:pointer-events-auto lg:p-0"
            href="https://www.oopus.info/blog/"
            target="_blank"
            rel="noopener noreferrer"
          >
            By oopus
          </a>
        </div>
      </div>
      <div className="flex flex-col items-center justify-center w-full max-w-5xl p-8 space-y-4 bg-white rounded-xl shadow-lg dark:bg-zinc-800/30 lg:space-y-0 lg:gap-4 lg:p-8 lg:bg-gray-200 lg:dark:bg-zinc-800/30">
        <textarea className="w-full p-2 text-lg bg-gray-100 rounded-lg dark:bg-zinc-800/30 h-30" id="user-input" placeholder="Put your text here" ref={chatBoxRef}/>
        <p className="w-full p-2 text-lg bg-gray-100 rounded-lg dark:bg-zinc-800/30">
        <label className="text-base text-gray-800 dark:text-gray-200">Status: </label>
        <label className="text-base text-gray-800 dark:text-gray-200" id="status">No Error</label>
        </p>
        <p className="flex space-x-4">
        <button className="px-8 py-2 text-base font-semibold text-white bg-blue-500 rounded-md shadow-md dark:bg-blue-700 whitespace-nowrap" id="send">Convert</button>
        <button className="px-8 py-2 text-base font-semibold text-white bg-blue-500 rounded-md shadow-md dark:bg-blue-700 whitespace-nowrap" id="copy">Copy Result</button>
        </p>
        <textarea className="w-full p-2 text-lg bg-gray-100 rounded-lg dark:bg-zinc-800/30 h-30 mt-6" id="chat-box" placeholder="Output" readOnly/>
      </div>

      <div className="mb-32 grid text-center lg:mb-0 lg:w-full lg:max-w-5xl lg:grid-cols-4 lg:text-left">
        <a
          href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
          className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
          target="_blank"
          rel="noopener noreferrer"
        >
          <h2 className="mb-3 text-2xl font-semibold">
            Docs{" "}
            <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
              -&gt;
            </span>
          </h2>
          <p className="m-0 max-w-[30ch] text-sm opacity-50">
            Find in-depth information about Next.js features and API.
          </p>
        </a>

        <a
          href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
          target="_blank"
          rel="noopener noreferrer"
        >
          <h2 className="mb-3 text-2xl font-semibold">
            Learn{" "}
            <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
              -&gt;
            </span>
          </h2>
          <p className="m-0 max-w-[30ch] text-sm opacity-50">
            Learn about Next.js in an interactive course with&nbsp;quizzes!
          </p>
        </a>

        <a
          href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
          className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
          target="_blank"
          rel="noopener noreferrer"
        >
          <h2 className="mb-3 text-2xl font-semibold">
            Templates{" "}
            <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
              -&gt;
            </span>
          </h2>
          <p className="m-0 max-w-[30ch] text-sm opacity-50">
            Explore starter templates for Next.js.
          </p>
        </a>

        <a
          href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
          className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
          target="_blank"
          rel="noopener noreferrer"
        >
          <h2 className="mb-3 text-2xl font-semibold">
            Deploy{" "}
            <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
              -&gt;
            </span>
          </h2>
          <p className="m-0 max-w-[30ch] text-balance text-sm opacity-50">
            Instantly deploy your Next.js site to a shareable URL with Vercel.
          </p>
        </a>
      </div>
    </main>
  );
}
