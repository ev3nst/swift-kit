import { createRoot } from 'react-dom/client';

import './styles/app.css';
import './styles/tiptap.css';

import App from './app';

createRoot(document.getElementById('root')!).render(<App />);
