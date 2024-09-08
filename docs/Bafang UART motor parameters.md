## Bafang UART motor parameters

### Electrical parameters

#### Low voltage battery protection

Setting to avoid battery voltage cutoff (your battery likely has a Battery Management System (BMS) that will disconnect power when the voltage drops too low). If your battery turns off before reaching this value, you should raise it. Too low value can reduce battery lifetime. Recommened value depends on system voltage and battery type. For example, range for 48V systems is `38-43V` and recommended value is `41V` for Li-ion battery.\
\
Unit: volts.

#### Current limit

> ⚠️ Warning: use this parameter carefully. It can damage hardware in case of wrong value.

Represents absolute max current that controller can take. Can not be bigger than `Max current` from Info page. Sometimes `Voltage * Current limit` can be much bigger than nominal power, because `Voltage * Current limit` is a peak power, that can legally be much bigger than nominal.\
\
Unit: amperes.

#### Pedal start current

> ⚠️ Warning: use this parameter carefully. It can damage hardware in case of wrong value.

Current, that controller set on start in Pedal Assist Mode. This parameter determines smoothness of start. Be careful. Too big value can damage controller. Usually used value from 10 to 50.\
\
Unit: % from main [`Current limit`](#current-limit).

#### Throttle start voltage

> ⚠️ Warning: use this parameter carefully. It can damage hardware in case of wrong value.

> ⚠️ Warning: it may be illegal to install throttle lever on e-bike in your country. You should check your local laws before installing it.

Voltage of analog throttle lever in lowest position. Usually its in range from `1V` to `1.5V`, but you have to check in for your throttle lever.\
\
Unit: In usual view: `V`. In old style view: `100mV`=`0.1V`.

#### Throttle end voltage

> ⚠️ Warning: use this parameter carefully. It can damage hardware in case of wrong value.

> ⚠️ Warning: it may be illegal to install throttle lever on e-bike in your country. You should check your local laws before installing it.

Voltage of analog throttle lever in highest position. You have to check this value on your throttle lever.\
\
Unit: In usual view: `V`. In old style view: `100mV`=`0.1V`.

#### Throttle start current

> ⚠️ Warning: use this parameter carefully. It can damage hardware in case of wrong value.

> ⚠️ Warning: it may be illegal to install throttle lever on e-bike in your country. You should check your local laws before installing it.

Current, that controller set on start in Throttle mode. This parameter determines smoothness of start. Be careful. Too big value can damage controller. Usually used value from 10 to 20.\
\
Unit: % from main [`Current limit`](#current-limit).

### Physical parameters

#### Wheel diameter

> ⚠️ Warning: if you want to use this parameter to hack speed limit: it may be illegal to increase speed limit in your country. Its illegal to set it more than 25km/h in most countries. You should check your local laws before setting too low value in this parameter.

Represents diameter of wheel that is equiped with speedmeter.\
\
Unit: inches.

#### Speedmeter type

> ⚠️ Warning: usually you do not need to change this value unless you physically modified device.

Type of speedmeter installed on bike. There are three kinds of speedmeter: `External`, `Internal` and `Motorphase`. Most of motors use `External` one. Speedmeter type can be changed only if you physically install motor controller on different kind of motor.

#### Pedal sensor type

> ⚠️ Warning: usually you do not need to change this value unless you physically modified device.

Type of pedal rotation sensor installed on bike. There are three kinds of pedal rotation sensor: `DH-Sensor-12`, `BB-Sensor-32` and `DoubleSignal-24`. Also, there is a choice `None`, that means that bike have no pedal sensor and can be turned off only by throttle lever. Different kinds of motor can be equipped with different sensor types. Pedal rotation sensor type can be changed only if you physically install different sensor (it possible not for any motor model).

### Assist levels

#### ⚠️ Zero assist level

Its recommended to set [`Current limit`](#current-limit-1) of zero assist level to 0%.

#### Current limit

This parameter limits current for N'th assist level.\
\
Unit: % from [`Keep current`](#keep-current).

#### Speed limit

This parameter limits speed for N'th assist level.\
\
Unit: % from main [`Speed limit`](#pedal-speed-limit).

### Drive parameters

#### Throttle mode

> ⚠️ Warning: it may be illegal to install throttle lever on e-bike in your country. You should check your local laws before installing it.

Determines parameter, that throttle lever controls - speed or current.

#### Pedal assist level (Designated Assist)

This parameter blocks motor on one designated pedal assist level. Value `By display` allows you to change pedal assist level from display. Its the most useful and most common choice.

#### Throttle assist level (Designated Assist)

> ⚠️ Warning: it may be illegal to install throttle lever on e-bike in your country. You should check your local laws before installing it.

Its like [`Pedal assist level`](#pedal-assist-level-designated-assist), but you can set this value separatelly for time when throttle is on. Value `By display` allows you to change pedal assist level from display. Its the most useful and most common choice.

#### Pedal speed limit

> ⚠️ Warning: it may be illegal to increase speed limit in your country. Its illegal to set it more than 25km/h in most countries. You should check your local laws before changing this parameter.

Represents speed limit in pedal assist mode. After reaching the limit, motor will turn off. Value `By display` allows you to change pedal assist level from display (if your display supports it - most displays have hardcoded 25 km/h limit).\
\
Unit: `km/h`.

#### Throttle speed limit

> ⚠️ Warning: it may be illegal to install throttle lever on e-bike in your country. You should check your local laws before installing it.

Represents speed limit in throttle assist mode. Value `By display` allows you to change pedal assist level from display (if your display supports it - most displays have hardcoded 25 km/h limit).\
\
Unit: `km/h`.

#### Slow start mode

> ⚠️ Warning: use this parameter carefully. It can damage hardware in case of wrong value.

Adjusts the rate at which the power output increases. Too low or too big value can damage controller. Usually used value from 3 to 5.\
\
Range: from 1 to 8.\
No unit.

#### Signals before assist (Start Degree, Signal No.)

Means number of signals from pedal rotation sensor between start of pedalling and start of assist. Number of signals per rotation depends of sensor model. Default value is 4.\
\
Range: from 2 to value nearly signal number per one rotation (depends of sensor type).\
No unit.

#### Time before end of assist (Time Of Stop, Stop Delay)

> ⚠️ Warning: use this parameter carefully. Too big value can inccrease braking distance.

Time from end of pedalling to stop. Usual value from factory is `250ms`. Recommended value is `50ms`. Setting too big value can increase braking distance. Value can not be lower that `50ms` (PAS will not work with smaller value).\
\
Unit: In usual view: `ms`. In old style view: `10ms`=`0.01s`.

#### Current fading ("Current decay")

The Current Fading setting determines the point at which the drive unit starts to reduce power as the pedal cadence rpm increases, with a higher value indicating a later onset of power reduction. This setting is not tied to specific rpm speeds, and a lower value will result in the drive unit cutting back on power at a lower pedal cadence rpm. Recomended value: `4`-`8`.\
\
Range: from 1 to 8.\
No unit.

#### Pedalling Stop Timeout ("Stop decay")

> ⚠️ Warning: use this parameter carefully. Too big value can be dangerous.

Pedalling stop timeout setting determines how long the it takes to stop motor after pedaling stops. A higher value will result in a slower power fade, while a lower value will result in a faster fade. Recommmended value is `0` (200ms still seems to be safe, higher unknown).\
\
Unit: In usual view: `ms`. In old style view: `10ms`=`0.01s`.

#### Keep current

The Keep Current setting determines the percentage of current that is maintained at a certain rate of pedaling (cadence). It sets the percentage of the current limit for each level of PAS, allowing the user to control the maximum amount of power delivered to the motor. Recommended value: from `30` to `80`.\
\
Unit: % from main [`Current Limit`](#current-limit).

### Other

#### Serial number

> ⚠️ Warning: it may be illegal to change serial number in your country. You should check your local laws before installing it.

Serial number of motor unit. Can be easilly changed, so serial number can not be used as a anti-theft measure. It possible to set any string value (with ASCII symbols).

### Info: Codes

#### Serial number

Serial number of motor unit. Can be easilly changed, so serial number can not be used as a anti-theft measure.

#### Model

Model code. Currently, there is no table of code meanings.

#### Manufacturer

Manufacturer code. Currently, there is no table of code meanings.

#### Power specification code

> ⚠️ Warning: it may be illegal to install motor more powerful than 250W on e-bike in your country. You should check your local laws before installing it.

Code, that contains info about nominal voltage and power. For example, `MAX_DS48V250W`.

#### System code

Code, that contains info about system version. For example, `MAX01_V2.2_DS`.

### Info: Versions

#### Firmware version

Number of firmware version.

#### Hardware version

Number of hardware version.

### Info: Electric parameters

#### Voltage

Nominal voltage of system. Can be `24V`, `36V`, `48V`, `43V`.\
\
Unit: volts.

#### Max current

Maximal current, that controller physically can operate. Sometimes `Voltage * Max current` can be much bigger than nominal power, because `Voltage * Max current` is a peak power, that can legally be much bigger than nominal.