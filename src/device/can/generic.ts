import EventEmitter from 'events';
import { CanFrame } from './can-types';

export default interface IGenericCanAdapter {
    emitter: EventEmitter; // TODO
    sendCanFrame(frame: CanFrame): Promise<void>;
    sendCanFrameImmediately(frame: CanFrame): Promise<void>;
    disconnect(): void;
}
