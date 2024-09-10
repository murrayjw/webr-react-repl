import React, { useState, useEffect, useRef } from 'react';

const useWebRConsole = () => {
  const [output, setOutput] = useState(['Loading webR, please wait...']);
  const [webRConsole, setWebRConsole] = useState(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    let consoleInstance;
    (async () => {
      const { Console } = await import('https://webr.r-wasm.org/latest/webr.mjs');
      consoleInstance = new Console({
        stdout: line => setOutput(o => [...o, line]),
        stderr: line => setOutput(o => [...o, line]),
        prompt: p => setOutput(o => [...o, p]),
        canvasImage: image => {
          const canvas = canvasRef.current;
          if (canvas) {
            const ctx = canvas.getContext('2d');
            ctx.drawImage(image, 0, 0);
          }
        },
        canvasNewPage: () => {
          const canvas = canvasRef.current;
          if (canvas) {
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
          }
        }
      });
      consoleInstance.run();
      setWebRConsole(consoleInstance);
    })();

    // Clean up code here if needed (currently no clean up required)
  }, []);

  return { webRConsole, output, setOutput, canvasRef };
};

function App() {
  const { webRConsole, output, setOutput, canvasRef } = useWebRConsole();
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
      <div>
        <canvas 
          ref={canvasRef} 
          width="1008" 
          height="1008" 
          style={{ width: '450px', height: '450px', border: '1px solid black' }} 
        />
      </div>
    </div>
  );
}

export default App;
