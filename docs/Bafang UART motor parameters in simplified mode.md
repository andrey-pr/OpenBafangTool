## Bafang UART motor parameters

### Info

#### Serial number

Serial number of motor unit. Can be easilly changed, so serial number can not be used as a anti-theft measure.

#### Voltage

Nominal voltage of system. Can be `24V`, `36V`, `48V`, `43V`.\
\
Unit: volts.

#### Max current

Maximal current, that controller physically can operate. Sometimes `Voltage * Max current` can be much bigger than nominal power, because `Voltage * Max current` is a peak power, that can legally be much bigger than nominal, for example some Shimano STEPS motors have more than 600W of max power.

### Electrical parameters

#### Battery cutoff voltage

Setting to avoid battery voltage cutoff (your battery likely has a Battery Management System (BMS) that will disconnect power when the voltage drops too low). If your battery turns off before reaching this value, you should raise it. Too low value can reduce battery lifetime. Recommened value depends on system voltage and battery type. For example, range for 48V systems is `38-43V` and recommended value is `41V` for Li-ion battery.\
\
Unit: volts.

### Physical parameters

#### Wheel diameter

> ⚠️ Warning: if you want to use this parameter to hack speed limit: it may be illegal to increase speed limit in your country. Its illegal to set it more than 25km/h in most countries. You should check your local laws before setting too low value in this parameter.

Represents diameter of wheel that is equiped with speedmeter. Usually you need to change it once after mounting motor on new bike.\
\
Unit: inches.

### Assist levels

#### Zero assist level

Its strongly recommended to set [`Current limit`](#current-limit) of zero assist level to 0%, so this parameter is blocked in simplified mode.

#### Current limit

This parameter limits current for N'th assist level.\
\
Unit: % from main Keep Current parameter (not available in simplified mode - usually you don't need to change it).

#### Speed limit

This parameter limits speed for N'th assist level.\
\
Unit: % from main [`Speed limit`](#pedal-speed-limit).

### Drive parameters

#### Pedal speed limit

> ⚠️ Warning: it may be illegal to increase speed limit in your country. Its illegal to set it more than 25km/h in most countries. You should check your local laws before changing this parameter.

Represents speed limit in pedal assist mode. After reaching the limit, motor will turn off. Value `By display` allows you to change pedal assist level from display (if your display supports it - most displays have hardcoded 25 km/h limit).\
\
Unit: `km/h`.

#### Start Degree

With this parameter you can set angle on what you have to turn pedals to switch on motor. On some models this parameter is nearly 360° from factory, so you can set lower value.

#### Stop Delay

With this parameter toy can set time time between last signal from pedal sensor and motor stop. If parameter is too low, motor may work unstable on low cadence. If parameter is too big, braking distance will increase (so too big value is not available in Simplified mode).\
\
Unit: `ms`

### Throttle

> ⚠️ Warning: it may be illegal to install throttle lever on e-bike in your country. You should check your local laws before installing it.

#### Throttle start voltage

Voltage of analog throttle lever in position that starts motor on lowest power.\
\
Unit: `V`

#### Throttle end voltage

Voltage of analog throttle lever in highest position. Normally its `4.2V`\
\
Unit: `V`

#### Throttle mode

Determines parameter, that throttle lever controls - speed or current.

#### Throttle speed limit

Represents speed limit in throttle assist mode. Value `By display` allows you to change pedal assist level from display (if your display supports it - most displays have hardcoded 25 km/h limit).\
\
Unit: `km/h`.