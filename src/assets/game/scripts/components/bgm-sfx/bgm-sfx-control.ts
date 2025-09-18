import { Slider, _decorator } from "cc";
import Observer from "observer";

import { ObserverComponent } from "../../../../../extensions/shared-components/assets/shared/common-components/observer-component/scripts/observer-component";
import { BGMSFXHandlers } from "../../handlers/bgm-sfx/bgm-sfx-handlers";
import { BGMSFXStore, EventData, OPEN_BGMSFXCONTROL } from "../../handlers/bgm-sfx/bgm-sfx-store";

const { ccclass, property } = _decorator;
const { render, handle } = Observer;

@ccclass("BGMSFXControl")
export class BGMSFXControl extends ObserverComponent {
    @property(Slider)
    sliderBGM: Slider = null;

    @property(Slider)
    sliderSFX: Slider = null;

    onLoad() {
        this.sliderBGM.node.on("slide", this.handleSlideBGM, this);
        this.sliderSFX.node.on("slide", this.handleSlideSFX, this);
        
    }

    @render(BGMSFXStore, (store) => store.SFXValue)
    renderSFXValue(value: number) {
        this.sliderSFX.progress = value;
    }

    @render(BGMSFXStore, (store) => store.BGMValue)
    renderBGMValue(value: number) {
        this.sliderBGM.progress = value;
    }

    @render(BGMSFXStore, (store) => store.event)
    renderIsOpened(event: EventData) {
        this.node.active = event.event === OPEN_BGMSFXCONTROL;
    }

    @handle(BGMSFXHandlers, (handle, value: number) => handle.handleSFX(value))
    handleSFX(value: number) {
        return value;
    }

    @handle(BGMSFXHandlers, (handle, value: number) => handle.handleBGM(value))
    handleBGM(value: number) {
        return value;
    }

    handleSlideBGM(slider: Slider) {
        console.log("handleSlideBGM", slider.progress);
        // this.handleBGM(value);
    }

    handleSlideSFX(slider: Slider) {
        console.log("handleSlideSFX", slider.progress);
        // this.handleSFX(value);
    }
}
