## Bafang UART motor API

> ⚠️ Warning: you do not need to read this document to use this program. You need it only if you are developer.

> ⚠️ Warning: there is no description of Bafang UART protocol in this document. You need to read document `Bafang UART protocol` to understand this document.

#### Introduction

There are two kinds of API request: Read Request and Write Request.\
In `Response` sections in this document written only `Data` part of frame. Read more in `Bafang UART protocol` how to make frame from codes, described in this document.

#### Read codes
- `0x14 0x12` - data, known as "Power Specification Code", for example `MAX_DS48V250W`. Response contains only Power Specification Code, coded in ASCII. Example: `0x4d 0x41 0x58 0x5f 0x44 0x53 0x34 0x38 0x56 0x32 0x35 0x30 0x57` = `MAX_DS48V250W`
- `0x14 0x13` - data, known as "System Code", for example `MAX01_V2.2_DS`. Response contains only System code, coded in ASCII. Example: `0x4D 0x41 0x4D 0x41 0x58 0x30 0x31 0x5F 0x56 0x32 0x2E 0x32 0x5F 0x44 0x53 0x57` = `MAX01_V2.2_DS`
- `0x14 0x14` - serial number. Response contains serial number, coded in ASCII. Example: `0x32 0x30 0x31 0x36 0x30 0x38 0x30 0x38 0x30 0x30 0x30 0x31` = `201608080001`
- `0x14 0x15` - error codes. Response contains bytes with current error codes (if there are no error codes, response data is empty)
- `0x14 0x16` - data, known as "Model" (but actually its not a model), for example `20160808`. Response contains only "Model", coded in ASCII. Example: `0x32 0x30 0x31 0x36 0x30 0x38 0x30 0x38` = `20160808`
- `0x11 0x50` - firmware version. Response contains only firmware version name, coded in ASCII. Example: `0x43 0x52 0x58 0x31 0x30 0x42 0x34 0x38 0x31 0x32 0x45 0x30 0x31 0x30 0x30 0x32 0x36 0x2E 0x33` = `CRX10B4812E010026.3`
- `0x11 0x51 0x04 0xB0 0x05` - response contains load of different information: manufacturer, model, hardware version, firmware version (in different from `0x11 0x50` format), voltage, max current. Detailed description:

| Manufacturer        | Model               | Hardware version | Firmware version    | Voltage | Max current |
| ------------------- | ------------------- | ---------------- | ------------------- | ------- | ----------- |
| 0xXX 0xXX 0xXX 0xXX | 0xXX 0xXX 0xXX 0xXX | 0xXX 0xXX        | 0xXX 0xXX 0xXX 0xXX | 0xXX    | 0xXX        |

1. Manufacturer - factory code of 4 characters, coded in ASCII
2. Model - model code of 4 characters, coded in ASCII
3. Hardware version - two numbers of hardware version. To decode them, write this two numbers in decimal separated by a dot
4. Firmware version - four numbers of firmware version. To decode them, write this four numbers in decimal separated by a dot. Be careful: its a different format from `0x11 0x50` response, and usually firmware hamed in `0x11 0x50` format
5. Voltage - can be decoded by following table:

| Code  | Value  |
| ----- | ------ |
| 0x00  | 24V    |
| 0x01  | 36V    |
| 0x02  | 48V    |
| 0x03  | 60V    |
| 0x04  | 24-48V |
| >0x04 | 24-60V |

6. Max current - one byte of max current value in ampers. Doesn't need decoding.

Example: `0x53 0x5A 0x42 0x46 0x53 0x57 0x30 0x36 0x32 0x32 0x35 0x30 0x32 0x31 0x02 0x0C`
1. `0x53 0x5A 0x42 0x46` - `SZBF`
2. `0x53 0x57 0x30 0x36` - `SW06`
3. `0x32 0x32` - `2.2`
4. `0x35 0x30 0x32 0x31` - `5.0.2.1`
5. `0x02` - `48V`
6. `0x0C` - `12A`

- `0x11 0x52` - package of basic parameters: low voltage limit, max current limit, assist level profiles, wheel diameter, speedmeter type and number of speedmeter signals per rotation. Detailed description:

| Low voltage limit | Max current limit | Assist profile 0 | ... | Assist profile 9 | Wheel diameter | Speedmeter |
| ----------------- | ----------------- | ---------------- | --- | ---------------- | -------------- | ---------- |
| 0xXX              | 0xXX              | 0xXX 0xXX        | ... | 0xXX 0xXX        | 0xXX           | 0xXX       |

1. Low voltage limit - limit of minimal voltage into protect battery from overdischarging. One byte, doesn't need decoding. Unit: volts.
2. Max current limit - limit of maximal current to protect motor from overload. One byte, doesn't need decoding. Unit: amperes.
3. Assist profiles - ten assist level profiles, each consists of two bytes: current limit (doesn't need decoding, unit: percents from main limit) and speed limit (doesn't need decoding, unit: percents from main limit). Most of displays show not all ten levels.
4. Wheel diameter - diameter of wheel in inches. To decode, divide byte value by 2.
5. Speedmeter type - one byte, that store information about speedmeter type and number of signals per wheel rotation (for usual Hall speedmeters its a number of magnets on wheel).\
Byte structure:

| 7-6 bits        | 5-0 bits                       |
| --------------- | ------------------------------ |
| Speedmeter type | Number of signals per rotation |

Speedmeter type can be determined by following table:

| Value | Type       |
| ----- | ---------- |
| 0b00  | External   |
| 0b01  | Internal   |
| 0b10  | Motorphase |

Example: `0x29 0x0C 0x00 0x17 0x0F 0x27 0x1E 0x33 0x2D 0x40 0x42 0x64 0x00 0x64 0x64 0x64 0x64 0x64 0x64 0x64 0x64 0x64 0x38 0x01`

1. `0x29` - `41V`
2. `0x0C` - `12A`
3. `0x00 0x17 0x0F 0x27 0x1E 0x33 0x2D 0x40 0x42 0x64  0x00 0x64 0x64 0x64 0x64 0x64 0x64 0x64 0x64 0x64`

| Level | Current limit | Speed limit |
| ----- | ------------- | ----------- |
| 0     | 0%            | 100%        |
| 1     | 23%           | 100%        |
| 2     | 15%           | 100%        |
| 3     | 39%           | 100%        |
| 4     | 30%           | 100%        |
| 5     | 51%           | 100%        |
| 6     | 45%           | 100%        |
| 7     | 64%           | 100%        |
| 8     | 66%           | 100%        |
| 9     | 100%          | 100%        |

4. `0x38` - `28 Inch`
5. `0x01` - by first way: `External` speedmeter, zero signals (maybe default value, that means 1). By second way: `External` speedmeter, one signal
- `0x11 0x53` - package of pedal parameters: pedal sensor type, designated pedal assist level, speed limit, start current, slow start mode, number of sensor signals to start, time to stop, current decay, stop decay, keep current

| Value Name           | Byte Pattern |
| -------------------- | ------------ |
| Sensor type          | 0xXX         |
| Assist level         | 0xXX         |
| Speed limit          | 0xXX         |
| Start current        | 0xXX         |
| Slow start mode      | 0xXX         |
| Signals before start | 0xXX         |
| Work mode            | 0x00         |
| Time to stop         | 0xXX         |
| Current decay        | 0xXX         |
| Stop decay           | 0xXX         |
| Keep current         | 0xXX         |

1. Sensor type - determines kind of sensor of pedal rotating. Decoding table:

| Value | Sensor type     |
| ----- | --------------- |
| 0x00  | None            |
| 0x01  | DH-Sensor-12    |
| 0x02  | BB-Sensor-32    |
| 0x03  | DoubleSignal-24 |

2. Designated assist level - value from `0` to `9` fixes motor on corresponding assist level, value `255` allows to set assist level from display.
3. Speed limit - after reaching this limit, motor switches off. In most countries max legal limit is 25 km/h. This parameter sets limit only for assist mode, there is other limit parameter for throttle. Value `255` allows to set speed limit by display.
4. Start current - current level on start of for pedal assist in percents of maximal current limit.
5. Slow start mode - determines how fast pedal assist starts. Can be in range from 1 to 8.
6. Startup signal - pedal assist starts after getting this number of signals from pedal sensor. Pedal sensor can make from 12 to 32 signals per rotation depends on it's model.
7. Work mode - purpose unknown. Just do not change it.
8. Time to stop - time from pedalling end to motor stop. Unit: 10ms.
9. Current decay - determines on which pedalling speed motor starts to decrease its power. Can be in range from 1 to 8.
10. Stop decay - time from pedalling end to motor stop. Unit: 10ms. Difference from `Time to stop` is unknown.
11. Keep current - default current for pedal assist in percents of maximal current limit.

Example: `0x02 0xFF 0xFF 0x1E 0x05 0x04 0x0A 0x19 0x04 0x00 0x1E`

1. `0x02` - `BB-Sensor-32`
2. `0xFF` - assist level set by display
3. `0xFF` - speed limit set by display
4. `0x1E` - `30%`
5. `0x05` - `5`
6. `0x04` - `4` = 45 degrees (for this sensor type)
7. `0x0A` - `10`
8. `0x19` - `25` = `250ms`
9. `0x04` - `4`
10. `0x00` - `0` = `0ms`
11. `0x1E` - `30%`

- `0x11 0x54` - package of throttle parameters: start voltage, end voltage, mode, dessignated assist level, speed limit, start current

> ⚠️ Warning: in most countries installation of throttle lever is absolutely illegal

| Start voltage | End voltage | Mode | Designated assist level | Speed limit | Start current |
| ------------- | ----------- | ---- | ----------------------- | ----------- | ------------- |
| 0xXX          | 0xXX        | 0xXX | 0xXX                    | 0xXX        | 0xXX          |

1. Start voltage - voltage from throttle lever in position of minimal throttle (but not in zero). Unit: 100mV
2. End voltage - voltage from throttle lever in position of maximal throttle. Unit: 100mV
3. Mode - determines, if throttle lever controls speed or current. Decoding table:

| Value | Mode    |
| ----- | ------- |
| 0x00  | Speed   |
| 0x01  | Current |

4. Designated assist level - determines, how pedal assist works during throttle. Value from `0` to `9` fixes motor on corresponding assist level, value `255` allows to set assist level from display.
5. Speed limit - after reaching this limit, motor switches off. This parameter sets limit only for throttle, there is other limit parameter for assist mode. Value `255` allows to set speed limit by display.
6. Start current - current level on start of for throttle in percents of maximal current limit.

Example: `0x23 0x23 0x01 0xFF 0x20 0x0A`

1. `0x23` - `35` = `3.5V`
2. `0x23` - `35` = `3.5V`
3. `0x01` - Current
4. `0xFF` - set by display
5. `0x20` - `32 km/h`
6. `0x0A` - `10`

#### Write codes
- `0x16 0x52` - has same data structure as response from `0x11 0x52`
- `0x16 0x53` - has same data structure as response from `0x11 0x53`
- `0x16 0x54` - has same data structure as response from `0x11 0x54`
- `0x17 0x01` - has same data structure as response from `0x14 0x14`