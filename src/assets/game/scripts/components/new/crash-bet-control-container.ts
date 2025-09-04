import gc from "@sg/game-client-base";
import { _decorator } from "cc";
import { ObserverComponent } from "db://shared-components/shared/common-components/observer-component/scripts/observer-component";
import Observer from "observer";
import { BetControlStore } from "../../handlers/crash-v2/bet/bet-control-store";
import { IBetControlSettings } from "../../handlers/crash-v2/interfaces";
import CrashBetControl from "./crash-bet-control";

const { Connection } = gc;
const { ccclass, property } = _decorator;
const { observer, render, handle } = Observer;

@ccclass("CrashBetControlContainer")
export default class CrashBetControlContainer extends ObserverComponent {
    @property({ type: CrashBetControl })
    controls: CrashBetControl[] = [];

    onLoad() {
        super.onLoad();
        this.controls.forEach((control, index) => {
            control.betKey = index;
        });
    }

    @render(BetControlStore, (store) => store.getBetState(0))
    renderBetStateFirst(state: string) {
        this.controls[0].renderBetState(state);
    }

    @render(BetControlStore, (store) => store.getBetState(1))
    renderBetStateSecond(state: string) {
        this.controls[1].renderBetState(state);
    }

    @render(BetControlStore, (store) => store.disableCashOut(0))
    renderDisableCashOut0(disable: boolean) {
        this.controls[0].setDisableCashOut(disable);
    }

    @render(BetControlStore, (store) => store.disableCashOut(1))
    renderDisableCashOut1(disable: boolean) {
        this.controls[1].setDisableCashOut(disable);
    }

    @render(BetControlStore, (store) => store.activeDownBet(0))
    renderActiveDownBet0(active: boolean) {
        this.controls[0].setActiveDownBet(active);
    }

    @render(BetControlStore, (store) => store.activeDownBet(1))
    renderActiveDownBet1(active: boolean) {
        this.controls[1].setActiveDownBet(active);
    }

    @render(BetControlStore, (store) => store.activeUpBet(0))
    renderActiveUpBet0(active: boolean) {
        this.controls[0].setActiveUpBet(active);
    }

    @render(BetControlStore, (store) => store.activeUpBet(1))
    renderActiveUpBet1(active: boolean) {
        this.controls[1].setActiveUpBet(active);
    }

    @render(BetControlStore, (store) => store.activeHalfBet(0))
    renderActiveHalfBet0(active: boolean) {
        this.controls[0].setActiveHalfBet(active);
    }

    @render(BetControlStore, (store) => store.activeHalfBet(1))
    renderActiveHalfBet1(active: boolean) {
        this.controls[1].setActiveHalfBet(active);
    }

    @render(BetControlStore, (store) => store.activeDoubleBet(0))
    renderActiveDoubleBet0(active: boolean) {
        this.controls[0].setActiveDoubleBet(active);
    }

    @render(BetControlStore, (store) => store.activeDoubleBet(1))
    renderActiveDoubleBet1(active: boolean) {
        this.controls[1].setActiveDoubleBet(active);
    }

    @render(BetControlStore, (store) => store.getBetSetting(0))
    renderBetSettingFirst(setting: IBetControlSettings) {
        this.controls[0].renderSetting(setting);
    }

    @render(BetControlStore, (store) => store.getBetSetting(1))
    renderBetSettingSecond(setting: IBetControlSettings) {
        this.controls[1].renderSetting(setting);
    }

    @render(BetControlStore, (store) => store.getCashedOutValue(0))
    renderCashOutValueFirst(value: number) {
        this.controls[0].renderCashOutValue(value);
    }

    @render(BetControlStore, (store) => store.getCashedOutValue(1))
    renderCashOutValueSecond(value: number) {
        this.controls[1].renderCashOutValue(value);
    }

    @render(BetControlStore, (store) => store.inputValues)
    renderInputValues(values: number[]) {
        if (values.length === 0) {
            return;
        }
        this.controls.forEach((control) => {
            control.renderInputValues(values);
        });
    }
}
