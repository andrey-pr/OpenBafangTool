/* eslint-disable no-else-return */
import React from 'react';
import { Spin } from 'antd';
import IConnection from '../device/high-level/Connection';
import InterfaceType from '../types/InterfaceType';

const DeviceSelectionView = React.lazy(
    () => import('./views/DeviceSelectionView'),
);
const MainView = React.lazy(() => import('./views/MainView'));

type AppProps = {};

type AppState = {
    view: string;
    connection: IConnection | null;
    interfaceType: InterfaceType | null;
};

class App extends React.Component<AppProps, AppState> {
    constructor(props: any) {
        super(props);
        this.state = {
            view: 'device_selector',
            connection: null,
            interfaceType: null,
        };
        this.deviceSelectionHook = this.deviceSelectionHook.bind(this);
        this.toDeviceSelector = this.toDeviceSelector.bind(this);
    }

    deviceSelectionHook(
        newConnection: IConnection,
        interfaceType: InterfaceType,
    ): void {
        const { connection } = this.state;
        if (connection) {
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
            interfaceType: interfaceType,
        });
    }

    toDeviceSelector() {
        const { connection } = this.state;
        if (connection) {
            connection.disconnect();
        }
        this.setState({ view: 'device_selector' });
    }

    render() {
        const { view } = this.state;
        const { connection, interfaceType } = this.state;
        const loading = (
            <Spin
                spinning
                style={{ height: '100%', width: '100%', marginTop: '100px' }}
            />
        );
        if (view === 'device_selector') {
            return (
                <React.Suspense fallback={loading}>
                    <DeviceSelectionView
                        deviceSelectionHook={this.deviceSelectionHook}
                    />
                </React.Suspense>
            );
        } else if (view === 'main_view') {
            return (
                <React.Suspense fallback={loading}>
                    <MainView
                        connection={connection as IConnection}
                        interfaceType={interfaceType as InterfaceType}
                        backHook={this.toDeviceSelector}
                    />
                </React.Suspense>
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
