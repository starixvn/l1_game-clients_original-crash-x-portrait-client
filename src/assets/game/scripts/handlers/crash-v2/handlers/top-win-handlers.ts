import gc from "@sg/game-client-base";
import inversify from "inversify";
import { PeriodType } from "../../api-client/api-settings";
import { TopResultClient, TopWinItem } from "../../api-client/top-result-client";
import { TopWinStore } from "../bet/top-win-store";

const { injectable, inject } = inversify;

@injectable()
export class TopWinHandlers {
    @inject(TopResultClient) protected readonly topResultClient: TopResultClient;
    @inject(TopWinStore) protected readonly topWinStore: TopWinStore;
    @inject(gc.GameCrash.ProvablyFair.ProvablyFairStore) protected readonly provablyFairStore: gc.GameCrash.ProvablyFair.ProvablyFairStore;
    @inject(gc.RoundPF.RoundPFHandler) protected readonly roundPFHandler: gc.RoundPF.RoundPFHandler;
    @inject(gc.RoundPF.RoundPFStore) protected readonly roundPFStore: gc.RoundPF.RoundPFStore;
    @inject(gc.Player.MainPlayerStore) protected readonly mainPlayerStore: gc.Player.MainPlayerStore;

    async getTopWinByType(type: number) {
        let topWinItems: TopWinItem[] = [];
        if(type === PeriodType.Monthly) {
            topWinItems = await this.topResultClient.getTopWinMonthly();

        } else if(type === PeriodType.Yearly) {
            topWinItems = await this.topResultClient.getTopWinYearly();
        }

        topWinItems.forEach(item => {
            this.convertValueByCurrency(item);
        });

        this.topWinStore.topWinItems = topWinItems;
        return topWinItems;
    }

    openVerificationHistory(roundId: number) {
        this.roundPFHandler.requestForCurrentRound = false;
        const roundPFResult = this.getRoundPF(roundId);
        this.roundPFStore.pf = roundPFResult;
        this.provablyFairStore.openVerification = { mode: gc.GameCrash.ProvablyFair.VerificationMode.History, roundId };
    }

    getRoundPF(roundId: number) {
        const topWinItem = this.topWinStore.getTopWinItemByRoundId(roundId);

        var roundPfResult: gc.GameServiceMessage.RoundPFResult = {
            roundId: topWinItem.provablyFair?.roundId,
            serverSeedHash: topWinItem.provablyFair?.serverSeedHash,
            serverSeed: topWinItem.provablyFair?.serverSeed,
            clientSeeds: topWinItem.provablyFair?.clientSeeds?.map(clientSeed => ({
                nickname: clientSeed?.name,
                ...clientSeed
            })),
            mergeClientSeed: topWinItem.provablyFair?.mergeClientSeed,
            mergeSeed: topWinItem.provablyFair?.mergeSeed,
            finalHash: topWinItem.provablyFair?.finalHash,
            result: topWinItem.crashPoint,
        }

        return roundPfResult;
    }

    convertValueByCurrency(topWinItem: TopWinItem) {
        const rate = topWinItem.rate;
        topWinItem.betAmount = gc.NumberUtils.getValueByCurrency(topWinItem.betAmount, this.mainPlayerStore.rate, rate);
        topWinItem.winAmount = gc.NumberUtils.getValueByCurrency(topWinItem.winAmount, this.mainPlayerStore.rate, rate);
    }
}
