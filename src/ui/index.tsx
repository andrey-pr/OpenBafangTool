import { createRoot } from 'react-dom/client';
import App from './App';
import { log_info } from '../logging/BasicLogging';

log_info('Start');

const container = document.getElementById('root') as HTMLElement;
const root = createRoot(container);
root.render(<App />);
