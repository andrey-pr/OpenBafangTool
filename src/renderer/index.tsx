import { createRoot } from 'react-dom/client';
import log from 'electron-log/renderer';
import App from './App';

log.info('Start');

const container = document.getElementById('root') as HTMLElement;
const root = createRoot(container);
root.render(<App />);
