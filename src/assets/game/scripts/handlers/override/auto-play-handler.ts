import gc from "@sg/game-client-base";
import inversify from "inversify";
import { CrashBetHandler } from "./crash-bet-handler";
const { injectable, inject } = inversify;
@injectable()
export class AutoPlayHandler extends gc.GameCrash.AutoPlay.AutoPlayHandler {
    @inject(CrashBetHandler) private readonly newCrashBetHandler: CrashBetHandler;

    handleCancelAutoPlayWhenApiError() {
        this.newCrashBetHandler.stopAutoBet();
    }

    handleAutoPlaceBetAtPlacingBet() {
        const clientServerDelayTime = 500;
        setTimeout(() => {
            this.newCrashBetHandler.autoPlaceBet();
        }, clientServerDelayTime);
    }
}
