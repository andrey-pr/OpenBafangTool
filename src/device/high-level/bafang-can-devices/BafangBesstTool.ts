import {
    getBesstHVDemo,
    getBesstSNDemo,
    getBesstSVDemo,
} from '../../../utils/can/demo_object_provider';

export default class BafangBesstTool {
    //TODO replace setters with inner parser

    private serial_number: string | null = null;

    private hardware_version: string | null = null;

    private software_version: string | null = null;

    constructor(demo: boolean) {
        if (demo) {
            this.serial_number = getBesstSNDemo();
            this.software_version = getBesstSVDemo();
            this.hardware_version = getBesstHVDemo();
        }
    }

    public loadData(): void {}

    public get serialNumber(): string | null {
        return this.serial_number;
    }

    public get hardwareVersion(): string | null {
        return this.hardware_version;
    }

    public get softwareVersion(): string | null {
        return this.software_version;
    }
}
