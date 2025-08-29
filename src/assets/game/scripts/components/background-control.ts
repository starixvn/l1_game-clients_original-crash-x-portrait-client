import gc from "@sg/game-client-base";
import { Node, Tween, _decorator, tween, v3 } from "cc";
import Observer from "observer";
const { Settlements, GameCrash } = gc;

import { ObserverComponent } from "../../../../extensions/shared-components/assets/shared/common-components/observer-component/scripts/observer-component";

const { ccclass, property } = _decorator;
const { render } = Observer;

export const BG_CLOSING_TRANSITION_DURATION = 2;

@ccclass("background_control")
export class BackgroundControl extends ObserverComponent {
    @property(Node)
    nodeBackground: Node = null;

    private isBgMoving = false;
    private readonly backgroundMoveY = -500;
    private readonly movingBackgroundDuration = 40;

    @render(GameCrash.CrashMultiplier.MultiplierStore, (store) => store.time, { fireImmediately: false })
    renderRocketTime(time: number) {
        if (!this.isBgMoving) {
            this.initNodeBackgroundWithTime(time);
            this.startMovingBackground();
        }
    }

    @render(gc.Rounds.RoundTimeStore, (store) => store.isStartRound, { fireImmediately: false })
    changeIdleAnim(isStartRound: boolean) {
        if (isStartRound) {
            this.resetBackground();
        }
    }

    @render(Settlements.SettlementStore, (store) => store.result)
    renderSettle(result) {
        if (!result) {
            return;
        }
        Tween.stopAllByTarget(this.nodeBackground);
    }

    initNodeBackgroundWithTime(time: number) {
        const rate = time / (this.movingBackgroundDuration * 1000);
        this.nodeBackground.scale = v3(1, 1).multiplyScalar(1 - rate);
        this.nodeBackground.position = v3(0, this.backgroundMoveY * rate);
    }

    startMovingBackground() {
        this.isBgMoving = true;
        tween(this.nodeBackground)
            .to(this.movingBackgroundDuration, {
                scale: v3(0),
                position: v3(0, this.backgroundMoveY),
            })
            .start();
    }

    resetBackground() {
        this.isBgMoving = false;
        Tween.stopAllByTarget(this.nodeBackground);
        tween(this.nodeBackground)
            .to(1, { scale: v3(1, 1, 1), position: v3(0, 0, 0) }, { easing: "sineIn" })
            .start();
    }
}
