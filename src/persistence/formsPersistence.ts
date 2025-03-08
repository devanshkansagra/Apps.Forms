import {
    IPersistence,
    IPersistenceRead,
} from "@rocket.chat/apps-engine/definition/accessors";
import {
    RocketChatAssociationModel,
    RocketChatAssociationRecord,
} from "@rocket.chat/apps-engine/definition/metadata";
import { IRoom } from "@rocket.chat/apps-engine/definition/rooms";
import { IUser } from "@rocket.chat/apps-engine/definition/users";

export class FormsPersistence {
    constructor(
        private readonly persistence: IPersistence,
        private readonly persistenceRead: IPersistenceRead,
    ) {}

    public async storeFormData(room: IRoom, formData: object[], user: IUser) {
        try {
            const associations: Array<RocketChatAssociationRecord> = [
                new RocketChatAssociationRecord(
                    RocketChatAssociationModel.MISC,
                    `formData`,
                ),
                new RocketChatAssociationRecord(
                    RocketChatAssociationModel.USER,
                    `${user.id}`,
                ),
            ];

            await this.persistence.updateByAssociations(
                associations,
                formData,
                true,
            );
        } catch (error) {
            console.log(error);
        }
    }

    public async getFormData(room: IRoom, user: IUser): Promise<any> {
        try {
            const associations: Array<RocketChatAssociationRecord> = [
                new RocketChatAssociationRecord(
                    RocketChatAssociationModel.MISC,
                    `formData`,
                ),
                new RocketChatAssociationRecord(
                    RocketChatAssociationModel.USER,
                    `${user.id}`,
                ),
            ];

            let data = (await this.persistenceRead.readByAssociations(
                associations,
            )) as Array<object>;
            return data.length > 0 ? data[0] : [];
        } catch (error) {
            console.log(error);
        }
    }

    public async clearFormData(room: IRoom, user: IUser): Promise<void> {
        try {
            const associations: Array<RocketChatAssociationRecord> = [
                new RocketChatAssociationRecord(
                    RocketChatAssociationModel.MISC,
                    `formData`,
                ),
                new RocketChatAssociationRecord(
                    RocketChatAssociationModel.USER,
                    `${user.id}`,
                ),
            ];

            await this.persistence.removeByAssociations(associations);
        } catch (error) {
            console.log("Error in clear form field: " + error);
        }
    }
}
