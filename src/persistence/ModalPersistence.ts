import {
    IPersistence,
    IPersistenceRead,
} from "@rocket.chat/apps-engine/definition/accessors";
import {
    RocketChatAssociationModel,
    RocketChatAssociationRecord,
} from "@rocket.chat/apps-engine/definition/metadata";

export class ModalPersistence {
    private userId;
    private viewId;
    constructor(
        private readonly persistence: IPersistence,
        private readonly persistenceRead: IPersistenceRead,
        userId: string,
        viewId: string
    ) {
        this.userId = userId;
        this.viewId = viewId;
    }

    public async storeInteractionId(record: object) {
        try {
            const association = new RocketChatAssociationRecord(
                RocketChatAssociationModel.USER,
                `${this.userId}#${this.viewId}`
            );

            let data: object;
            const records = await this.getAllInteractionActionId();
            if (records && records.data.length > 0) {
                records.data.push(record);
                data = records;
            } else {
                data = { data: [record] };
            }

            await this.persistence.updateByAssociations(
                [association],
                data,
                true
            );
        } catch (error) {
            console.log(error);
        }
    }

    public async getAllInteractionActionId(): Promise<any> {
        try {
            const association = new RocketChatAssociationRecord(
                RocketChatAssociationModel.USER,
                `${this.userId}#${this.viewId}`
            );
            const [result] = (await this.persistenceRead.readByAssociation(
                association
            )) as Array<{ data: Array<object> }>;
            return result;
        } catch (error) {
            console.log(error);
        }
    }

    public async updateInteractionActionId(
        records: Array<object>
    ): Promise<void> {
        const association = new RocketChatAssociationRecord(
            RocketChatAssociationModel.USER,
            `${this.userId}#${this.viewId}`
        );

        await this.persistence.updateByAssociations(
            [association],
            { data: records },
            true
        );
    }

    public async clearAllInteractionActionId() {
        try {
            const association = new RocketChatAssociationRecord(RocketChatAssociationModel.USER, `${this.userId}#${this.viewId}`);
            await this.persistence.removeByAssociation(association)
        } catch (error) {
            console.log(error);
        }
    }
}
