import React from 'react';
import ReactFOM from 'react-dom';

import './SelectEditor.scss';


export default class SelectEditor extends React.Component {

    constructor(props) {

        super(props);

        this.willUnmount = false;

        this.state = {
            selectedValue: null,
            inputValue: props.title ? props.title : '',
            filterValue: '',
            isOpen: false
        };

        this.hiddenButtonElement = null;
        this.listElement = null;

        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.handleOnBlur = this.handleOnBlur.bind(this);
    }

    componentWillUnmount() {

        this.willUnmount = true;
    }

    componentWillReceiveProps(nextProps) {

        if (nextProps.title !== this.state.inputValue && !this.willUnmount) {

            this.setState({ inputValue: nextProps.title });
        }
    }

    componentWillUpdate(nextProps, nextState) {

        if (this.listElement) {

            let clearFilterValue = false;

            if (nextState.inputValue !== this.state.inputValue) {

                clearFilterValue = (nextState.inputValue !== nextState.filterValue);
            }

            if (clearFilterValue) {

                if (!this.willUnmount)
                    this.setState({ filterValue: '' });
            }
            else if (nextState.filterValue !== this.state.filterValue) {

                if (nextState.filterValue) {

                    const filterValue = nextState.filterValue.toLowerCase();

                    let isFirst = true;

                    for (let li of this.listElement.childNodes) {

                        if (li) {

                            let al = li.getElementsByTagName('a');

                            al = al && al.length > 0 ? al[0] : null;

                            if (al && al.innerText && al.innerText.toLowerCase().startsWith(filterValue)) {

                                li.style.display = 'block';

                                if (isFirst) {

                                    li.className += ' highlighted';
                                    isFirst = false;
                                }
                                else {
                                    li.classList.remove('highlighted');
                                }
                            }
                            else {

                                li.style.display = 'none';
                                li.classList.remove('highlighted');
                            }
                        }
                    }
                }
                else {

                    for (let li of this.listElement.childNodes) {

                        if (li) {

                            li.style.display = 'block';
                            li.classList.remove('highlighted');
                        }
                    }
                }
            }
        }
    }

    handleKeyDown(e) {

        switch (e.keyCode) {

            case 13:
            case 38:
            case 40:

                if (this.listElement) {

                    let highlighted = null;

                    if (e.keyCode === 13) {

                        let highlightedIndex = -1;

                        highlighted = {
                            element: [...this.listElement.childNodes].find((element, i) => {

                                if (element.classList.contains('highlighted')) {

                                    highlightedIndex = i;
                                    return true;
                                }
                            })
                        };

                        if (highlightedIndex >= 0) {

                            highlighted.reactElement = this.props.children[highlightedIndex];

                            if (highlighted && highlighted.reactElement && highlighted.reactElement.props && highlighted.reactElement.props.onClick) {

                                highlighted.reactElement.props.onClick();
                                e.target.blur();
                            }
                        }
                    }
                    else {

                        const allElements = [...this.listElement.childNodes].map((v, i) => {
                            return { element: v, elementIndex: i, reactElement: null, displayedIndex: -1 };
                        });

                        let dispIndex = 0;
                        const displayedElements = allElements.filter(item => {

                            if (item && item.element && item.element.style.display !== 'none') {

                                item.reactElement = this.props.children[item.elementIndex];
                                item.displayedIndex = dispIndex++;

                                if (item.element.classList.contains('highlighted')) {

                                    highlighted = item;
                                }
                                return true;
                            }

                            return false;
                        });

                        if (displayedElements.length > 0) {

                            let scrollToElement = null;

                            switch (e.keyCode) {

                                case 38: //arrow up

                                    if (highlighted) {

                                        if (highlighted.displayedIndex > 0) {

                                            highlighted.element.classList.remove('highlighted');
                                            scrollToElement = displayedElements[highlighted.displayedIndex - 1].element;
                                        }
                                    }
                                    break;

                                case 40: //arrow down

                                    if (highlighted) {

                                        if (highlighted.displayedIndex < (displayedElements.length - 1)) {

                                            highlighted.element.classList.remove('highlighted');
                                            scrollToElement = displayedElements[highlighted.displayedIndex + 1].element;
                                        }
                                    }
                                    else {

                                        scrollToElement = displayedElements[0].element;
                                    }
                                    break;
                            }

                            if (scrollToElement) {

                                scrollToElement.classList.add('highlighted');
                                this.listElement.scrollTo(0, scrollToElement.offsetTop);
                            }
                        }
                    }
                }

                break;
        }
    }

    handleOnBlur(e, callback) {


        setTimeout(() => {

            if (!this.willUnmount) {

                this.setState({ isOpen: false });

                if (callback) {
                    callback();
                }
            }
        }, 250);
    }

    render() {

        return (
            <div className={`s-select${this.state.isOpen ? ' open' : ''}${this.props.className ? ' ' + this.props.className : ''}`}>
                <select
                    value={this.state.selectedValue}
                    className="form-control"
                    onChange={e => this.setState({ selectedValue: e.target.value })}>
                    <option value={1}>111</option>
                    <option value={2}>222</option>
                    <option value={3}>333</option>
                </select>
                {/* <input
                    className="form-control"
                    onFocus={e => {

                        if (!this.willUnmount) {
                            this.setState({ isOpen: true });
                            e.target.select();
                        }
                    }} /> */}
            </div>
        );
    }
}