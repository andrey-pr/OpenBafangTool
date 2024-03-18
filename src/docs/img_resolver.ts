import ConnectionButtons from '../../docs/assets/general_manual/connection_buttons.png';
import ControlButtons from '../../docs/assets/general_manual/control_buttons.png';
import DeviceSelectionView from '../../docs/assets/general_manual/device_selection_view.png';
import DeviceTypeSelector from '../../docs/assets/general_manual/device_type_selector.png';
import Disclaimers from '../../docs/assets/general_manual/disclaimers.png';
import MainView from '../../docs/assets/general_manual/main_view.png';
import Menu from '../../docs/assets/general_manual/menu.png';
import OldStyleParameterPage from '../../docs/assets/general_manual/old_style_parameter_page.png';
import ParametersPage from '../../docs/assets/general_manual/parameters_page.png';
import PortSelector from '../../docs/assets/general_manual/port_selector.png';
import Warning from '../../docs/assets/general_manual/warning.png';
import WriteSuccess from '../../docs/assets/general_manual/write_success.png';
import InterfaceTypeSelector from '../../docs/assets/general_manual/interface_type_selector.png';
import SimplifiedMenu from '../../docs/assets/general_manual/simplified_menu.png';
import SimplifiedParameters from '../../docs/assets/general_manual/simplified_parameters.png';
import SimplifiedWarning from '../../docs/assets/general_manual/simplified_warning.png';


// TODO this file is a very big kludge, made as temporal solution for assets import problem

interface Image {
    [key: string]: string;
}

const images: Image = {
    'assets/general_manual/connection_buttons.png': ConnectionButtons,
    'assets/general_manual/control_buttons.png': ControlButtons,
    'assets/general_manual/device_selection_view.png': DeviceSelectionView,
    'assets/general_manual/device_type_selector.png': DeviceTypeSelector,
    'assets/general_manual/disclaimers.png': Disclaimers,
    'assets/general_manual/main_view.png': MainView,
    'assets/general_manual/menu.png': Menu,
    'assets/general_manual/old_style_parameter_page.png': OldStyleParameterPage,
    'assets/general_manual/parameters_page.png': ParametersPage,
    'assets/general_manual/port_selector.png': PortSelector,
    'assets/general_manual/warning.png': Warning,
    'assets/general_manual/write_success.png': WriteSuccess,
    'assets/general_manual/interface_type_selector.png': InterfaceTypeSelector,
    'assets/general_manual/simplified_menu.png': SimplifiedMenu,
    'assets/general_manual/simplified_parameters.png': SimplifiedParameters,
    'assets/general_manual/simplified_warning.png': SimplifiedWarning,
};

export function getImage(name: string) {
    return images[name];
}
