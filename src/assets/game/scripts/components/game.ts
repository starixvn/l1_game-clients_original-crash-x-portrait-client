import gc from "@sg/game-client-base";
import { _decorator } from "cc";
import { startGame } from "db://shared-components/shared/scripts/startup";
import Observer from "observer";

import GameCrashComponent from "../../../../extensions/shared-components/assets/game-crash/scripts/components/game-crash-component";
import { siteConfigs } from "../../../scripts/site-configs";
import { AudioIds } from "../../audios/AudioIds";
import { settings } from "../game-settings";
import { containerOptions } from "../containerOptions";
import { CrashBetHandler } from "../handlers/override/crash-bet-handler";
import "./../../../resources/i18n";

startGame(settings.name, containerOptions, siteConfigs, settings.namespaces);

const { ccclass } = _decorator;
const { observer, handle, render } = Observer;

@ccclass
@observer(settings.name)
export default class Game extends GameCrashComponent {
    override namespace = settings.name;
    override containerOptions = containerOptions;

    onHideGame() {
        this.stopAutoBet();
        super.onHideGame();
    }

    @handle(CrashBetHandler, (handler) => handler.stopAutoBet())
    stopAutoBet() {}

    @render(gc.Settlements.SettlementStatusStore, (store) => store.settlementStatus)
    playTotalWinSound(settlementStatus: any) {
        if (settlementStatus?.win) {
            this.playSound(AudioIds.TOTAL_WIN);
        }
    }

    @render(gc.Rounds.RoundTimeStore, (store) => store.roundState)
    renderRoundState(roundState: string) {
        if (roundState === gc.Rounds.ROUND_STATE.LOCKING_BET) {
            this.playSound(AudioIds.STOP_BET);
        } else if (roundState === gc.Rounds.ROUND_STATE.PLACING_BET) {
            this.playSound(AudioIds.START_BET);
        }
    }
}
