import React from 'react';
import ReactDOM from 'react-dom/client';
import Plyer from './src/Plyer';

const App = () => (
  <div style={{ width: '800px', margin: '50px auto' }}>
    <h1>React Player Test</h1>
    <Plyer 
      src="http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
      poster="https://peach.blender.org/wp-content/uploads/bbb-splash.png"
    />
  </div>
);

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
