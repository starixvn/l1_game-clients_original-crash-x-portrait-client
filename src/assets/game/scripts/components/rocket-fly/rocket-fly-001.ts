import gc from "@sg/game-client-base";
import { _decorator, Node, toDegree, Tween, tween, UITransform, v3, Vec3 } from "cc";
import { AnimationUtils } from "db://shared-components/shared/utils";
import Observer from "observer";

import ColMultipliers from "../../../../../extensions/shared-components/assets/game-crash/col-multipliers/col-multipliers";
import { ObserverComponent } from "../../../../../extensions/shared-components/assets/shared/common-components/observer-component/scripts/observer-component";
import { BG_CLOSING_TRANSITION_DURATION } from "../background-control";
import { Rocket, RocketAnim } from "./rocket";

const { ccclass, property } = _decorator;

const { handle, render } = Observer;
const { GameCrash } = gc;

type TweenDeltaTime = {
    deltaTime: number;
};

@ccclass
export class RocketFly extends ObserverComponent {
    @property(Rocket)
    cpnRocket: Rocket = null;

    @property(UITransform)
    transformRocketTail: UITransform = null;

    @property(Node)
    startPoint: Node = null;

    @property(Node)
    nodeColMultiplier: Node = null;
    private readonly startRotation = -90;
   private readonly graphWidth = 500;
   private readonly graphMaxX = 32;
   private readonly rawLimitX = 30;
   private readonly graphScale = this.graphWidth / this.graphMaxX;
   private readonly smallExplosionMultiplier = 1.02;
   private readonly realGraphWidth = 700;
   private readonly graphTranslateX = this.realGraphWidth - this.graphWidth - 50;
   private readonly graphTranslateDuration = this.rawLimitX * 1000;
   private deltaTime = 0;
   private startedRocketFlying = false;
   private reachedLimitX = false;
   private preparingRocket = false;
   private cpnColMultipliers: ColMultipliers;
   private tweenDeltaTime: Tween<TweenDeltaTime>;

    private get startPosition(): Vec3 {
        return this.startPoint.position;
    }

    onLoad() {
        this.cpnColMultipliers = this.nodeColMultiplier.getComponent(ColMultipliers);
        this.cpnRocket.updatePosition(this.startPosition, false);

        super.onLoad();
    }

    onDestroy(): void {
        super.onDestroy();
        this.tweenDeltaTime?.stop();
    }

    @render(gc.Settlements.SettlementStore, (store) => store.result, {
        fireImmediately: false,
    })
    async renderRocketExplosion(result: gc.GameServiceMessage.TResult) {
        if (result) {
            this.preparingRocket = false;
            +result < this.smallExplosionMultiplier && (await AnimationUtils.delayTime(0.5));
            this.updateIsCrashed();
            this.explodeRocket();
        }
    }

    @handle(GameCrash.CrashMultiplier.MultiplierHandlers, (handle, crashed: string) => handle.handleRocketState(crashed))
    updateIsCrashed() {
        return GameCrash.RocketState.CRASHED;
    }

    @render(GameCrash.CrashMultiplier.MultiplierStore, (store) => store.time, { fireImmediately: false })
    setTimeByMultiplier(time: number) {
        if (time - this.deltaTime > 150) {
            const timePoint = time - 100;
            this.updateDeltaTime(timePoint);
        }
        this.cpnRocket.setRocketVisibility(true);
        const tweenObject = {
            deltaTime: this.deltaTime,
        };
        this.tweenDeltaTime?.stop();
        this.tweenDeltaTime = tween(tweenObject)
            .to(
                0.1,
                {
                    deltaTime: time,
                },
                {
                    onUpdate: () => {
                        this.node.isValid && this.updateDeltaTime(tweenObject.deltaTime);
                    },
                }
            )
            .start();

        if (!this.startedRocketFlying) {
            this.cpnRocket.startFly();

            this.startedRocketFlying = true;
        }
    }

    private updateDeltaTime(deltaTime: number) {
        this.deltaTime = deltaTime;
        if (!this.reachedLimitX) {
            this.flyRocket(this.deltaTime, false);
            this.movingRocketContainer(this.deltaTime, false);
        }
        this.cpnColMultipliers.handleScroll(
            this.cpnRocket.nodeRocketHead,
            this.calculateMultiplier(this.getTimeInSeconds(this.deltaTime)),
            false
        );
    }

    @render(gc.Rounds.RoundTimeStore, (store) => store.isInRoundTime)
    renderInRoundTime(isInRoundTime: boolean) {
        if (isInRoundTime && !this.preparingRocket) {
            this.prepareForRocket(false);
        }
    }

    @render(gc.Rounds.RoundTimeStore, (store) => store.isStartRound)
    startNewRound(isStartRound: boolean) {
        if (!isStartRound) {
            return;
        }
        this.scheduleOnce(() => {
            this.prepareForRocket(true);
            this.cpnColMultipliers.scrollUp();
        }, BG_CLOSING_TRANSITION_DURATION / 2);
    }

    private prepareForRocket(animated: boolean) {
        this.preparingRocket = true;
        this.updateRocketTailWidth(0);
       // this.cpnRocket.prepareRocket(this.startRotation, animated);
        this.cpnRocket.updatePosition(this.startPosition);
        this.resetRocketContainer();
        this.reachedLimitX = false;
        this.deltaTime = 0;
    }

    calculateRocketPosition(rawX: number, scale: number) {
        const rawY = this.calculateMultiplier(rawX) - 1;
        return v3(rawX * scale, rawY * scale);
    }

    calculateMultiplier(time: number) {
        const a = 0.04;
        const b = 0.66;
        const c = 1 - Math.pow(b, 5);
        return Math.pow(a * time + b, 5) + c;
    }

    movingRocketContainer(time: number, animated: boolean) {
        const container = this.cpnRocket.node.parent;
        const ratio = Math.min(time / this.graphTranslateDuration, 1);
        const destX = this.graphTranslateX * ratio;

        const destPosition = v3(destX, container.position.y);
        if (animated) {
            Tween.stopAllByTarget(container);
            tween(container).to(0.1, { position: destPosition }).start();
        } else {
            container.position = destPosition;
        }
    }

    resetRocketContainer() {
        const container = this.cpnRocket.node.parent;
        container.position = v3(0, container.position.y);
    }

    getTimeInSeconds(time: number) {
        return time / 1000;
    }

    async flyRocket(time: number, animated = true) {
        const scale = this.graphScale;
        const rawLimitX = this.rawLimitX;

        let rawX = this.getTimeInSeconds(time) * this.getTimerRate();

        if (rawX >= rawLimitX) {
            rawX = rawLimitX;
            this.reachedLimitX = true;
            this.startShakeRocketAnimation();
        }
        const newPosition = this.calculateRocketPosition(rawX, scale);
        const prevRocketPosition = this.calculateRocketPosition(rawX - 0.1, scale);
        const delta = {
            x: newPosition.x - prevRocketPosition.x,
            y: newPosition.y - prevRocketPosition.y,
        };

        this.updateRocketTailWidth(newPosition.x);
        const eulerAngle = this.startRotation + toDegree(Math.atan2(delta.y, delta.x));
        this.cpnRocket.updateRotation(eulerAngle, animated);
        this.cpnRocket.updatePosition(newPosition, animated);
    }

    protected startShakeRocketAnimation() {
        this.cpnRocket.skeRocket?.setAnimation(0, RocketAnim.SHAKEN_STRONG, true);
        const duration = this.cpnRocket?.skeRocket?.findAnimation(RocketAnim.SHAKEN_STRONG).duration;
        duration > 0 &&
            tween(this.node)
                .delay(duration)
                .call(() => {
                    this.cpnRocket?.skeRocket?.setAnimation(0, RocketAnim.SHAKEN_WEAK, true);
                })
                .start();
    }

    private updateRocketTailWidth(width: number) {
        this.showRocketTail();
        const offset = width > 0 ? Math.abs(this.transformRocketTail.node.position.x) : 0;
        this.transformRocketTail.width = width + offset;
    }

    explodeRocket() {
        this.tweenDeltaTime?.stop();
        this.hideRocketTail();
        this.startedRocketFlying = false;
        this.cpnRocket.explode();
    }

    private showRocketTail() {
        this.transformRocketTail.node.active = true;
    }

    private hideRocketTail() {
        this.transformRocketTail.node.active = false;
    }

    getTimerRate() {
        const x = Math.min(1, this.deltaTime / this.graphTranslateDuration);
        return Math.pow(1 - x, 2) + 1;
    }
}
