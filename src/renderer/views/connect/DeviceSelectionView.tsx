import React from 'react';
import { CheckboxChangeEvent } from 'antd/es/checkbox';
import {
    Button,
    Checkbox,
    Form,
    Select,
    Typography,
    Space,
    message,
} from 'antd';
import IConnection from '../../device/Connection';
import BafangUartMotor from '../../device/BafangUartMotor';
import {
    DeviceBrand,
    DeviceInterface,
    DeviceType,
} from '../../models/DeviceType';
import InterfaceType from '../../models/InterfaceType';

const { Option } = Select;

type DeviceSelectionProps = {
    deviceSelectionHook: (
        connection: IConnection,
        interfaceType: InterfaceType,
    ) => void;
};

type DeviceSelectionState = {
    portList: string[];
    connectionChecked: boolean;
    connection: IConnection | null;
    interfaceType: InterfaceType | null;
    deviceBrand: DeviceBrand | null;
    deviceInterface: DeviceInterface | null;
    deviceType: DeviceType | null;
    devicePort: string | null;
    localLawsAgreement: boolean | null;
    disclaimerAgreement: boolean | null;
};

class DeviceSelectionView extends React.Component<
    DeviceSelectionProps,
    DeviceSelectionState
> {
    constructor(props: DeviceSelectionProps) {
        super(props);
        this.state = {
            portList: [],
            connectionChecked: false,
            connection: null,
            interfaceType: null,
            deviceBrand: DeviceBrand.Bafang,
            deviceInterface: DeviceInterface.UART,
            deviceType: DeviceType.Motor,
            devicePort: null,
            localLawsAgreement: false,
            disclaimerAgreement: false,
        };

        setInterval(() => {
            window.electron.ipcRenderer.sendMessage('list-serial-ports', []);

            window.electron.ipcRenderer.once('list-serial-ports', (arg) => {
                this.setState({ portList: arg as string[] });
            });
        }, 1000);
    }

    render() {
        const { deviceSelectionHook } = this.props;
        const {
            portList,
            connectionChecked,
            connection,
            interfaceType,
            deviceBrand,
            deviceInterface,
            deviceType,
            devicePort,
        } = this.state;

        const portComponents = portList.map((item) => {
            return (
                <Option value={item} key={item}>
                    {item}
                </Option>
            );
        });

        return (
            <div
                style={{
                    height: '100%',
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                }}
            >
                <Form
                    name="device-selection"
                    onFinish={() => {
                        deviceSelectionHook(
                            connection as IConnection,
                            interfaceType as InterfaceType,
                        );
                    }}
                >
                    <Typography.Title level={3}>Select device</Typography.Title>
                    <Form.Item
                        name="interface_type"
                        label="Interface type"
                        rules={[
                            {
                                required: true,
                                message: 'Interface type is required',
                            },
                        ]}
                    >
                        <Select
                            onChange={(value: InterfaceType) => {
                                this.setState({
                                    interfaceType: value,
                                    connectionChecked: false,
                                });
                            }}
                            allowClear
                            style={{ minWidth: '150px' }}
                        >
                            <Option value={InterfaceType.Simplified}>
                                Simplified
                            </Option>
                            <Option value={InterfaceType.Full}>Full</Option>
                        </Select>
                    </Form.Item>
                    <Form.Item
                        name="device_brand"
                        label="Device brand"
                        rules={[
                            {
                                required: true,
                                message: 'Device brand is required',
                            },
                        ]}
                        initialValue={DeviceBrand.Bafang}
                    >
                        <Select
                            onChange={(value: DeviceBrand) => {
                                this.setState({
                                    deviceBrand: value,
                                    connectionChecked: false,
                                });
                            }}
                            allowClear
                            style={{ minWidth: '150px' }}
                        >
                            <Option value={DeviceBrand.Bafang}>Bafang</Option>
                        </Select>
                    </Form.Item>
                    {deviceBrand === DeviceBrand.Bafang && (
                        <Form.Item
                            name="device_interface"
                            label="Device interface"
                            rules={[
                                {
                                    required: true,
                                    message: 'Device interface is required',
                                },
                            ]}
                            initialValue={DeviceInterface.UART}
                        >
                            <Select
                                onChange={(value: DeviceInterface) => {
                                    this.setState({
                                        deviceInterface: value,
                                        connectionChecked: false,
                                    });
                                }}
                                allowClear
                                style={{ minWidth: '150px' }}
                            >
                                <Option value={DeviceInterface.UART}>
                                    UART
                                </Option>
                                <Option value={DeviceInterface.CAN} disabled>
                                    CAN - not yet supported
                                </Option>
                            </Select>
                        </Form.Item>
                    )}
                    {deviceBrand === DeviceBrand.Bafang &&
                        deviceInterface === DeviceInterface.UART && (
                            <Form.Item
                                name="device_type"
                                label="Device type"
                                rules={[
                                    {
                                        required: true,
                                        message: 'Device type is required',
                                    },
                                ]}
                                initialValue={DeviceType.Motor}
                            >
                                <Select
                                    onChange={(value: DeviceType) => {
                                        this.setState({
                                            deviceType: value,
                                            connectionChecked: false,
                                        });
                                    }}
                                    allowClear
                                    style={{ minWidth: '150px' }}
                                >
                                    <Option value={DeviceType.Motor}>
                                        Motor
                                    </Option>
                                    <Option value={DeviceType.Display} disabled>
                                        Display - not yet supported
                                    </Option>
                                </Select>
                            </Form.Item>
                        )}
                    {deviceBrand === DeviceBrand.Bafang &&
                        deviceInterface === DeviceInterface.UART && (
                            <Form.Item
                                name="port"
                                label="Serial port"
                                rules={[
                                    {
                                        required: true,
                                        message: 'Serial port is required',
                                    },
                                ]}
                            >
                                <Select
                                    onChange={(value: string) => {
                                        this.setState({
                                            devicePort: value,
                                            connectionChecked: false,
                                        });
                                    }}
                                    allowClear
                                    style={{ minWidth: '150px' }}
                                >
                                    <Option value="simulator">Simulator</Option>
                                    {portComponents}
                                </Select>
                            </Form.Item>
                        )}
                    <Form.Item
                        name="localLawsAgreement"
                        label=""
                        initialValue={false}
                        valuePropName="checked"
                        rules={[
                            {
                                validator: (_, value) =>
                                    value
                                        ? Promise.resolve()
                                        : Promise.reject(
                                              new Error(
                                                  'You should obey the law',
                                              ),
                                          ),
                            },
                        ]}
                    >
                        <Checkbox
                            onChange={(value: CheckboxChangeEvent) => {
                                this.setState({
                                    localLawsAgreement: value.target.checked,
                                });
                            }}
                            style={{ fontSize: '12px' }}
                        >
                            I checked local laws and regulations and
                            <br />
                            will not use this program to violate them
                            <span style={{ color: 'red' }}>&nbsp;*</span>
                        </Checkbox>
                    </Form.Item>
                    <Form.Item
                        name="disclaimer_agreement"
                        label=""
                        initialValue={false}
                        valuePropName="checked"
                        rules={[
                            {
                                validator: (_, value) =>
                                    value
                                        ? Promise.resolve()
                                        : Promise.reject(
                                              new Error(
                                                  'Developer does not carry any responsibility',
                                              ),
                                          ),
                            },
                        ]}
                    >
                        <Checkbox
                            onChange={(value: CheckboxChangeEvent) => {
                                this.setState({
                                    disclaimerAgreement: value.target.checked,
                                });
                            }}
                            style={{ fontSize: '12px' }}
                        >
                            I understand, that developer of this software
                            <br />
                            do not care responsibility for any consequences
                            <br />
                            of changing configuration of e-bike or any other
                            device
                            <span style={{ color: 'red' }}>&nbsp;*</span>
                        </Checkbox>
                    </Form.Item>
                    <Form.Item>
                        <Space>
                            <Button
                                type="primary"
                                onClick={() => {
                                    let newConnection: IConnection;
                                    if (
                                        deviceBrand === DeviceBrand.Bafang &&
                                        deviceInterface ===
                                            DeviceInterface.UART &&
                                        deviceType === DeviceType.Motor &&
                                        devicePort !== null
                                    ) {
                                        newConnection = new BafangUartMotor(
                                            devicePort,
                                        );
                                    } else {
                                        message.info(
                                            'This kind of device is not supported yet',
                                        );
                                        return;
                                    }
                                    newConnection
                                        .testConnection()
                                        .then((result) => {
                                            if (result) {
                                                this.setState({
                                                    connection: newConnection,
                                                });
                                            } else {
                                                message.error(
                                                    'Connection error!',
                                                );
                                            }
                                            this.setState({
                                                connectionChecked: result,
                                            });
                                            return null;
                                        })
                                        .catch(() => {
                                            this.setState({
                                                connectionChecked: false,
                                            });
                                            message.error('Connection error!');
                                        });
                                }}
                                disabled={
                                    deviceBrand === null ||
                                    devicePort === null ||
                                    (deviceBrand === DeviceBrand.Bafang &&
                                        (deviceInterface === null ||
                                            deviceType === null)) ||
                                    interfaceType === null
                                }
                            >
                                Check connection
                            </Button>
                            <Button
                                type="primary"
                                htmlType="submit"
                                disabled={!connectionChecked}
                            >
                                Select
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </div>
        );
    }
}

export default DeviceSelectionView;
