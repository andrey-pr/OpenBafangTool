import { Device } from 'node-hid';

export async function getSerialPorts(): Promise<string[]> {
    return [];
}
export function listBesstDevices(): Device[] {
    return [];
}

export { requestPort } from '../../../device/serial/web/serial-port';
