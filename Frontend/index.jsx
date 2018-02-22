import * as ReactDOM from 'react-dom';
import * as React from 'react';
import { Provider } from 'mobx-react';

import './index.scss';

import CombinedStores from './stores/CombinedStores';

import Shell from './components/Shell/Shell';


const combinedStores = new CombinedStores();

ReactDOM.render(
    <Provider store={combinedStores}>
        <Shell />
    </Provider>,
    document.getElementById('react-root')
);

if (module && module.hot) {
    module.hot.accept();
}