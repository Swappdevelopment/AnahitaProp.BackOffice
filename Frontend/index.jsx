import * as ReactDOM from 'react-dom';
import * as React from 'react';
import { Provider } from 'mobx-react';

import './index.scss';

import CombinedStores from './stores/CombinedStores';
import ErrorBoundary from './ErrorBoundary';

import Shell from './components/Shell/Shell';


const combinedStores = new CombinedStores();

combinedStores.isInDevelopment = (!process.env.NODE_ENV || process.env.NODE_ENV === 'development');


ReactDOM.render(
    <Provider store={combinedStores}>
        <ErrorBoundary isInDevelopment={combinedStores.isInDevelopment}>
            <Shell />
        </ErrorBoundary>
    </Provider>,
    document.getElementById('react-root')
);

if (module && module.hot) {
    module.hot.accept();
}