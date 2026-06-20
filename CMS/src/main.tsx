import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { CMSProvider } from './CMSContext';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <CMSProvider>
      <App />
    </CMSProvider>
  </BrowserRouter>
);