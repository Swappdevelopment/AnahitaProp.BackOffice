import React from 'react';

import './WaitBlock.scss';


export default class WaitBlock extends React.Component {

    constructor(props) {

        super(props);
    }

    render() {

        const style = {
            height: '10px'
        };

        let size = '';

        if (this.props.height) {

            style['height'] = isNaN(this.props.height) ? this.props.height : `${this.props.height}px`;
        }

        if (this.props.marginBottom) {

            style['marginBottom'] = isNaN(this.props.marginBottom) ? this.props.marginBottom : `${this.props.marginBottom}px`;
        }

        if (this.props.width) {

            style['width'] = this.props.fullWidth ? '100%' : isNaN(this.props.width) ? this.props.width : `${this.props.width}px`;
        }
        else {

            switch (this.props.size) {

                case 'small':
                    size = ' small';
                    break;

                case 'medium':
                    size = ' medium';
                    break;

                case 'long':
                    size = ' long';
                    break;

                case 'super':
                case 'super-long':
                    size = ' super-long';
                    break;
            }
        }

        return (
            <div className={`wait-block${size}`} style={style}>
                {this.props.children}
            </div>
        );
    }
}