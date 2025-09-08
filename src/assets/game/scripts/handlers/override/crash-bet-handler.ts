import gc from "@sg/game-client-base";
import inversify from "inversify";
import { BetControlStore } from "../crash-v2/bet/bet-control-store";
import { IBetControl } from "../crash-v2/interfaces";
const { injectable, inject } = inversify;

@injectable()
export class CrashBetHandler extends gc.GameCrash.CrashBet.CrashBetHandler {
    @inject(BetControlStore) private readonly betControlStore: BetControlStore;

    handle() {}

    callBet(betKey: number) {
        const setting = this.betControlStore.getBetSetting(betKey);
        const betData = this.createBetData({});
        Object.assign(betData, {
            autoCashOut: setting.autoCashOut ? setting.cashOutAt : undefined,
            amount: setting.amount,
            betKey: betKey,
        });

        this.newHandleBetData(betData, betKey);
    }

    callCashOut(betKey: number) {
        const cashOutData = {
            betKey,
            username: this.mainPlayerStore.name,
            roundId: this.roundStore.clientRoundId,
            clientSendTime: new Date(),
            m: 1,
        };
        this.connectionStore.send(gc.GameCrash.GameCrashEmitMessage.CashOut.eventName, cashOutData);
        this.retryGameHandler.handle();
    }

    validateBetWithBalance(betKey: number) {
        if (this.mainPlayerStore.balance < this.betControlStore.getBetAmount(betKey)) {
            this.showNoticePlaceBetFailure();
            return false;
        }
        return true;
    }

    enableEarlyBet(betKey: number) {
        if (this.validateBetWithBalance(betKey)) {
            this.betControlStore.setEarlyBet(betKey, true);
        }
    }

    cancelEarlyBet(betKey: number) {
        this.betControlStore.setEarlyBet(betKey, false);
        this.betControlStore.setAutoBet(betKey, false);
    }

    newHandleBetData(data: any, betKey: number) {
        const amount = data.amount;
        const control = this.betControlStore.controls[betKey];

        if (control.processing) {
            this.showWarningProcessingBet();
            return;
        }

        if (this.isValidBet(amount)) {
            this.betControlStore.setProcessing(betKey, true);
            this.connectionStore.send(gc.GameClientEmitMessage.Bet.eventName, data);
            this.retryGameHandler.handle();
        }
    }

    autoPlaceBet() {
        Object.values(this.betControlStore.controls).forEach((control, index) => {
            const earlyBet = control.earlyBet;
            if (control.setting.autoBet || earlyBet) {
                if (!this.validateBetWithBalance(index)) {
                    if (control.setting.autoBet) {
                        this.betControlStore.setAutoBet(index, false);
                    }

                    if (earlyBet) {
                        this.betControlStore.setEarlyBet(index, false);
                    }
                    return;
                }

                this.callBet(index);
                if (earlyBet) {
                    this.delayTurnOffEarlyBet(control);
                }
            }
        });
    }

    private delayTurnOffEarlyBet(control: IBetControl) {
        setTimeout(() => {
            control.earlyBet = false;
        }, 100);
    }

    stopAutoBet() {
        Object.keys(this.betControlStore.controls).forEach((betKey) => {
            this.betControlStore.setAutoBet(+betKey, false);
        });
    }

    toggleAutoBet(betKey: number) {
        this.betControlStore.toggleAutoBet(betKey);
        if (this.betControlStore.getBetSetting(betKey).autoBet) {
            this.onTurnOnAutoBet(betKey);
        } else {
            this.cancelEarlyBet(betKey);
        }
    }

    onTurnOnAutoBet(betKey: number) {
        if (!this.validateBetWithBalance(betKey)) {
            this.betControlStore.setAutoBet(betKey, false);
            return;
        }

        if (this.roundTimeStore.isPlacingBet) {
            const betAccepted = this.betControlStore.getBetAccepted(betKey);
            if (!betAccepted) {
                this.callBet(betKey);
            }
        } else if (this.roundTimeStore.roundTime === 0 || this.roundTimeStore.roundTime > this.roundTimeStore.placingBet) {
            this.enableEarlyBet(betKey);
        }
    }
}
