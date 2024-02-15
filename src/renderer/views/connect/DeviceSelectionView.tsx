import {
    Button,
    Checkbox,
    Form,
    Select,
    Typography,
    Space,
    message,
} from 'antd';
import React from 'react';
import { CheckboxChangeEvent } from 'antd/es/checkbox';
import DeviceType from '../../models/DeviceType';
import IConnection from '../../device/Connection';
import BafangUartMotor from '../../device/BafangUartMotor';

const { Option } = Select;

interface DeviceSelectionProps {
    deviceSelectionHook: (connection: IConnection) => void;
}

function DeviceSelectionView(props: DeviceSelectionProps) {
    const [form] = Form.useForm();

    const [portList, setPortList] = React.useState<string[]>([]);

    const [connectionChecked, setConnectionChecked] =
        React.useState<boolean>(false);

    const [connection, setConnection] = React.useState<IConnection | null>(
        null,
    );

    const { deviceSelectionHook } = props;

    const onPortChange = (value: string) => {
        form.setFieldsValue({ port: value });
        setConnectionChecked(false);
    };

    const onTypeChange = (value: string) => {
        form.setFieldsValue({ type: value });
        setConnectionChecked(false);
    };

    const onLocalLawsAgreementChecked = (value: CheckboxChangeEvent) => {
        form.setFieldsValue({
            local_laws_agreement: value.target.checked,
        });
    };

    const onDisclaimerAgreementChecked = (value: CheckboxChangeEvent) => {
        form.setFieldsValue({
            disclaimer: value.target.checked,
        });
    };

    React.useEffect(() => {
        const interval = setInterval(() => {
            window.electron.ipcRenderer.sendMessage('list-serial-ports', []);

            window.electron.ipcRenderer.once('list-serial-ports', (arg) => {
                setPortList(arg as string[]);
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [setPortList]);

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
                form={form}
                name="device-selection"
                onFinish={() => {
                    deviceSelectionHook(connection as IConnection);
                }}
            >
                <Typography.Title level={3}>Select device</Typography.Title>
                <Form.Item
                    name="device_type"
                    label="Device type"
                    rules={[
                        { required: true, message: 'Device type is required' },
                    ]}
                >
                    <Select
                        onChange={onTypeChange}
                        allowClear
                        style={{ minWidth: '150px' }}
                    >
                        <Option value={DeviceType.BafangUartMotor}>
                            Motor
                        </Option>
                        <Option value={DeviceType.BafangUartDisplay}>
                            Display
                        </Option>
                    </Select>
                </Form.Item>
                <Form.Item
                    name="port"
                    label="Serial port"
                    rules={[
                        { required: true, message: 'Serial port is required' },
                    ]}
                >
                    <Select
                        onChange={onPortChange}
                        allowClear
                        style={{ minWidth: '150px' }}
                    >
                        <Option value="simulator">Simulator</Option>
                        {portComponents}
                    </Select>
                </Form.Item>
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
                                          new Error('You should obey the law'),
                                      ),
                        },
                    ]}
                >
                    <Checkbox
                        onChange={onLocalLawsAgreementChecked}
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
                        onChange={onDisclaimerAgreementChecked}
                        style={{ fontSize: '12px' }}
                    >
                        I understand, that developer of this software
                        <br />
                        do not care responsibility for any consequences
                        <br />
                        of changing configuration of e-bike or any other device
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
                                    form.getFieldValue('device_type') ===
                                    DeviceType.BafangUartMotor
                                ) {
                                    newConnection = new BafangUartMotor(
                                        form.getFieldValue('port'),
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
                                            setConnection(newConnection);
                                        } else {
                                            message.error('Connection error!');
                                        }
                                        setConnectionChecked(result);
                                        return null;
                                    })
                                    .catch(() => {
                                        setConnectionChecked(false);
                                        message.error('Connection error!');
                                    });
                            }}
                            disabled={
                                form.getFieldValue('port') == null ||
                                form.getFieldValue('type') == null
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

export default DeviceSelectionView;
