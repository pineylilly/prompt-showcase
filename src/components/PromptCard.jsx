import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

const PromptCard = ({ generatedImage, promptText }) => {
  const [values, setValues] = useState({});
  const [copied, setCopied] = useState(false);

  const handleChange = (index, val) => {
    setValues(prev => ({ ...prev, [index]: val }));
  };

  const parsePrompt = (text) => {
    const regex = /\[([^\]]+)\]/g;
    const parts = [];
    let lastIndex = 0;
    let match;
    
    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push({ type: 'text', value: text.substring(lastIndex, match.index) });
      }
      parts.push({ type: 'input', name: match[1] });
      lastIndex = regex.lastIndex;
    }
    if (lastIndex < text.length) {
      parts.push({ type: 'text', value: text.substring(lastIndex) });
    }
    return parts;
  };

  const parsedParts = parsePrompt(promptText);

  const handleCopy = () => {
    let finalPrompt = "";
    parsedParts.forEach((part, index) => {
      if (part.type === 'text') {
        finalPrompt += part.value;
      } else {
        const val = values[index] !== undefined ? values[index] : part.name;
        finalPrompt += val;
      }
    });
    navigator.clipboard.writeText(finalPrompt).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="border border-theme-border rounded-lg overflow-hidden bg-theme-surface">
      <div className="w-full h-auto md:h-80 border-b border-theme-border">
        <img 
          src={generatedImage} 
          alt="Generated output" 
          className="w-full h-64 md:h-full object-cover"
        />
      </div>

      {/* Prompt Text */}
      <div className="p-5">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-semibold text-theme-muted uppercase tracking-wide">
            Prompt
          </p>
          <button 
            onClick={handleCopy}
            className="flex items-center gap-1.5 text-xs font-medium text-theme-muted hover:text-theme-accent transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? <span className="text-green-500">Copied</span> : "Copy"}
          </button>
        </div>
        <p className="text-theme-text font-serif text-base leading-loose">
          {parsedParts.map((part, index) => {
            if (part.type === 'text') {
              return <span key={index}>{part.value}</span>;
            } else {
              const val = values[index] !== undefined ? values[index] : part.name;
              return (
                <span key={index} className="relative inline-grid mx-0.5 align-middle">
                  <span className="invisible col-start-1 row-start-1 px-1 py-1 whitespace-pre min-w-[3ch] text-center">
                    {val || ' '}
                  </span>
                  <input
                    type="text"
                    placeholder={part.name}
                    value={val}
                    onChange={(e) => handleChange(index, e.target.value)}
                    className="col-start-1 row-start-1 w-full px-1 border-b-[3px] border-theme-border bg-transparent text-theme-accent font-medium focus:outline-none focus:border-theme-accent transition-colors text-center placeholder:text-theme-muted/40 placeholder:font-normal font-serif"
                  />
                </span>
              );
            }
          })}
        </p>
      </div>
    </div>
  );
};

export default PromptCard;
