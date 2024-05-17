## General manual

#### Device selection view

![Device selection view screenshot](assets/general_manual/device_selection_view.png)

This is the first view of program, that appears aften launch. Here you can choose what device do you want to interact and interface type (simplified or full).

![Device protocol selector](assets/general_manual/device_protocol.png)

At first, select type of your electric system. Old bafangs such as BBS01/02/HD have UART protocol (you can also recognize them by round green connector), new have CAN protocol (you can recognize then by "house-shaped" green connnector).

![Interface type selector](assets/general_manual/interface_type_selector.png)

For systems with UART available two kinds of UI - full and simplified. If you are newbie, better to select simplified mode.

![Serial port selector](assets/general_manual/port_selector.png)

If you have motor with UART, select port where you device connected to. Check usual name of USB-Serial ports for you operational system in internet. Also, there is a item `Simulator` that connects program to virtual device for test purposes and virtual `/dev/tnt` ports if you have them in your system (available only for Linux). Non-USB serial ports usually removed from list on Linux due to high ammount of "dead" ports in standard list.

![HID device selector](assets/general_manual/besst_selector.png)

If you have motor with CAN, select your BESST Tool USB device. Also, there is a item `Simulator` that connects program to virtual device for test purposes.

![Disclaimers](assets/general_manual/disclaimers.png)

There are disclaimer checkbox, you should select them.

![Buttons](assets/general_manual/connection_buttons.png)

Then press button "Check Connection". If connection is successful, press "Select". In not, check device type, port, cable and device.

#### Main view (CAN)

TODO

#### Main view (UART, UI Simplified mode)

![Main view](assets/general_manual/simplified_parameters.png)

This is a main view of program. Here you can configurate device and see docs for it.

![Menu](assets/general_manual/simplified_menu.png)

This is a side menu. Button "Back" closes connection and opens device selection view. Button "Parameters" opens page with parameters that you can change (check out docs for parameters of your device). Button "Manual" opens list of docs, available for your device except complicated technical data, that you need only in full mode. 

![Warning](assets/general_manual/simplified_warning.png)

When you enter unusual value to parameter field, you will get warning about it. Note, that this function is not absolutely reliable and you may not get warning even for wrong value or get wrong warning for correct value.

![Control buttons](assets/general_manual/control_buttons.png)

Button with two spinning arrows means "read all data from device again". Button with floppy disk and arrow means "write all data to device".

![Write success](assets/general_manual/write_success.png)

After reading or writing you will get notifications with result (success or error).\
⚠️ If you got a write error of some parameter, it means that its too low or too big even if you got no warning from field. Also its possibble that you will get a new error after fixing previous - motor returns error answer only for first error value in package.

#### Main view (UART, UI Full mode)

![Main view](assets/general_manual/main_view.png)

This is a main view of program. Here you can configurate device and see docs for it.

![Menu](assets/general_manual/menu.png)

This is a side menu. Button "Back" closes connection and opens device selection view. Button "Info" opens page with reand-only data from device. Button "Settings" opens page with parameters that you can change (check out docs for parameters of your device). Button "Manual" opens list of docs, available for your device.

![Warning](assets/general_manual/warning.png)

When you entered unusual value to field on "Settings" page, you will get warning about it. Note, that this function is not absolutely reliable and you may not get warning even for wrong value or get wrong warning for correct value.

![Control buttons](assets/general_manual/control_buttons.png)

Button with two spinning arrows means "read all data from device again". Button with floppy disk and arrow means "write all data to device".

![Write success](assets/general_manual/write_success.png)

After reading or writing you will get notifications with result (success or error).\
⚠️ If you got a write error of some parameter, it means that its too low or too big even if you got no warning from field. Also its possibble that you will get a new error after fixing previous - motor returns error answer only for first error value in package.

![Old style](assets/general_manual/old_style_parameter_page.png)

If you prefer old parameter classification and names, like in original Stefan Penoff's program, turn on switch "Old style layout".