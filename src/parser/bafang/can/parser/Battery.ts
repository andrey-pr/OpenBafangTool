import { ReadedCanFrame } from '../../../../types/BafangCanCommonTypes';
import {
    BafangCanBatteryCapacityData,
    BafangCanBatteryStateData,
} from '../../../../types/BafangCanSystemTypes';

export class BafangCanBatteryParser {
    public static cells(
        packet: ReadedCanFrame,
        cells_arr: number[],
    ): void {
        for (let i = 0; i < packet.data.length / 2; i++) {
            cells_arr[(packet.canCommandSubCode - 2) * 4 + i] =
                ((packet.data[i * 2 + 1] << 8) + packet.data[i * 2]) / 1000;
        }
    }

    public static capacity(
        packet: ReadedCanFrame,
    ): BafangCanBatteryCapacityData {
        return {
            full_capacity: (packet.data[1] << 8) + packet.data[0],
            capacity_left: (packet.data[3] << 8) + packet.data[2],
            rsoc: packet.data[4],
            asoc: packet.data[5],
            soh: packet.data[6],
        };
    }

    public static state(
        packet: ReadedCanFrame,
    ): BafangCanBatteryStateData {
        let tmp = (packet.data[1] << 8) + packet.data[0];
        if ((tmp & 32768) > 0) {
            tmp = 65536 - tmp;
        }
        return {
            current: tmp / 100,
            voltage: ((packet.data[3] << 8) + packet.data[2]) / 100,
            temperature: packet.data[4] - 40,
        };
    }
}
