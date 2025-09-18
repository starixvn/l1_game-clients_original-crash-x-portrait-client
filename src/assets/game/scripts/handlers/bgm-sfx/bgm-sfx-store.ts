import gc from "@sg/game-client-base";
import inversify from "inversify";
import mobx from "mobx";
const { Shared } = gc;
const { injectable, inject } = inversify;

export interface EventData {
    event: string;
}

export const OPEN_BGMSFXCONTROL = "OPEN_BGMSFXCONTROL";
@injectable()
export class BGMSFXStore {
    constructor() {
        mobx.makeAutoObservable(this);
    }


    private _event: EventData = null;
    public get event(): EventData {
        return this._event;
    }
    public set event(value: EventData) {
        this._event = value;
    }

    private _SFXValue: number = +Shared.utils.StorageManager.get("SFXValue") || 0.5;
    public get SFXValue(): number {
        return this._SFXValue;
    }

    public set SFXValue(value: number) {
        Shared.utils.StorageManager.set("SFXValue", value.toString());
        this._SFXValue = value;
    }

    private _BGMValue: number = +Shared.utils.StorageManager.get("BGMValue") || 0.5;
    public get BGMValue(): number {
        return this._BGMValue;
    }

    public set BGMValue(value: number) {
        Shared.utils.StorageManager.set("BGMValue", value.toString());
        this._BGMValue = value;
    }
}
