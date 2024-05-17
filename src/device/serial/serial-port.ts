import { AutoDetectTypes } from '@serialport/bindings-cpp';
import { SerialPort } from 'serialport';
import filterPorts from '../serial/serial-patcher';

const ports: {
    [id: string]: SerialPort<AutoDetectTypes>;
} = {};

export async function getSerialPorts(): Promise<string[]> {
    return filterPorts(
        (await SerialPort.list()).map((port) => port.path),
        true,
    );
}

export function openPort(
    path: string,
    baudRate: number,
    onOpen: () => void,
    onError: (err: Error | null) => void,
    onData: (path: string, data: Buffer) => void,
): void {
    ports[path] = new SerialPort({ path, baudRate, autoOpen: false });
    ports[path].open(onError);
    ports[path].on('open', onOpen);
    ports[path].on('readable', () => onData(path, ports[path].read()));
}

export async function writeToPort(
    path: string,
    message: Buffer,
): Promise<void> {
    ports[path].write(message);
}

export function closePort(path: string): void {
    if (ports[path]?.isOpen) {
        ports[path]?.close();
        delete ports[path];
    }
}
