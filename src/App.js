// App.js
import React, { useState, useEffect } from 'react';

// Import Console dynamically as it is an ES module
const useWebRConsole = () => {
  const [output, setOutput] = useState(['Loading webR, please wait...']);
  const [webRConsole, setWebRConsole] = useState(null);

  useEffect(() => {
    let consoleInstance;
    (async () => {
      const { Console } = await import('https://webr.r-wasm.org/latest/webr.mjs');
      consoleInstance = new Console({
        stdout: line => setOutput(o => [...o, line]),
        stderr: line => setOutput(o => [...o, line]),
        prompt: p => setOutput(o => [...o, p]),
      });
      consoleInstance.run();
      setWebRConsole(consoleInstance);
    })();

    return () => {
      if (consoleInstance) {
        consoleInstance.destroy();
      }
    };
  }, []);

  return { webRConsole, output, setOutput };
};

function App() {
  const { webRConsole, output, setOutput } = useWebRConsole();
  const [inputValue, setInputValue] = useState('');

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const sendInput = () => {
    if (webRConsole) {
      webRConsole.stdin(inputValue);
      setOutput(o => [...o, inputValue]);
      setInputValue('');
    }
  };

  return (
    <div className="App">
      <div>
        <pre><code>{output.join('\n')}</code></pre>
        <input 
          value={inputValue}
          onChange={handleInputChange}
          spellCheck="false" 
          autoComplete="off" 
          type="text"
          onKeyPress={(e) => e.key === 'Enter' && sendInput()}
        />
        <button onClick={sendInput}>Run</button>
      </div>
    </div>
  );
}

export default App;
