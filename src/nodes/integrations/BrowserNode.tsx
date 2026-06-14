import React, { useState } from 'react';
import { Globe, Maximize2, ExternalLink, RefreshCw } from 'lucide-react';
import { createResourceNode } from '../shared/BaseResourceNode';
import { SiGooglechrome } from 'react-icons/si';

const BrowserNodeBody = ({ task, updateTask }: any) => {
  const [url, setUrl] = useState(task.url || 'https://en.wikipedia.org');
  const [iframeKey, setIframeKey] = useState(0); // Used to force refresh

  const handleUrlSubmit = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      let finalUrl = url;
      if (!/^https?:\/\//i.test(finalUrl)) {
        finalUrl = 'https://' + finalUrl;
        setUrl(finalUrl);
      }
      updateTask({ url: finalUrl });
    }
  };

  return (
    <div className="flex flex-col space-y-2 h-[400px]">
      {/* Address Bar */}
      <div className="flex items-center gap-1 bg-[#13141c] border border-[#2a2b36] rounded-lg p-1.5 focus-within:border-cyan-500 transition-colors">
        <Globe className="w-3.5 h-3.5 text-gray-500 shrink-0 ml-1" />
        <input
          type="text"
          placeholder="Enter URL (e.g. https://example.com) and press Enter"
          className="w-full text-[10px] bg-transparent focus:outline-none text-gray-300 px-1"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={handleUrlSubmit}
        />
        <button 
          onClick={() => setIframeKey(k => k + 1)}
          className="p-1 hover:bg-[#1a1b23] rounded transition-colors text-gray-400 hover:text-white"
          title="Refresh"
        >
          <RefreshCw className="w-3 h-3" />
        </button>
        <button 
          onClick={() => window.open(url, '_blank')}
          className="p-1 hover:bg-[#1a1b23] rounded transition-colors text-gray-400 hover:text-white"
          title="Open in new tab"
        >
          <ExternalLink className="w-3 h-3" />
        </button>
      </div>

      {/* Warning Notice */}
      <div className="text-[9px] text-gray-500 px-1 italic">
        Note: Many modern websites block embedded iframes for security. If the screen is blank, the website prevents embedding.
      </div>

      {/* Browser Viewport */}
      <div className="flex-1 bg-white rounded-lg overflow-hidden border border-[#2a2b36] relative">
        <iframe
          key={iframeKey}
          src={task.url || 'https://en.wikipedia.org'}
          className="w-full h-full border-none"
          sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
          title="Embedded Browser"
        />
      </div>
    </div>
  );
};

export default createResourceNode({
  label: 'Web Browser',
  accentColor: '#4285F4',
  icon: <SiGooglechrome className="w-4 h-4 text-[#4285F4]" />,
  width: 'w-[480px]'
}, BrowserNodeBody);
