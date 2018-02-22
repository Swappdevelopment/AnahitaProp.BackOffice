import React from 'react';
import ReactFOM from 'react-dom';

import './DropdownEditor.scss';


export default class DropdownEditor extends React.Component {

    constructor(props) {

        super(props);

        this.willUnmount = false;

        this.state = {
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
            <div className={`dropdown btn-group${this.state.isOpen ? ' open' : ''}`}>
                <button
                    ref={r => {
                        this.hiddenButtonElement = ReactFOM.findDOMNode(r);
                    }}
                    id={this.props.id}
                    style={{ display: 'none' }}
                    role="button"
                    aria-haspopup="true"
                    aria-expanded={`${this.state.isOpen ? 'true' : 'false'}`}
                    disabled={this.props.disabled}
                    type="button">
                </button>

                <div className="dropdown-input-wrapper">
                    <input
                        disabled={this.props.disabled}
                        className={this.props.className}
                        value={this.state.inputValue}
                        onKeyDown={this.handleKeyDown}
                        onChange={e => {

                            if (!this.willUnmount)
                                this.setState({ inputValue: e.target.value, filterValue: e.target.value });
                        }}
                        onFocus={e => {

                            if (!this.willUnmount) {
                                this.setState({ isOpen: true });
                                e.target.select();
                            }
                        }}
                        onBlur={this.handleOnBlur} />
                    <span className="caret"></span>
                </div>

                <ul
                    ref={r => {
                        this.listElement = ReactFOM.findDOMNode(r);
                    }}
                    role="menu"
                    className="dropdown-menu"
                    aria-labelledby={this.props.id}>
                    {this.props.children}
                </ul>
            </div >
        );
    }
}