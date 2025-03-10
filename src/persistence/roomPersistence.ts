import {
    IPersistence,
    IPersistenceRead,
} from "@rocket.chat/apps-engine/definition/accessors";
import {
    RocketChatAssociationModel,
    RocketChatAssociationRecord,
} from "@rocket.chat/apps-engine/definition/metadata";
import { IUser } from "@rocket.chat/apps-engine/definition/users";

export class RoomPersistence {
    constructor(
        private readonly persis: IPersistence,
        private readonly persistenceRead: IPersistenceRead,
    ) {}

    public async storeRoomUserData(user: IUser, persis: IPersistence) {
        try {
            const association = new RocketChatAssociationRecord(
                RocketChatAssociationModel.USER,
                `${user.id}#RoomId`,
            );

            await this.persis.updateByAssociation(association, { user }, true);
        } catch (error) {
            console.log(error);
        }
    }

    public async getRoomUserData() {}
}
