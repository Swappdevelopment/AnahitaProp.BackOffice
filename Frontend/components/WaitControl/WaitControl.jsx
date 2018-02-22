import React from 'react';

import './WaitControl.scss';


export default class WaitControl extends React.Component {

    constructor(props) {

        super(props);
    }

    render() {

        const cn = this.props.opacity50 ? ' opacity-50' : '';

        const style = {};

        if (this.props.height > 0) {
            style.height = `${this.props.height}px`;
        }

        return (
            this.props.show ?
                <div className={`ui-spinner${cn}`} style={style}>
                    <div className="sk-folding-cube">
                        <div className="sk-cube1 sk-cube"></div>
                        <div className="sk-cube2 sk-cube"></div>
                        <div className="sk-cube4 sk-cube"></div>
                        <div className="sk-cube3 sk-cube"></div>
                    </div>
                </div>
                :
                null
        );
    }
}