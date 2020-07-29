import React from 'react';
import ReactDOM from 'react-dom';

import App from './components/App/App';

window.renderCharts = function(mountId, config) {
    ReactDOM.render(
        <React.StrictMode>
            <App config={config} />
        </React.StrictMode>,
        document.getElementById(mountId)
    );
}
