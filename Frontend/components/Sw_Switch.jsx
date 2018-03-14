import React from 'react';
import styled from 'styled-components';

export default class Sw_Switch extends React.Component {

    constructor(props) {

        super(props);
    }


    render() {

        //const scs = initStyledComponents(this.props);

        return (
            <label className="s-switch">
                {
                    <input
                        disabled={this.props.disabled}
                        type="checkbox"
                        checked={this.props.checked}
                        onChange={this.props.onChange} />
                }
                {/* <scs.localSpan /> */}
                <span className="slider round"></span>
            </label>
        );
    }
}

const initStyledComponents = (props) => {

    const localSpan = styled.span`
color: '${props.color ? props.color : 'red'}';
`;


    return { localSpan };
};