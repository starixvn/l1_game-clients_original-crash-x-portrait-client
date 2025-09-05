import gc from "@sg/game-client-base";
import { LogStore } from "db://shared-components/game/scripts/stores/log-store";
import { sharedContainer } from "../../scripts/shared-container";
import { settings } from "./game-settings";
import { TopResultClient } from "./handlers/api-client/top-result-client";
import * as CrashGameV2 from "./handlers/crash-v2";
import { AutoPlayHandler } from "./handlers/override/auto-play-handler";
import { BetResponseHandlers } from "./handlers/override/bet-response-handlers";
import { CrashBetHandler } from "./handlers/override/crash-bet-handler";
import { CrashBetListHandlers } from "./handlers/override/crash-bet-list-handlers";
import { CrashCashOutHandlers } from "./handlers/override/crash-cash-out-handlers";
import { GameCrashUserSettingHandlerV2 } from "./handlers/override/crash-game-user-setting-handler-v2";
import { PlayerActionHandlers } from "./handlers/override/player-action-handlers";


export const containerOptions: gc.IContainerOptions = {
    globalContainer: sharedContainer,
    onContainerCreated: (container) => {
        container.bind(gc.GameConfigs.GameSetting).toConstantValue(settings);
        container.bind(LogStore).to(LogStore);

        container.bind(gc.GameCrash.PlayerActions.PlayerActionHandlers).to(PlayerActionHandlers);
        container.bind(gc.GameCrash.CrashBet.CrashBetHandler).to(CrashBetHandler);
        container.bind(gc.GameCrash.CrashCashOut.CrashCashOutHandlers).to(CrashCashOutHandlers);
        container.bind(gc.Bet.BetResponseHandlers).to(BetResponseHandlers);
        container.bind(gc.GameCrash.AutoPlay.AutoPlayHandler).to(AutoPlayHandler);
        container.bind(gc.GameCrash.CrashBetList.CrashBetListHandlers).to(CrashBetListHandlers);
        container.bind(gc.GameCrash.CrashGameUserSetting.GameCrashUserSettingHandler).to(GameCrashUserSettingHandlerV2);
        container.bind(TopResultClient).to(TopResultClient);
    },
    features: [CrashGameV2, gc.GameCrash, ...gc.defaultFeatures],
};
