import React from 'react';
import IConnection from '../../device/Connection';
import BafangUartMotor from '../../device/BafangUartMotor';
import { CheckboxChangeEvent } from 'antd/es/checkbox';
import {
    DeviceBrand,
    DeviceInterface,
    DeviceType,
} from '../../models/DeviceType';
import {
    Button,
    Checkbox,
    Form,
    Select,
    Typography,
    Space,
    message,
} from 'antd';
import DifficultyLevel from '../../models/DifficultyLevel';

const { Option } = Select;

type DeviceSelectionProps = {
    deviceSelectionHook: (
        connection: IConnection,
        difficulty_level: DifficultyLevel,
    ) => void;
};

type DeviceSelectionState = {
    portList: string[];
    connectionChecked: boolean;
    connection: IConnection | null;
    difficulty_level: DifficultyLevel | null;
    device_brand: DeviceBrand | null;
    device_interface: DeviceInterface | null;
    device_type: DeviceType | null;
    device_port: string | null;
    local_laws_agreement: boolean | null;
    disclaimer_agreement: boolean | null;
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
            difficulty_level: null,
            device_brand: DeviceBrand.Bafang,
            device_interface: DeviceInterface.UART,
            device_type: DeviceType.Motor,
            device_port: null,
            local_laws_agreement: false,
            disclaimer_agreement: false,
        };

        const interval = setInterval(() => {
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
            difficulty_level,
            device_brand,
            device_interface,
            device_type,
            device_port,
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
                            difficulty_level,
                        );
                    }}
                >
                    <Typography.Title level={3}>Select device</Typography.Title>
                    <Form.Item
                        name="difficulty_level"
                        label="Interface type"
                        rules={[
                            {
                                required: true,
                                message: 'Interface type is required',
                            },
                        ]}
                    >
                        <Select
                            onChange={(value: DifficultyLevel) => {
                                this.setState({
                                    difficulty_level: value,
                                    connectionChecked: false,
                                });
                            }}
                            allowClear
                            style={{ minWidth: '150px' }}
                        >
                            <Option value={DifficultyLevel.Simplified}>
                                Simplified
                            </Option>
                            <Option value={DifficultyLevel.Pro}>Full</Option>
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
                                    device_brand: value,
                                    connectionChecked: false,
                                });
                            }}
                            allowClear
                            style={{ minWidth: '150px' }}
                        >
                            <Option value={DeviceBrand.Bafang}>Bafang</Option>
                        </Select>
                    </Form.Item>
                    {device_brand == DeviceBrand.Bafang && (
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
                                        device_interface: value,
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
                    {device_brand == DeviceBrand.Bafang &&
                        device_interface == DeviceInterface.UART && (
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
                                            device_type: value,
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
                    {device_brand == DeviceBrand.Bafang &&
                        device_interface == DeviceInterface.UART && (
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
                                            device_port: value,
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
                        name="local_laws_agreement"
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
                                    local_laws_agreement: value.target.checked,
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
                        name="disclaimer"
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
                                    disclaimer_agreement: value.target.checked,
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
                                        device_brand === DeviceBrand.Bafang &&
                                        device_interface ===
                                            DeviceInterface.UART &&
                                        device_type === DeviceType.Motor &&
                                        device_port !== null
                                    ) {
                                        newConnection = new BafangUartMotor(
                                            device_port,
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
                                    device_brand == null ||
                                    device_port == null ||
                                    (device_brand == DeviceBrand.Bafang &&
                                        (device_interface == null ||
                                            device_type == null)) ||
                                    difficulty_level == null
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
