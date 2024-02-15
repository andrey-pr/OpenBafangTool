import NotFound from '../../docs/inner-pages/404.md';
import Test from '../../docs/inner-pages/Test page.md';
import BafangUartProtocol from '../../docs/Bafang UART protocol.md';
import BafangUartMotorAPI from '../../docs/Bafang UART motor API.md';
import BafangUartMotorParameters from '../../docs/Bafang UART motor parameters.md';
import GeneralManual from '../../docs/General manual.md';

export enum DocPages {
    BafangUartMotorGeneralManualDocument = 'bafang_uart_motor_general_manual',
    BafangUartMotorParamsDocument = 'bafang_uart_motor_parameters',
    BafangUartProtocolDocument = 'bafang_uart_protocol',
    BafangUartMotorAPIDocument = 'bafang_uart_motor_protocol',
    TestPage = 'test_page',
}

export function getDocumentById(id: string): string {
    switch (id) {
        case DocPages.BafangUartProtocolDocument:
            return BafangUartProtocol;
        case DocPages.BafangUartMotorAPIDocument:
            return BafangUartMotorAPI;
        case DocPages.BafangUartMotorParamsDocument:
            return BafangUartMotorParameters;
        case DocPages.BafangUartMotorGeneralManualDocument:
            return GeneralManual;
        case DocPages.TestPage:
            return Test;
        default:
            return NotFound;
    }
}
