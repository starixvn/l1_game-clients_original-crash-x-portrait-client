import { _decorator, Component } from "cc";

import { CrashUtils } from "../../../crash-utils";
import { MainPlayerBetData } from "../../../handlers/crash-v2/interfaces";
import { LeaderBoardCashOut } from "./leader-board-cash-out";

const { ccclass, property } = _decorator;

@ccclass
export class LeaderBoardMainPlayer extends Component {
    @property(LeaderBoardCashOut)
    firstRow: LeaderBoardCashOut = null;

    @property(LeaderBoardCashOut)
    secondRow: LeaderBoardCashOut = null;

    onLoad() {
        this.hideAllRows();
    }

    private hideAllRows() {
        this.setRowDisplay(this.firstRow, false);
        this.setRowDisplay(this.secondRow, false);
    }

    setData(data: MainPlayerBetData) {
        const currentRow = this.getRowForBet(data.betKey);
        this.updateRowData(currentRow, data);
    }

    private getRowForBet(betKey: number): LeaderBoardCashOut {
        if (betKey === 1) {
            this.setRowDisplay(this.secondRow, true);
            return this.secondRow;
        }
        this.setRowDisplay(this.firstRow, true);
        return this.firstRow;
    }

    private updateRowData(row: LeaderBoardCashOut, data: MainPlayerBetData) {
        const hasWon = data.win !== undefined && data.win > 0;

        const rowData = {
            name: data.name,
            amount: data.amount,
            ...(hasWon && {
                multiplier: data.multiplier,
                win: data.win
            }),
            isMainPlayer: true
        };

        row.setData(rowData);

        if (hasWon) {
            row.lblMultiplier.color = CrashUtils.getMultiplierColor(data.multiplier);
        } else {
            row.lblMultiplier.color = CrashUtils.getWhiteColor();
        }
    }

    private setRowDisplay(row: LeaderBoardCashOut, status: boolean) {
        row.node.active = status;
    }

    setSecondRowDisplay(status: boolean) {
        this.setRowDisplay(this.secondRow, status);
    }

    isShowSecondRow(): boolean {
        return this.secondRow.node.active;
    }

    setFirstRowDisplay(status: boolean) {
        this.setRowDisplay(this.firstRow, status);
    }

    isShowFirstRow(): boolean {
        return this.firstRow.node.active;
    }
}
