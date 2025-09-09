import gc from "@sg/game-client-base";
import { _decorator, Label, Sprite, tween } from "cc";
import Observer from "observer";

import { ObserverComponent } from "db://shared-components/shared/common-components/observer-component/scripts/observer-component";


const { ccclass, property } = _decorator;
const { render, handle } = Observer;
const { GameCrash, Rounds } = gc;
const { RoundTimeStore } = Rounds;

@ccclass
export class CountDownTimer extends ObserverComponent {
    @property(Label)
    lblCountdown: Label = null;

    @property(Sprite)
    countdownBar: Sprite = null;

    private _totalTime = 0;
    private _barTween: any = null;

    @render(RoundTimeStore, (store) => store.isInRoundTime)
    setVisibility(isInRoundTime: boolean) {
        this.node.active = isInRoundTime;
    }

    resetBar(totalTime = 10) {
        this._totalTime = totalTime;
        this.countdownBar.fillRange = 1;
    }

    @render(gc.Rounds.RoundTimeStore, (store) => store.roundTime)
    renderRoundTime(roundTime: number) {
        const roundTimeStr = roundTime.toString();
        this.lblCountdown.string = `${roundTimeStr}s`;

        if (this._totalTime === 0) {
            this.resetBar(10);
        }

        const targetProgress  = roundTime / this._totalTime;
        if (this._barTween) {
            this._barTween.stop();
            this._barTween = null;
        }
        const holder = { value: this.countdownBar.fillRange };
        this._barTween = tween(holder)
            .to(1, { value: targetProgress }, {
                onUpdate: () => {
                    this.countdownBar.fillRange = holder.value;
                }
            })
            .start();
    }

    @render(GameCrash.CrashMultiplier.MultiplierStore, (store) => store.multiplier, { fireImmediately: false })
    hideTimer(multiplier: number) {
        multiplier && this.node.active && (this.node.active = false);
    }
}
