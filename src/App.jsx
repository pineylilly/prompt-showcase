import React from 'react';
import PromptCard from './components/PromptCard';
import mockPrompts from './data/prompts.json';

function App() {
  return (
    <div className="min-h-screen bg-theme-bg text-theme-text py-12 px-6 sm:px-12">
      <div className="max-w-4xl mx-auto">
        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight text-theme-text">Prompt Showcase</h1>
          {/* <p className="text-theme-muted mt-2 text-lg">
            A minimal gallery of image generation transformations.
          </p> */}
        </header>

        <div className="flex flex-col gap-10">
          {mockPrompts.map((item) => (
            <PromptCard 
              key={item.id}
              inputImage={item.inputImage}
              generatedImage={item.generatedImage}
              promptText={item.promptText}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;
