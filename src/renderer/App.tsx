/* eslint-disable no-else-return */
import React from 'react';
import DeviceSelectionView from './views/connect/DeviceSelectionView';
import MainView from './views/main/MainView';
import IConnection from './device/Connection';

type AppProps = {};

type AppState = {
    view: string;
    connection: IConnection | null;
};

class App extends React.Component<AppProps, AppState> {
    constructor(props: any) {
        super(props);
        this.state = {
            view: 'device_selector',
            connection: null,
        };
        this.deviceSelectionHook = this.deviceSelectionHook.bind(this);
        this.toDeviceSelector = this.toDeviceSelector.bind(this);
    }

    deviceSelectionHook(newConnection: IConnection): void {
        const { connection } = this.state;
        if (connection != null) {
            connection.disconnect();
        }
        newConnection
            .connect()
            .then((value) => {
                if (!value) {
                    this.setState({ view: 'connection_error' });
                }
                return value;
            })
            .catch(() => {
                this.setState({ view: 'connection_error' });
            });
        this.setState({
            view: 'main_view',
            connection: newConnection,
        });
    }

    toDeviceSelector() {
        const { connection } = this.state;
        if (connection != null) {
            connection.disconnect();
        }
        this.setState({ view: 'device_selector' });
    }

    render() {
        const { view } = this.state;
        const { connection } = this.state;
        if (view === 'device_selector') {
            return (
                <DeviceSelectionView
                    deviceSelectionHook={this.deviceSelectionHook}
                />
            );
        } else if (view === 'main_view') {
            return (
                <MainView
                    connection={connection as IConnection}
                    backHook={this.toDeviceSelector}
                />
            );
        } else if (view === 'connection_error') {
            console.log('connection error');
            return <span />;
        } else {
            return <div>Unknown error</div>; // TODO add error page
        }
    }
}

export default App;
