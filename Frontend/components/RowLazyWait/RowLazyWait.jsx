import React from 'react';
import LazyLoad from 'react-lazy-load';

import './RowLazyWait.scss';


export default class RowLazyWait extends React.Component {

    constructor(props) {

        super(props);
    }

    render() {

        return (
            <td colSpan={this.props.colSpan}>
                <LazyLoad debounce={false}>
                    <RowLazyWaitContent onAppear={this.props.onAppear} spin={this.props.spin}/>
                </LazyLoad>
            </td>
        );
    }
}

class RowLazyWaitContent extends React.Component {

    constructor(props) {

        super(props);
    }

    componentWillMount() {
        if (this.props.onAppear) {
            this.props.onAppear();
        }
    }

    render() {

        return (
            <div className="row-lazy-load">
                <span className={this.props.spin ? 'spinner' : ''}></span>
            </div>

        );
    }
}