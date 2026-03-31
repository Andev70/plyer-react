import React from 'react';
import ReactDOM from 'react-dom/client';
import Plyer from './src/Plyer';

const App = () => (
  <div style={{ width: '800px', margin: '50px auto' }}>
    <h1>React Player Test</h1>
    <Plyer 
      src="https://vjs.zencdn.net/v/oceans.mp4"
      poster="https://vjs.zencdn.net/v/oceans.png"
    />
  </div>
);

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
