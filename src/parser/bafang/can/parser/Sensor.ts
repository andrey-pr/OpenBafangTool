import { ParsedCanFrame } from '../../../../types/BafangCanCommonTypes';
import { BafangCanSensorRealtime } from '../../../../types/BafangCanSystemTypes';

export class BafangCanSensorParser {
    public static package0(
        packet: ParsedCanFrame,
    ): BafangCanSensorRealtime {
        return {
            torque: (packet.data[1] << 8) + packet.data[0],
            cadence: packet.data[2],
        };
    }
}
