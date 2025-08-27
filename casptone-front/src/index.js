import React, { useEffect, useMemo, useState } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
function ThemeWrapper(){
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'wood');

  useEffect(() => {
    const handler = (e) => {
      const next = e?.detail || (theme === 'wood' ? 'standard' : 'wood');
      setTheme(next);
      localStorage.setItem('theme', next);
      try {
        const el = document.getElementById('theme-toast');
        if (el) {
          el.textContent = `Theme: ${next}`;
          el.style.display = 'block';
          clearTimeout(window._themeToastTimer);
          window._themeToastTimer = setTimeout(()=> { if (el) el.style.display = 'none'; }, 1400);
        }
      } catch {}
    };
    window.addEventListener('toggle-theme', handler);
    window.setTheme = (t) => handler({ detail: t });
    return () => window.removeEventListener('toggle-theme', handler);
  }, [theme]);

  useEffect(() => {
    const onClick = (ev) => {
      const el = ev.target.closest('.btn-wood');
      if (el && navigator.vibrate) {
        try { navigator.vibrate(12); } catch {}
      }
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  const wrapperClass = useMemo(() => (theme === 'wood' ? 'wood-app' : ''), [theme]);

  return (
    <div className={wrapperClass}>
      <App />
      <div id="theme-toast" className="toast-wood" style={{ display: 'none' }}>Theme</div>
    </div>
  );
}

root.render(
  <React.StrictMode>
    <ThemeWrapper />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
