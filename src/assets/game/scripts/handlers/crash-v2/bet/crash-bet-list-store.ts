import { GameCrashServiceMessage, LeaderBoardPlayer } from "@sg/game-client-base/dist/game-crash";
import inversify from "inversify";
import * as _ from "lodash-es";
import mobx from "mobx";
import { MainPlayerBetData } from "../interfaces";

const { injectable, inject } = inversify;

export interface ICrashBetList {
    [playerId: string]: ICrashBetListDetail;
}

export interface ICrashBetListDetail {
    [betKey: number]: GameCrashServiceMessage.CrashOtherPlayer;
}

@injectable()
export class CrashBetListStore {
    private _otherPlayers: LeaderBoardPlayer[] = [];
    private _mainPlayer: GameCrashServiceMessage.CrashOtherPlayer = null;
    private _mainPlayerCashOut: MainPlayerBetData[] = [];

    constructor() {
        mobx.makeAutoObservable(this);
    }

    set otherPlayers(value: LeaderBoardPlayer[]) {
        this._otherPlayers = value;
    }

    get otherPlayers(): LeaderBoardPlayer[] {
        return this._otherPlayers;
    }

    set mainPlayer(value: GameCrashServiceMessage.CrashOtherPlayer) {
        this._mainPlayer = value;
    }

    get mainPlayer(): GameCrashServiceMessage.CrashOtherPlayer {
        return this._mainPlayer;
    }

    set mainPlayerCashOut(value: MainPlayerBetData[]) {
        this._mainPlayerCashOut = value;
    }

    get mainPlayerCashOut(): MainPlayerBetData[] {
        return this._mainPlayerCashOut;
    }

    addAcceptedBet(acceptedBetData: MainPlayerBetData) {
        this.mainPlayerCashOut = [...this.mainPlayerCashOut, acceptedBetData];

        if (this.mainPlayer === null || this.mainPlayer === undefined) {
            const name = acceptedBetData.name;
            const amount = acceptedBetData.amount;
            const player = { name, amount };
            this.mainPlayer = player;
        }
    }

    updateCashOutData(cashOutData: MainPlayerBetData) {
        const cashOut = this.mainPlayerCashOut.find((element) => element.betKey === cashOutData.betKey);
        if (cashOut) {
            cashOut.win = cashOutData.win;
            cashOut.cashOutWin = cashOutData.cashOutWin;
            cashOut.multiplier = cashOutData.multiplier;
            cashOut.reachMaxWin = cashOutData.reachMaxWin;
        }

        this.mainPlayerCashOut = [...this.mainPlayerCashOut];
    }

    updatePlayerName(name: string) {
        this._mainPlayerCashOut.forEach((element) => {
            element.name = name;
        });
    }

    private groupPlayersByName(playerList: any) {
        const playerByGroup = _.groupBy(playerList, (item) => item.name);
        return Object.keys(playerByGroup).length;
    }

    get noOfPlayerBet(): number {
        const countMainPlayer = this.mainPlayer ? 1 : 0;
        return this.groupPlayersByName(this.otherPlayers) + countMainPlayer;
    }

    get noOfPlayerCashOut(): number {
        const players = [];
        this.otherPlayers.forEach((player: LeaderBoardPlayer) => {
            player.win > 0 && players.push(player);
        });
        const countMainPlayer = this.isMainPlayerCashOut ? 1 : 0;
        return this.groupPlayersByName(players) + countMainPlayer;
    }

    get totalCashOut(): number {
        let otherPlayersCashOut = 0;

        this.otherPlayers.forEach((player) => {
            otherPlayersCashOut += player.win;
        });

        return otherPlayersCashOut + this.totalMainPlayerCashOut;
    }

    get isMainPlayerCashOut(): boolean {
        return this.mainPlayerCashOut.some((curr) => curr.win > 0);
    }

    get totalMainPlayerCashOut(): number {
        return this.mainPlayerCashOut.reduce((acc, curr) => acc + (curr.win ?? 0), 0);
    }
}
