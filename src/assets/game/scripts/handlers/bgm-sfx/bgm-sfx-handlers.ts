import inversify from "inversify";
import { BGMSFXStore, EventData } from "./bgm-sfx-store";
const { inject, injectable } = inversify;

@injectable()
export class BGMSFXHandlers {
    @inject(BGMSFXStore) private readonly bgmSFXStore: BGMSFXStore;
    
    handle(event: EventData) {
        this.bgmSFXStore.event = event;
    }

    handleSFX(value: number) {
        this.bgmSFXStore.SFXValue = value;
    }

    handleBGM(value: number) {
        this.bgmSFXStore.BGMValue = value;
    }
}
