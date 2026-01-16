import { EventEmitter } from "events";
import { ISnapshotDto } from "../../types/dto.type";
type Events = {
  "dto:fetched": ISnapshotDto;
  "dto:updated": boolean;
  "playlist:generated": boolean;
  heartbeat: boolean;
};
class syncEvent extends EventEmitter {
  emit<E extends keyof Events>(event: E, payload: Events[E]): boolean {
    return super.emit(event as string | symbol, payload);
  }
  on<E extends keyof Events>(event: E, listener: (payload: Events[E]) => void) {
    return super.on(event as string | symbol, listener);
  }
}

export const syncEventInstance = new syncEvent();
