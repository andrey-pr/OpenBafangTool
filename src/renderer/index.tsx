import { createRoot } from 'react-dom/client';
import log from 'electron-log/renderer';
import App from './App';
import { Provider } from 'react-redux';

log.info('Start');

const container = document.getElementById('root') as HTMLElement;
const root = createRoot(container);
root.render(
    // <Provider store={store}>
        <App />
    // </Provider>,
);
