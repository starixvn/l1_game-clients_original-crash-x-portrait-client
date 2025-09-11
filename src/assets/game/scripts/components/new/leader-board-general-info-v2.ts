import { _decorator, Label } from "cc";
import { ObserverComponent } from "db://shared-components/shared/common-components/observer-component/scripts/observer-component";
import Observer from "observer";
import { CrashBetListStore } from "../../handlers/crash-v2/bet/crash-bet-list-store";

const { ccclass, property } = _decorator;
const { render, handle } = Observer;

@ccclass
export class LeaderBoardGeneralInfoV2 extends ObserverComponent {
    @property(Label)
    lblTotalBets: Label = null;

    @property(Label)
    lblCashOut: Label = null;

    @render(CrashBetListStore, (store) => store.noOfBets)
    private updateTotalBets(noOfBets: number) {
        this.lblTotalBets.string = noOfBets.toString();
    }

    @render(CrashBetListStore, (store) => store.noOfCashOuts)
    private updateCashOut(noOfCashOuts: number) {
        this.lblCashOut.string = noOfCashOuts.toString();
    }
}
