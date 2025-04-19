import {
    IPersistence,
    IPersistenceRead,
} from "@rocket.chat/apps-engine/definition/accessors";
import { ISubscription } from "../definitions/ISubscription";
import {
    RocketChatAssociationModel,
    RocketChatAssociationRecord,
} from "@rocket.chat/apps-engine/definition/metadata";

export class SubscriptionPersistence {
    constructor(
        private readonly persistence: IPersistence,
        private readonly persistenceRead: IPersistenceRead,
    ) {}

    public async subscribeForm(subscription: ISubscription): Promise<void> {
        try {
            const association: Array<RocketChatAssociationRecord> = [
                new RocketChatAssociationRecord(
                    RocketChatAssociationModel.MISC,
                    `subscription`,
                ),
                new RocketChatAssociationRecord(
                    RocketChatAssociationModel.MISC,
                    `form:${subscription.formId}`,
                ),
                new RocketChatAssociationRecord(
                    RocketChatAssociationModel.MISC,
                    `watch:${subscription.watchId}`,
                ),
                new RocketChatAssociationRecord(
                    RocketChatAssociationModel.ROOM,
                    subscription.roomId,
                ),
                new RocketChatAssociationRecord(
                    RocketChatAssociationModel.USER,
                    subscription.userId,
                ),
            ];

            await this.persistence.updateByAssociations(
                association,
                subscription,
                true,
            );
        } catch (error) {
            console.log(error);
        }
    }

    public async getSubscribedFormData(
        formId: string,
        watchId: string,
    ): Promise<ISubscription> {
        let subscription: ISubscription | null = null;
        try {
            const associations: Array<RocketChatAssociationRecord> = [
                new RocketChatAssociationRecord(
                    RocketChatAssociationModel.MISC,
                    `form:${formId}`,
                ),
                new RocketChatAssociationRecord(
                    RocketChatAssociationModel.MISC,
                    `watch:${watchId}`,
                ),
            ];

            const results =
                await this.persistenceRead.readByAssociations(associations);
            subscription = results[0] as ISubscription;
        } catch (error) {
            console.log(error);
        }

        return subscription!;
    }
}
