const tntVirtualDebugPorts = [
    '/dev/tnt0',
    '/dev/tnt1',
    '/dev/tnt2',
    '/dev/tnt3',
    '/dev/tnt4',
    '/dev/tnt5',
    '/dev/tnt6',
    '/dev/tnt7',
];

export default function filterPorts(ports: string[], usbOnly: boolean) {
    let newPorts = ports;
    if (usbOnly) {
        if (process.platform === 'linux') {
            newPorts = newPorts.filter(
                (port) =>
                    port.indexOf('/dev/ttyWCH') > -1 ||
                    port.indexOf('/dev/ttyACM') > -1 ||
                    port.indexOf('/dev/ttyUSB') > -1 ||
                    port.indexOf('/dev/ttyXRUSB') > -1,
            );
        }
    }
    if (process.env.NODE_ENV === 'development') {
        if (process.platform === 'linux') {
            newPorts = [...newPorts, ...tntVirtualDebugPorts];
        }
    }
    return newPorts;
}
