import { IUser } from "@rocket.chat/apps-engine/definition/users";
import { SurveysApp } from "../../SurveysApp";
import {
    IPersistence,
    IRead,
} from "@rocket.chat/apps-engine/definition/accessors";
import {
    RocketChatAssociationModel,
    RocketChatAssociationRecord,
} from "@rocket.chat/apps-engine/definition/metadata";
import { IAuthData } from "@rocket.chat/apps-engine/definition/oauth2/IOAuth2";

export class AuthPersistence {
    constructor(private readonly app: SurveysApp) {}

    public async setAccessTokenForUser(
        token: string,
        user: IUser,
        persis: IPersistence,
    ) {
        try {
            const association = new RocketChatAssociationRecord(
                RocketChatAssociationModel.USER,
                user.id,
            );
            await persis.updateByAssociation(association, {token}, true);
        } catch (error) {
            console.log(error);
        }
    }

    public async getAccessTokenForUser(user: IUser, read: IRead): Promise<any> {
        try {
            const association = new RocketChatAssociationRecord(
                RocketChatAssociationModel.USER,
                user.id,
            );
            const [tokenData] = await read
                .getPersistenceReader()
                .readByAssociation(association);
            if (tokenData) {
                this.app
                    .getLogger()
                    .debug(
                        `Token data retrieved for user ${user.username}:`,
                        tokenData,
                    );
                this.app
                    .getLogger()
                    .info(`Access token retrieved for user: ${user.username}`);
                return tokenData;
            } else {
                this.app
                    .getLogger()
                    .warn(`No access token found for user: ${user.username}`);
                return null;
            }
        } catch (error) {
            this.app
                .getLogger()
                .error(
                    `Failed to get access token for user: ${user.username}`,
                    error,
                );
            throw error;
        }
    }
}
