import React, { useState } from 'react';
import { Check, Copy, Download } from 'lucide-react';
import { cn } from '../lib/utils';

interface CodeBlockProps {
  code: string;
  filename: string;
  className?: string;
}

export function CodeBlock({ code, filename, className }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className={cn("relative rounded bg-[#0F0F11] border border-white/10 flex flex-col w-full overflow-hidden", className)}>
      <div className="flex items-center justify-between px-4 py-3 bg-[#161618] border-b border-white/10">
        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">{filename}</span>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleCopy}
            className="p-1.5 text-gray-400 hover:text-white hover:bg-white/5 rounded transition-colors"
            title="Copy Code"
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
          </button>
          <button
            onClick={handleDownload}
            className="p-1.5 text-gray-400 hover:text-white hover:bg-white/5 rounded transition-colors"
            title="Download .ly file"
          >
            <Download size={14} />
          </button>
        </div>
      </div>
      <div className="p-4 overflow-x-auto text-[11px] font-mono text-blue-400 leading-relaxed whitespace-pre">
        {code}
      </div>
    </div>
  );
}
