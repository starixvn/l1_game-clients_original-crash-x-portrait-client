import { Component, Node, ParticleSystem2D, Tween, UIOpacity, Vec3, _decorator, sp, toDegree, tween, v3 } from "cc";

import { AnimationUtils } from "db://shared-components/shared/utils";
import { SpaceManList } from "./space-man-list";

const { ccclass, property } = _decorator;

export const RocketAnim = {
    START: "rocket-start",
    FLY: "rocket-fly",
    IDLE: "rocket-idle",
    EXPLOSION_BIG: "explosion-big",
    EXPLOSION_SMALL: "explosion-small",
    SHAKEN_STRONG: "shaken",
    SHAKEN_WEAK: "shaken2",
};

@ccclass()
export class Rocket extends Component {
    @property(Node)
    rocket: Node = null;

    @property(Node)
    explosion: Node = null;

    @property(Node)
    nodeRocketHead: Node = null;

    @property(Node)
    nodeRocketTail: Node = null;

    @property(SpaceManList)
    cpnSpaceManList: SpaceManList = null;

    @property(Node)
    nodeTailStart: Node = null;

    @property(ParticleSystem2D)
    flyParticle: ParticleSystem2D = null;

    @property(Node)
    nodeRocketHeadEffect: Node = null;

    @property(sp.Skeleton)
    spineBackground: sp.Skeleton = null;

    get skeExplosion(): sp.Skeleton {
        return this.explosion.getComponent(sp.Skeleton);
    }
    get skeRocket(): sp.Skeleton {
        return this.rocket.getChildByName("skeleton").getComponent(sp.Skeleton);
    }

    private rotationTween: Tween<Node>;
    private positionTween: Tween<Node>;
    private explosionTween: Tween<Node>;
    private explosionOpacityTween: Tween<UIOpacity>;
    private backgroundTransitionTween: Tween<Node>;
    private readonly durationExplosion = 4;
    private readonly defaultAngleExplosion = 90;

    onLoad() {
        this.setRocketVisibility(false);
        this.setExplosionRocketVisibility(false);
    }

    startFly() {
        this.setRocketAnim(RocketAnim.FLY, true);
        this.flyParticle.stopSystem();
        this.flyParticle.speed = 0;
        this.flyParticle.resetSystem();
        tween(this.flyParticle).to(1, { speed: 100 }).start();
    }

    setSpaceManVisibility(status: boolean) {
        this.cpnSpaceManList.node.active = status;
        status && this.cpnSpaceManList.setVisibility(status);
    }

    setRocketAnim(name: string, loop: boolean) {
        this.skeRocket?.setAnimation(0, name, true);
        this.updateTailVisibility(name);
    }

    updateTailVisibility(name: string) {
        if (name === RocketAnim.IDLE) {
            this.flyParticle.stopSystem();
        }
    }

    setRocketVisibility(status: boolean) {
        this.rocket.active = status;
    }

    setExplosionRocketVisibility(status: boolean) {
        this.explosion.active = status;
    }

    updateRotation(angle: number, isAnimated = false, duration = 0.1) {
        if (isAnimated) {
            this.rotationTween?.stop();
            this.rotationTween = tween(this.node)
                .to(duration, { eulerAngles: v3(0, 0, angle) })
                .start();
        } else {
            this.node.eulerAngles = v3(0, 0, angle);
        }
    }

    updatePosition(pos: Vec3, isAnimated = false, duration = 0.1) {
        if (isAnimated) {
            this.positionTween?.stop();
            this.positionTween = tween(this.node).to(duration, { position: pos }).start();
        } else {
            this.node.position = pos;
        }
    }

    prepareRocket(startRotation: number, animated = true) {
        this.node.active = true;
        this.setRocketAnim(RocketAnim.IDLE, false);
        this.stopAnimation();
        this.setRocketVisibility(true);
        this.setExplosionRocketVisibility(false);
        const onFinished = () => {
            this.setRocketAnim(RocketAnim.START, true);
        };
        if (!animated) {
            onFinished();
            return;
        }
        this.updateRotation(0);
        tween(this.node)
            .delay(2)
            .to(2, { eulerAngles: v3(0, 0, startRotation) }, { easing: "sineOut" })
            .delay(2)
            .call(() => {
                onFinished();
            })
            .start();
    }

    playExplosionSpine() {
        const animName = "explosion";
        const duration = this.skeExplosion.findAnimation(animName).duration;
        this.skeExplosion.setAnimation(0, animName, false);
        this.explosionTween = tween(this.node)
            .delay(duration)
            .call(() => {
                this.explosion.active = false;
                this.playBackgroundTransition();
            })

            .start();
    }

    explode() {
        this.stopAnimation();
        this.setRocketVisibility(false);
        this.setExplosionRocketVisibility(true);
        this.playExplosionSpine();
    }

    playExplosionTween() {
        const degreeRocket = toDegree(Math.atan2(this.rocket.parent.position.y, this.rocket.parent.position.x));
        const durationAnimExplosion = 1.2;
        const durationOpacity = 1;
        this.explosion.angle = this.defaultAngleExplosion + degreeRocket;

        this.explosionTween = tween(this.explosion)
            .to(
                durationAnimExplosion,
                { scale: v3(2, 2, 2) },
                {
                    easing: (t) => {
                        const C1 = 0; // constant
                        const C2 = 1.2; // P0
                        const C3 = 1.8; // P1
                        const C4 = 1; // constant
                        const t1 = 1 - t;
                        return t1 * (t1 * (C1 + (C2 * 3 - C1) * t) + C3 * 3 * t * t) + C4 * t * t * t;
                    },
                }
            )

            .start();

        this.explosionOpacityTween = tween(this.explosion.getComponent(UIOpacity))
            .to(durationOpacity, { opacity: 235 }, { easing: "sineOut" })
            .to(durationAnimExplosion - durationOpacity, { opacity: 255 }, { easing: "sineIn" })
            .delay(this.durationExplosion - durationAnimExplosion - durationOpacity)
            .to(durationOpacity, { opacity: 1 }, { easing: "sineOut" })
            .start();
        this.backgroundTransitionTween = tween(this.node)
            .delay(this.durationExplosion - durationAnimExplosion)
            .call(() => {
                this.playBackgroundTransition();
            })

            .start();
    }

    stopAnimation() {
        this.rotationTween?.stop();
        this.positionTween?.stop();
        this.explosionTween?.stop();
        this.backgroundTransitionTween?.stop();
        this.explosionOpacityTween?.stop();
    }

    async playBackgroundTransition() {
        this.spineBackground && (await AnimationUtils.playSpine(this.spineBackground, "transition"));
    }
}
