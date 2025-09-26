import inversify from "inversify";
import mobx from "mobx";
const { injectable, inject } = inversify;

import gc from "@sg/game-client-base";
import { ButtonState, CrashCashOutData, IBetControl, IBetControlSettings, MinMultiplier } from "../interfaces";

@injectable()
export class BetControlStore {
    @inject(gc.Rounds.RoundTimeStore) protected readonly roundTimeStore: gc.Rounds.RoundTimeStore;
    @inject(gc.Rounds.RoundStore) protected readonly roundStore: gc.Rounds.RoundStore;
    @inject(gc.GameCrash.CrashMultiplier.MultiplierStore) protected readonly multiplierStore: gc.GameCrash.CrashMultiplier.MultiplierStore;

    @inject(gc.GameConfigs.GameConfigStore) protected readonly gameConfigStore: gc.GameConfigs.GameConfigStore;
    @inject(gc.GameCrash.CrashGameConfigs.CrashGameConfigStore)
    protected readonly crashGameConfigStore: gc.GameCrash.CrashGameConfigs.CrashGameConfigStore;
    @inject(gc.Player.MainPlayerStore) protected readonly mainPlayerStore: gc.Player.MainPlayerStore;

    @inject(gc.GameUserSettings.GameUserSettingHandler)
    protected readonly gameUserSettingHandler: gc.GameUserSettings.GameUserSettingHandler;

    constructor() {
        mobx.makeAutoObservable(this);
        setTimeout(() => {
            this.onLoadStorage();
            mobx.reaction(
                () => this.gameConfigStore.chips,
                (chips) => {
                    this.inputValues = chips.map((chip) => +chip);

                    if (this.inputValues.length > 3) {
                        console.warn("Setting chips MUST equal 3");
                        this.inputValues = this.inputValues.slice(0, 3);
                    }
                }
            );

            mobx.reaction(
                () => this.roundTimeStore.roundTime,
                (roundTime) => {
                    if (roundTime === 0) {
                        Object.values(this.controls).forEach((control, betKey) => {
                            if (control.setting.autoBet) {
                                this.setEarlyBet(betKey, true);
                            }
                        });
                    }
                }
            );

            mobx.reaction(
                () => this.roundStore.maxBet && this.roundStore.minBet,
                () => {
                    this.validCurrentBetAmounts();
                }
            );
        }, 0);
    }

    defaultSettings: { [betKey: number]: IBetControlSettings } = {
        0: {
            autoCashOut: false,
            autoBet: false,
            cashOutAt: MinMultiplier,
            amount: 1,
        },
        1: {
            autoCashOut: false,
            autoBet: false,
            cashOutAt: MinMultiplier,
            amount: 1,
        },
    };
    controls: { [betKey: number]: IBetControl } = {
        0: {
            processing: false,
            betAccepted: null,
            earlyBet: false,
            cashedOut: null,
            setting: {
                autoCashOut: false,
                autoBet: false,
                cashOutAt: MinMultiplier,
                amount: 1,
            },
        },
        1: {
            processing: false,
            betAccepted: null,
            earlyBet: false,
            cashedOut: null,
            setting: {
                autoCashOut: false,
                autoBet: false,
                cashOutAt: MinMultiplier,
                amount: 1,
            },
        },
    };

    inputValues: number[] = [];
    selectedInputIndex: { [betKey: number]: number } = {};

    get notAllowChangeClientSeed(): boolean {
        return this.isNotAllowChangeClientSeed();
    }

    selectBetInput(betkey: number, index: number) {
        let value = 0;
        if (index < this.inputValues.length) {
            if (this.selectedInputIndex[betkey] === index) {
                value = this.getBetAmount(betkey);
            }
            value += this.inputValues[index];
        } else {
            value = Math.min(this.maxBet, this.mainPlayerStore.balance);
        }

        this.selectedInputIndex[betkey] = index;
        this.setValidBetAmount(betkey, value);
    }

    get maxBet() {
        const betAmount = Object.values(this.controls).reduce((acc, control) => acc + (control?.betAccepted?.value ?? 0), 0);
        return this.roundStore.maxBet - betAmount;
    }

    get minBet() {
        return this.roundStore.minBet;
    }

    activeDownBet(betKey: number) {
        const currentAmount = this.getBetAmount(betKey);
        return currentAmount > this.minBet;
    }

    activeUpBet(betKey: number) {
        const currentAmount = this.getBetAmount(betKey);
        return currentAmount < this.maxBet;
    }

    activeHalfBet(betKey: number) {
        const currentAmount = this.getBetAmount(betKey);
        return currentAmount > this.minBet;
    }

    activeDoubleBet(betKey: number) {
        const currentAmount = this.getBetAmount(betKey);
        return currentAmount < this.maxBet;
    }

    validCurrentBetAmounts() {
        Object.values(this.controls).forEach((control, betKey) => {
            const currentAmount = control.setting.amount;
            if (!control.betAccepted) {
                this.setValidBetAmount(betKey, currentAmount);
            }
        });
    }

    changeBetAmount(betkey: number, increase: boolean) {
        const amount = this.minBet * (increase ? 1 : -1);
        const currentAmount = this.getBetAmount(betkey);
        const newAmount = currentAmount + amount;
        this.setValidBetAmount(betkey, newAmount);
    }

    multiplyBetAmount(betKey: number, multiplier: number) {
        const newAmount = this.getBetAmount(betKey) * multiplier;
        this.setValidBetAmount(betKey, newAmount);
    }

    setValidBetAmount(betKey: number, amount: number) {
        let validAmount = Math.min(amount, this.maxBet);
        validAmount = Math.max(validAmount, this.minBet);
        this.setBetAmount(betKey, validAmount);
    }

    setValidCashOutAt(betKey: number, cashOutAt: number) {
        let validCashOutAt = Math.min(cashOutAt, this.crashGameConfigStore.maxMultiplier);
        validCashOutAt = Math.max(validCashOutAt, this.crashGameConfigStore.minMultiplier);
        this.setCashOutMultiplier(betKey, validCashOutAt);
    }

    setProcessing(betKey: number, processing: boolean) {
        this.controls[betKey].processing = processing;
    }

    setAcceptedBet(betKey: number, value: number, animated: boolean) {
        this.controls[betKey].betAccepted = { value, animated };
        this.setProcessing(betKey, false);
    }

    setCashedOut(cashedOut: CrashCashOutData) {
        this.controls[cashedOut.betKey].cashedOut = cashedOut;
    }

    resetControl(betKey: number) {
        this.controls[betKey].processing = false;
        this.controls[betKey].betAccepted = null;
        this.controls[betKey].cashedOut = null;
    }

    resetLastBet() {
        Object.keys(this.controls).forEach((key) => {
            const betKey = Number(key);
            this.resetControl(betKey);
        });
    }

    toggleAutoBet(betKey: number) {
        this.controls[betKey].setting = {
            ...this.controls[betKey].setting,
            autoBet: !this.controls[betKey].setting.autoBet,
        };
        this.onSaveStorage();
    }

    turnOffAutoBet() {
        if (!this.controls[0].setting.autoBet && !this.controls[1].setting.autoBet) {
            return;
        }

        let turnOffBetKey = 0;
        const betKey0Value = this.controls[0].setting.amount;
        const betKey1Value = this.controls[1].setting.amount;
        if (betKey0Value >= betKey1Value) {
            turnOffBetKey = 1;
        }
        if (this.controls[turnOffBetKey].setting.autoBet) {
            this.toggleAutoBet(turnOffBetKey);
        }
    }

    toggleAutoCashOut(betKey: number) {
        this.controls[betKey].setting = {
            ...this.controls[betKey].setting,
            autoCashOut: !this.controls[betKey].setting.autoCashOut,
        };
        this.onSaveStorage();
    }

    setAutoBet(betKey: number, enabled: boolean) {
        this.controls[betKey].setting = {
            ...this.controls[betKey].setting,
            autoBet: enabled,
        };
        this.onSaveStorage();
    }

    setAutoCashOut(betKey: number, enabled: boolean) {
        this.controls[betKey].setting = {
            ...this.controls[betKey].setting,
            autoCashOut: enabled,
        };
        this.onSaveStorage();
    }

    setEarlyBet(betKey: number, earlyBet: boolean) {
        this.controls[betKey].earlyBet = earlyBet;
    }

    setCashOutMultiplier(betKey: number, multiplier: number) {
        this.controls[betKey].setting = {
            ...this.controls[betKey].setting,
            cashOutAt: multiplier,
        };
        this.onSaveStorage();
    }

    setBetAmount(betKey: number, amount: number) {
        this.controls[betKey].setting = {
            ...this.controls[betKey].setting,
            amount: amount,
        };
        this.onSaveStorage();
    }

    getBetSetting(betKey: number) {
        return this.controls[betKey].setting;
    }

    getBetAccepted(betKey: number, checkAnimated = false) {
        if (!checkAnimated) {
            return this.controls[betKey].betAccepted;
        }

        return this.controls[betKey]?.betAccepted?.animated ? this.controls[betKey].betAccepted : null;
    }

    getBetState(betKey: number) {
        if (!this.roundTimeStore.initialized) {
            return "None";
        }
        const betAccepted = this.controls[betKey].betAccepted;
        const earlyBet = this.controls[betKey].earlyBet;

        if (this.roundTimeStore.roundTime <= 0 || this.roundTimeStore.roundTime > this.roundTimeStore.placingBet) {
            //flying and result
            if (betAccepted) {
                return ButtonState.CASH_OUT;
            } else {
                return !earlyBet ? ButtonState.BET_NEXT_ROUND : ButtonState.CANCEL_BET;
            }
        }

        const state = earlyBet ? ButtonState.CANCEL_BET : ButtonState.PLACE_BET;
        return betAccepted ? ButtonState.BET_ACCEPTED : state;
    }

    isNotAllowChangeClientSeed() {
        const betStates = Object.keys(this.controls).map((betKey) => this.getBetState(+betKey));
        return betStates.some((state) => state === ButtonState.BET_ACCEPTED || state === ButtonState.CASH_OUT);
    }

    disableCashOut(betKey: number) {
        const state = this.getBetState(betKey);
        const cashedOut = this.controls[betKey].cashedOut;
        return state === ButtonState.CASH_OUT && (cashedOut || this.multiplierStore.rocketState === gc.GameCrash.RocketState.CRASHED);
    }

    getBetAmount(betKey: number) {
        return this.controls[betKey].setting.amount;
    }

    getCashedOutValue(betKey: number) {
        const cashedOut = this.controls[betKey].cashedOut;
        const betAmount = this.getBetAmount(betKey);

        return cashedOut ? cashedOut.cashOutWin : betAmount * this.multiplierStore.multiplier;
    }

    isCashedOutAllBets() {
        const controls = Object.values(this.controls);
        const betCount = controls.filter((control) => control.betAccepted).length;
        const cashedOutCount = controls.filter((control) => control.cashedOut).length;
        return cashedOutCount === betCount;
    }

    onSaveStorage() {
        this.gameUserSettingHandler.saveTempStorage();
    }

    onLoadStorage() {
        const data = gc.StorageManager.get(gc.localStorageKeys.gameUserSetting);
        if (data) {
            Object.values(data).forEach((setting, index) => {
                this.controls[index].setting = setting;
            });
        } else {
            Object.keys(this.defaultSettings).forEach((key) => {
                this.controls[+key].setting = this.defaultSettings[+key];
            });
        }
    }
}
