import React, { useEffect, useRef } from 'react';

const StatusAndCleanButton = () => {
  const clearCacheButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const clearCacheButton = clearCacheButtonRef.current;
    const chatStatsElement = document.getElementById('status');

    const clearCache = async () => {
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        console.log(cacheNames);
        cacheNames.forEach(async (cacheName) => {
          await caches.delete(cacheName);
        });
        if (chatStatsElement) {
          chatStatsElement.textContent = 'Cache Storage cleared';
        }
      } else {
        if (chatStatsElement) {
          chatStatsElement.textContent = "Cache API not supported";
        }
      }
    };
    if (clearCacheButton) {
      clearCacheButton.addEventListener('click', clearCache);
    }


  }, []);
    return (
        <div className="w-full p-2 text-lg bg-gray-100 rounded-lg dark:bg-zinc-800/30 space-y-4">
            <p>
                <label className="text-sm text-gray-800 dark:text-gray-200">Status: </label>
                <label className="text-sm text-gray-800 dark:text-gray-200" id="status">No Error</label>
            </p>
            <p>
                <button className="p-2 text-sm font-semibold text-white bg-blue-500 rounded-md shadow-md dark:bg-yellow-700 whitespace-nowrap transform active:scale-95 transition-transform duration-150" id="clear-cache" ref={clearCacheButtonRef}>Clear LLM Cache</button>
            </p>
        </div>
    );
};

export default StatusAndCleanButton;