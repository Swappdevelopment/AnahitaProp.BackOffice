import React from 'react';

import Helper from './Helper/Helper';


export default class ErrorBoundary extends React.Component {

    constructor(props) {

        super(props);

        this.state = { errorInfo: null };
    }

    componentDidCatch(error, info) {

        this.setState({ errorInfo: { error, info } });
    }

    render() {

        if (this.state.errorInfo) {

            if (this.props.isInDevelopment) {

                return (
                    <div>
                        <div style={{ position: 'fixed', backgroundColor: 'white', width: '100%' }}>
                            <div style={{ padding: '20px 25px', color: 'red' }}>
                                <h2>Something went wrong.</h2>
                            </div>
                            <div style={{ padding: '20px 25px', color: 'red' }}>
                                <h4>{this.state.errorInfo.error.message}</h4>
                            </div>
                        </div>

                        <div style={{ padding: '150px 0 0 70px', color: 'black' }}>
                            {
                                Helper.stringToParagraphs(this.state.errorInfo.error.stack)
                            }
                        </div>
                        <div style={{ padding: '50px 70px', color: 'gray' }}>
                            {
                                Helper.stringToParagraphs(this.state.errorInfo.info.componentStack)
                            }
                        </div>
                    </div>
                );
            }

            return (
                <div style={{
                    position: 'absolute',
                    left: '50%',
                    top: '50%',
                    transform: 'translate(-50%, -50%)',
                    color: 'red'
                }}>
                    <h2 style={{ position: 'fixed' }}>Something went wrong.</h2>
                </div>
            );
        }
        return this.props.children;
    }
}

