import { ParsedCanFrame } from '../../../../types/BafangCanCommonTypes';
import {
    AssistLevel,
    BafangCanDisplayData1,
    BafangCanDisplayData2,
    BafangCanDisplayRealtimeData,
    BafangCanRideMode,
} from '../../../../types/BafangCanSystemTypes';
import { charsToString } from '../../../../utils/utils';

export class BafangCanDisplayParser {
    private static decodeCurrentAssistLevel(
        currentAssistLevelCode: number,
        totalAssistLevels: number,
    ): AssistLevel {
        const assistLevelTable: {
            [key: number]: { [key: number]: AssistLevel };
        } = {
            3: { 0: 0, 12: 1, 2: 2, 3: 3, 6: 'walk' },
            4: { 0: 0, 1: 1, 12: 2, 21: 3, 3: 4, 6: 'walk' },
            5: { 0: 0, 11: 1, 13: 2, 21: 3, 23: 4, 3: 5, 6: 'walk' },
            9: {
                0: 0,
                1: 1,
                11: 2,
                12: 3,
                13: 4,
                2: 5,
                21: 6,
                22: 7,
                23: 8,
                3: 9,
                6: 'walk',
            },
        };
        if (
            (totalAssistLevels <= 3 || totalAssistLevels >= 5) &&
            totalAssistLevels !== 9
        ) {
            totalAssistLevels = 5;
        }
        return assistLevelTable[totalAssistLevels][currentAssistLevelCode];
    }

    public static errorCodes(data: number[]): number[] {
        const errors: number[] = [];
        let errorString = charsToString(data);
        while (errorString.length >= 2) {
            errors.push(parseInt(errorString.substring(0, 2), 10));
            errorString = errorString.substring(2);
        }
        return errors;
    }

    public static package0(
        packet: ParsedCanFrame,
    ): BafangCanDisplayRealtimeData {
        return {
            assist_levels: packet.data[0] & 0b1111,
            ride_mode:
                packet.data[0] & 0b10000
                    ? BafangCanRideMode.BOOST
                    : BafangCanRideMode.ECO,
            boost: (packet.data[0] & 0b100000) >> 5 === 1,
            current_assist_level:
                BafangCanDisplayParser.decodeCurrentAssistLevel(
                    packet.data[1],
                    packet.data[0] & 0b1111,
                ),
            light: (packet.data[2] & 1) === 1,
            button: (packet.data[2] & 0b10) >> 1 === 1,
        };
    }

    public static package1(packet: ParsedCanFrame): BafangCanDisplayData1 {
        return {
            total_mileage:
                (packet.data[2] << 16) + (packet.data[1] << 8) + packet.data[0],
            single_mileage:
                ((packet.data[5] << 16) +
                    (packet.data[4] << 8) +
                    packet.data[3]) /
                10,
            max_speed: ((packet.data[7] << 8) + packet.data[6]) / 10,
        };
    }

    public static package2(packet: ParsedCanFrame): BafangCanDisplayData2 {
        return {
            average_speed: ((packet.data[1] << 8) + packet.data[0]) / 10,
            service_mileage:
                ((packet.data[4] << 16) +
                    (packet.data[3] << 8) +
                    packet.data[2]) /
                10,
        };
    }
}
