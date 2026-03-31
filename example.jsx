import React from 'react';
import ReactDOM from 'react-dom/client';
import Plyer from './src/Plyer';

const ExampleApp = () => {
  return (
    <div style={{ 
      fontFamily: 'system-ui, -apple-system, sans-serif',
      maxWidth: '1000px', 
      margin: '0 auto', 
      padding: '40px 20px',
      color: '#333'
    }}>
      <header style={{ marginBottom: '40px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '10px' }}>Plyer React Component</h1>
        <p style={{ fontSize: '1.2rem', color: '#666' }}>
          A feature-rich, customizable React video player with support for MP4, HLS, and DASH.
        </p>
      </header>

      <section style={{ marginBottom: '60px' }}>
        <h2 style={{ borderBottom: '2px solid #eee', paddingBottom: '10px', marginBottom: '20px' }}>
          1. Basic Usage (Single Source)
        </h2>
        <p style={{ marginBottom: '20px' }}>The simplest way to use Plyer is by providing a single <code>src</code> and a <code>poster</code>.</p>
        <div style={{ borderRadius: '8px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
          <Plyer 
            src="https://vjs.zencdn.net/v/oceans.mp4"
            poster="https://vjs.zencdn.net/v/oceans.png"
          />
        </div>
      </section>

      <section style={{ marginBottom: '60px' }}>
        <h2 style={{ borderBottom: '2px solid #eee', paddingBottom: '10px', marginBottom: '20px' }}>
          2. Multiple Qualities (Manual Selection)
        </h2>
        <p style={{ marginBottom: '20px' }}>You can provide an array of <code>sources</code> to allow users to manually switch between different qualities.</p>
        <div style={{ borderRadius: '8px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
          <Plyer 
            sources={[
              { label: '1080p', src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4' },
              { label: '720p', src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4' },
              { label: '480p', src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4' }
            ]}
            poster="https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/Elephant%27s_Dream_s1_protons.jpg/800px-Elephant%27s_Dream_s1_protons.jpg"
          />
        </div>
      </section>

      <section style={{ marginBottom: '60px' }}>
        <h2 style={{ borderBottom: '2px solid #eee', paddingBottom: '10px', marginBottom: '20px' }}>
          3. Adaptive Streaming (HLS)
        </h2>
        <p style={{ marginBottom: '20px' }}>Plyer automatically detects <code>.m3u8</code> files and uses <code>hls.js</code> for adaptive bitrate streaming.</p>
        <div style={{ borderRadius: '8px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
          <Plyer 
            src="https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8"
            poster="https://images.unsplash.com/photo-1536240478700-b869070f9279?auto=format&fit=crop&w=1000&q=80"
          />
        </div>
      </section>

      <section style={{ marginBottom: '60px' }}>
        <h2 style={{ borderBottom: '2px solid #eee', paddingBottom: '10px', marginBottom: '20px' }}>
          4. Adaptive Streaming (DASH)
        </h2>
        <p style={{ marginBottom: '20px' }}>Plyer also supports <code>.mpd</code> files using <code>dashjs</code>.</p>
        <div style={{ borderRadius: '8px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
          <Plyer 
            src="https://dash.akamaized.net/akamai/bbb_30fps/bbb_30fps.mpd"
            poster="https://peach.blender.org/wp-content/uploads/bbb-splash.png"
          />
        </div>
      </section>

      <footer style={{ marginTop: '80px', textAlign: 'center', color: '#888', fontSize: '0.9rem' }}>
        <p>Built with React and Plyer</p>
      </footer>
    </div>
  );
};

const rootElement = document.getElementById('root');
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(<ExampleApp />);
}
