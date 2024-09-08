import getAppDataPath from 'appdata-path';
import log from 'electron-log/renderer';
import path from 'path';
import BafangCanController from '../device/high-level/bafang-can-devices/BafangCanController';
import BafangCanDisplay from '../device/high-level/bafang-can-devices/BafangCanDisplay';
import BafangCanSensor from '../device/high-level/bafang-can-devices/BafangCanSensor';
import BafangCanBattery from '../device/high-level/bafang-can-devices/BafangCanBattery';

export class BafangCanBackup {
    public static saveBackup(
        controller: BafangCanController | null,
        display: BafangCanDisplay | null,
        sensor: BafangCanSensor | null,
        battery: BafangCanBattery | null,
    ): void {
        const fs = require('fs');
        let backup_obj: any = {};
        if (controller && controller.available) {
            backup_obj['controller'] = {
                available: controller.available,
                parameter1: controller.parameter1,
                parameter2: controller.parameter2,
                parameter3: controller.parameter3,
                parameter1_array: controller.parameter1Array,
                parameter2_array: controller.parameter2Array,
                serial_number: controller.serialNumber,
                hardware_version: controller.hardwareVersion,
                software_version: controller.softwareVersion,
                model_number: controller.modelNumber,
                manufacturer: controller.manufacturer,
            };
        } else backup_obj['controller'] = null;
        if (display && display.available) {
            backup_obj['display'] = {
                available: display.available,
                data1: display.data1,
                data2: display.data2,
                serial_number: display.serialNumber,
                hardware_version: display.hardwareVersion,
                software_version: display.softwareVersion,
                model_number: display.modelNumber,
                customer_number: display.customerNumber,
                manufacturer: display.manufacturer,
                bootloader_version: display.bootloaderVersion,
            };
        } else backup_obj['display'] = null;
        if (sensor && sensor.available) {
            backup_obj['sensor'] = {
                available: sensor.available,
                serial_number: sensor.serialNumber,
                hardware_version: sensor.hardwareVersion,
                software_version: sensor.softwareVersion,
                model_number: sensor.modelNumber,
            };
        } else backup_obj['sensor'] = null;
        if (battery && battery.available) {
            backup_obj['battery'] = {
                available: battery.available,
                serial_number: battery.serialNumber,
                hardware_version: battery.hardwareVersion,
                software_version: battery.softwareVersion,
                model_number: battery.modelNumber,
            };
        } else backup_obj['battery'] = null;
        let backup_text = JSON.stringify(backup_obj);
        let dir = path.join(getAppDataPath('open-bafang-tool'), `backups`);
        try {
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, true);
            }
            fs.writeFileSync(
                path.join(dir, `backup-${new Date().toISOString()}.json`),
                backup_text,
                'utf-8',
            );
        } catch (e) {
            log.error('Failed to save the backup file! Backuping to logs:');
            log.error(backup_text);
        }
    }
}
