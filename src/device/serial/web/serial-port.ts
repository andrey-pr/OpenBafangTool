let port: SerialPort;
let reader: ReadableStreamDefaultReader;
let writer: WritableStreamDefaultWriter;
let decoder = new TextDecoder();

export async function requestPort(baudRate: number): Promise<boolean> {
    if ('serial' in navigator) {
        try {
            port = await (navigator as any).serial.requestPort();
            if (!port) return false;
            await port.open({ baudRate });

            writer = port.writable?.getWriter();
            reader = port.readable?.getReader();

            return true;
        } catch (err) {
            console.error('There was an error opening the serial port:', err);
        }
    } else {
        console.error(
            "Web serial doesn't seem to be enabled in your browser. Check https://developer.mozilla.org/en-US/docs/Web/API/Web_Serial_API#browser_compatibility for more info.",
        );
    }
    return false;
}

export async function writeToPort(
    path: string,
    message: Uint8Array,
): Promise<void> {
    await writer.write(message);
}

export function closePort(path?: string): void {
    port.close();
}

// async read(): Promise<string> {
//     try {
//         const readerData = await this.reader.read();
//         return this.decoder.decode(readerData.value);
//     } catch (err) {
//         const errorMessage = `error reading data: ${err}`;
//         console.error(errorMessage);
//         return errorMessage;
//     }
// }
