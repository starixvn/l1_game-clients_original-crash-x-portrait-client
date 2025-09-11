import gc from "@sg/game-client-base";
import { _decorator, Component, Label} from "cc";
import { CrashUtils } from "../../../crash-utils";

const { ccclass, property } = _decorator;
const { FormatUtils } = gc;

interface ILeaderBoardCashOutData {
    name: string;
    amount: number;
    multiplier?: number;
    win?: number;
    isMainPlayer?: boolean;
}

@ccclass
export class LeaderBoardCashOut extends Component {
    @property(Label)
    lblName: Label = null;

    @property(Label)
    lblMultiplier: Label = null;

    @property(Label)
    lblWin: Label = null;

    @property(Label)
    lblBetAmount: Label = null;

    setData(data: ILeaderBoardCashOutData) {
        const { name, multiplier, win, amount, isMainPlayer } = data;
        this.lblName.string = isMainPlayer ? name : CrashUtils.encryptedName(name);
        this.lblBetAmount.string = FormatUtils.numberWithCommas(amount, 2);
        const hasCashedOut = multiplier > 0;
        this.lblMultiplier.string = hasCashedOut ? `${FormatUtils.numberWithCommas(multiplier, 2, false)}x` : "-";
        this.lblWin.string = hasCashedOut ? FormatUtils.numberWithCommas(win, 2) : "-";
    }
}
