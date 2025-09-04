import gc from "@sg/game-client-base";
import { _decorator, Node, sp, Tween, tween, v3 } from "cc";
import { AnimationUtils } from "db://shared-components/shared/utils";
import Observer from "observer";

import { ObserverComponent } from "../../../../../extensions/shared-components/assets/shared/common-components/observer-component/scripts/observer-component";
import { AudioIds } from "../../../audios/AudioIds";
import { CrashUtils } from "../../crash-utils";

const { ccclass, property } = _decorator;

const { handle, render } = Observer;
const { GameCrash } = gc;

@ccclass
export class RocketFly extends ObserverComponent {
    @property(sp.Skeleton)
    spinePlanet: sp.Skeleton = null;

    @property(sp.Skeleton)
    spineRocket: sp.Skeleton = null;

    @property(Node)
    landingNode: Node = null;

    private readonly smallExplosionMultiplier = 1.02;
    private multiplierIndex = 0;
    private time = 0;
    private flying = false;
    private flyingTween: Tween<Node> = null;
    private crashed = false;

    onLoad() {
        this.spineRocket.node.active = false;
        super.onLoad();
    }

    @render(GameCrash.CrashMultiplier.MultiplierStore, (store) => store.multiplier)
    private renderCurrentMultiplier(multiplier: number) {
        if (this.crashed) {
            return;
        }

        this.spineRocket.node.active = true;

        const index = CrashUtils.getMultiplierIndex(multiplier);
        this.multiplierIndex = index;

        const current = this.spineRocket.getCurrent(0).animation.name;
        const animName = `lv${this.multiplierIndex + 1}`;
        if (current !== animName) {
            AnimationUtils.playSpine(this.spineRocket, animName, true);
        }
    }

    @render(gc.Settlements.SettlementStore, (store) => store.result, {
        fireImmediately: false,
    })
    async renderRocketExplosion(result: gc.GameServiceMessage.TResult) {
        if (result) {
            +result < this.smallExplosionMultiplier && (await AnimationUtils.delayTime(0.5));
            this.explodeRocket();
        }
    }

    private resetIdleMode() {
        this.spineRocket.node.active = true;

        this.spineRocket.timeScale = 1;
        this.spineRocket.setAnimation(0, "idle", true);
        this.spineRocket.node.position = v3(this.landingNode.position);

        this.spinePlanet.timeScale = 0;
        this.spinePlanet.setAnimation(0, "hanhtinh", true);

        this.crashed = false;
    }

    @render(GameCrash.CrashMultiplier.MultiplierStore, (store) => store.time, { fireImmediately: false })
    private renderCurrentTime(time: number) {
        this.time = time;
    }

    handleRocketFlying() {
        if (this.flying) {
            return;
        }
        if (this.time > 0 && this.time > 200) {
            this.startedFly();
        } else {
            this.startFly();
        }
    }

    @render(GameCrash.CrashMultiplier.MultiplierStore, (store) => store.rocketState)
    renderRocketState(rocketState: string) {
        switch (rocketState) {
            case GameCrash.RocketState.CRASHED:
                this.flewAway();
                break;
            case GameCrash.RocketState.FLYING:
                this.handleRocketFlying();
                break;
            case GameCrash.RocketState.ONLAND:
                this.resetIdleMode();
                break;
        }
    }

    @handle(gc.Audios.AudioHandler, (handler, id: string) => handler.playSFX(id))
    playSFX(audioId: string) {
        return audioId;
    }

    private flewAway() {
        AnimationUtils.pauseSpineAnimation(this.spineRocket, 0.99, "crash1");

        this.spinePlanet.timeScale = 0;
        this.spinePlanet.setAnimation(0, "hanhtinh", true);
    }

    private startFly() {
        this.flying = true;
        this.flyingTween = tween(this.spineRocket.node)
            .to(0.7, { position: v3(0, 0, 0) }, { easing: "sineInOut" })
            .start();

        this.spinePlanet.timeScale = 1;
        this.spinePlanet.setAnimation(0, "hanhtinh", true);
    }

    private startedFly() {
        this.flying = true;
        this.spineRocket.node.position = v3(0, 0, 0);

        this.spinePlanet.timeScale = 1;
        this.spinePlanet.setAnimation(0, "hanhtinh", true);
    }

    explodeRocket() {
        this.playSFX(AudioIds.FLEW_AWAY);

        const animName = `explode`;
        AnimationUtils.playSpine(this.spineRocket, animName, false);

        this.crashed = true;

        this.spinePlanet.timeScale = 0;
        this.flying = false;
        this.flyingTween?.stop();
    }
}
