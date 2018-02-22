import React from 'react';


export default class DropdownEditorMenu extends React.Component {

    constructor(props) {

        super(props);

        this.listElement = null;

        this.onClick = this.onClick.bind(this);
    }

    onClick(e) {

        if (this.props.onClick) {

            this.props.onClick(e);
        }
    }

    render() {

        const style = { cursor: 'pointer' };

        return (
            <li style={style} role="presentation" className={(this.props.className ? this.props.className : '') + (this.props.active ? ' active' : '')}>
                <a role="menuitem" tabIndex="-1" onClick={this.onClick}>{this.props.children}</a>
            </li>
        );
    }
}