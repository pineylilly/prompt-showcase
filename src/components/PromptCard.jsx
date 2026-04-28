import React, { useState } from 'react';
import { Copy, Check, X } from 'lucide-react';

const PromptCard = ({ inputImage, generatedImage, promptText }) => {
  const [values, setValues] = useState({});
  const [copied, setCopied] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

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
          onClick={() => setIsModalOpen(true)}
          className="w-full h-64 md:h-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
        />
      </div>

      {/* Prompt Text */}
      <div className="p-5">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-semibold text-theme-muted uppercase tracking-wide">
            Prompt
          </p>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsModalOpen(true)}
              className="text-xs font-medium text-theme-muted hover:text-theme-accent transition-colors underline"
            >
              See more
            </button>
            <button 
              onClick={handleCopy}
              className="flex items-center gap-1.5 text-xs font-medium text-theme-muted hover:text-theme-accent transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? <span className="text-green-500">Copied</span> : "Copy"}
            </button>
          </div>
        </div>
        <p className="text-theme-text font-serif text-base leading-loose whitespace-pre-wrap">
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
      {/* Modal */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={() => setIsModalOpen(false)}
        >
          <div 
            className="bg-theme-surface border border-theme-border rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl relative"
            onClick={e => e.stopPropagation()}
          >
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 z-10 p-2 bg-theme-bg/80 rounded-full text-theme-muted hover:text-theme-text transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Image Comparison */}
            <div className="flex flex-col sm:flex-row border-b border-theme-border">
              {inputImage && (
                <div className="w-full sm:w-1/2 p-4 border-b sm:border-b-0 sm:border-r border-theme-border bg-theme-bg/30">
                  <h3 className="text-xs font-semibold text-theme-muted uppercase tracking-wide mb-3">Input Image</h3>
                  <img src={inputImage} alt="Input" className="w-full h-auto rounded-lg mx-auto" />
                </div>
              )}
              <div className={inputImage ? "w-full sm:w-1/2 p-4 bg-theme-bg/30" : "w-full p-4 bg-theme-bg/30"}>
                <h3 className="text-xs font-semibold text-theme-muted uppercase tracking-wide mb-3">Generated Output</h3>
                <img src={generatedImage} alt="Output" className={`w-full h-auto rounded-lg mx-auto ${!inputImage ? 'max-w-2xl' : ''}`} />
              </div>
            </div>
            
            {/* Prompt details */}
            <div className="p-6 bg-theme-surface">
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
              <p className="text-theme-text font-serif text-base leading-loose whitespace-pre-wrap">
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
        </div>
      )}
    </div>
  );
};

export default PromptCard;
