## General manual

#### Device selection view

![Device selection view screenshot](assets/general_manual/device_selection_view.png)

This is the first view of program, that appears aften launch. Here you can choose what device do you want to interact and interface type (simplified or full).

![Device type selector](assets/general_manual/interface_type_selector.png)

At first, select simplified or full interface. If you are newbie, better to select simplified mode. Then select type of your device. Currently, the only supported type is Bafang motor with UART interface. Bafang systems with CAN will be available soon. Later I'll add more device types and manufacturers.

![Serial port selector](assets/general_manual/port_selector.png)

Select port where you device connected to. Check usual name of USB-Serial ports for you operational system in internet. Also, there is a item `Simulator` that connects program to virtual device for test purposes and virtual `/dev/tnt` ports if you have them in your system (available only for Linux). Non-USB serial ports usually removed from list on Linux due to high ammount of "dead" ports in standard list.

![Disclaimers](assets/general_manual/disclaimers.png)

There are disclaimer checkbox, you should select them.

![Buttons](assets/general_manual/connection_buttons.png)

Then press button "Check Connection". If connection is successful, press "Select". In not, check device type, port, cable and device.

#### Main view (Simplified mode)

![Main view](assets/general_manual/simplified_parameters.png)

This is a main view of program. Here you can configurate device and see docs for it.

![Menu](assets/general_manual/simplified_menu.png)

This is a side menu. Button "Back" closes connection and opens device selection view. Button "Parameters" opens page with parameters that you can change (check out docs for parameters of your device). Button "Manual" opens list of docs, available for your device except complicated technical data, that you need only in full mode. 

![Warning](assets/general_manual/simplified_warning.png)

When you enter unusual value to parameter field, you will get warning about it. Note, that this function is not absolutely reliable and you may not get warning even for wrong value or get wrong warning for correct value.

![Control buttons](assets/general_manual/control_buttons.png)

Button with arrows means "read all data from device again". Button with rocket means "write all data to device".

![Write success](assets/general_manual/write_success.png)

After reading or writing you will get notifications with result (success or error).\
⚠️ If you got a write error of some parameter, it means that its too low or too big even if you got no warning from field. Also its possibble that you will get a new error after fixing previous - motor returns error answer only for first error value in package.

#### Main view (Full mode)

![Main view](assets/general_manual/main_view.png)

This is a main view of program. Here you can configurate device and see docs for it.

![Menu](assets/general_manual/menu.png)

This is a side menu. Button "Back" closes connection and opens device selection view. Button "Info" opens page with reand-only data from device. Button "Settings" opens page with parameters that you can change (check out docs for parameters of your device). Button "Manual" opens list of docs, available for your device.

![Warning](assets/general_manual/warning.png)

When you entered unusual value to field on "Settings" page, you will get warning about it. Note, that this function is not absolutely reliable and you may not get warning even for wrong value or get wrong warning for correct value.

![Control buttons](assets/general_manual/control_buttons.png)

Button with arrows means "read all data from device again". Button with rocket means "write all data to device".

![Write success](assets/general_manual/write_success.png)

After reading or writing you will get notifications with result (success or error).\
⚠️ If you got a write error of some parameter, it means that its too low or too big even if you got no warning from field. Also its possibble that you will get a new error after fixing previous - motor returns error answer only for first error value in package.

![Old style](assets/general_manual/old_style_parameter_page.png)

If you prefer old parameter classification and names, like in original Stefan Penoff's program, turn on switch "Old style layout".