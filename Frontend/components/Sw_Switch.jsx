import React from 'react';
import styled from 'styled-components';

export default class Sw_Switch extends React.Component {

    constructor(props) {

        super(props);
    }

    render() {

        const sc = initStyledComponents(this.props);

        return (

            <sc.Label>
                {
                    this.props.showSpinner ?
                        <div className='spinner' />
                        :
                        <div>
                            <sc.Input
                                type='checkbox'
                                disabled={this.props.disabled}
                                checked={this.props.checked}
                                onChange={this.props.onChange}
                            />
                            <sc.Span />
                        </div>
                }
            </sc.Label>
        );
    }
}

const initStyledComponents = (props) => {

    let labelWidth, labelHeight, spanWidth, spanHeight;

    switch (props.size) {
        case 'xsmall':
            break;
        case 'small':
            break;
        case 'large':
            break;
        case 'xlarge':
            break;
        default:
            labelWidth = 60;
            labelHeight = 34;
            spanWidth = 26;
            spanHeight = 26;
            break;
    }

    const Label = styled.label`
        position: relative;
        display: inline-block;
        width: ${labelWidth}px;
        height: ${labelHeight}px;
        vertical-align: middle;
`;

    const Span = styled.span`
        position: absolute;
        cursor: pointer;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: ${props.unCheckedColor ? props.unCheckedColor : 'red'};
        transition: .4s;
        border-radius: ${labelHeight}px;

        &:before{
            position: absolute;
            content: "";
            width: ${spanWidth}px;
            height: ${spanHeight}px;
            left: 4px;
            bottom: 4px;
            background-color: white;
            -webkit-transition: .4s;
            transition: .4s;
            border-radius: 50%
        }
`;

    const Input = styled.input`
        
        display:none;
        &:checked + ${Span}:before {
            transform: translateX(${spanWidth}px);
            
        };
        &:checked + ${Span} {
            background-color: ${props.checkedColor ? props.checkedColor : 'green'};
        };
`;

    return { Label, Input, Span };
};
