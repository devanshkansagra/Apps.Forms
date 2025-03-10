import {
    IAuthData,
    IOAuth2Client,
} from "@rocket.chat/apps-engine/definition/oauth2/IOAuth2";
import { createOAuth2Client } from "@rocket.chat/apps-engine/definition/oauth2/OAuth2";
import {
    IConfigurationExtend,
    IPersistence,
    IRead,
    IHttp,
    IModify,
} from "@rocket.chat/apps-engine/definition/accessors";
import { IUser } from "@rocket.chat/apps-engine/definition/users";
import {
    RocketChatAssociationRecord,
    RocketChatAssociationModel,
} from "@rocket.chat/apps-engine/definition/metadata";
import { getCredentials } from "../helpers/getCredentials";
import { IRoom } from "@rocket.chat/apps-engine/definition/rooms";

export class OAuth2Service {
    private oauthClient: IOAuth2Client;

    constructor(
        private app: any,
        private config: any,
    ) {
        this.oauthClient = createOAuth2Client(this.app, this.config);
    }

    public async setup(configuration: IConfigurationExtend): Promise<void> {
        try {
            await this.oauthClient.setup(configuration);
        } catch (error) {
            this.app.getLogger().error("[OAuth2Service] setup error", error);
        }
    }

    public async getUserAuthorizationUrl(user: IUser): Promise<string> {
        const url = await this.oauthClient.getUserAuthorizationUrl(user);
        return url.toString();
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
    public async refreshUserAccessToken(
        user: IUser,
        persis: IPersistence,
    ): Promise<IAuthData> {
        return (await this.oauthClient.refreshUserAccessToken(
            user,
            persis,
        )) as IAuthData;
    }

    public async revokeUserAccessToken(
        user: IUser,
        persis: IPersistence,
    ): Promise<void> {
        await this.oauthClient.revokeUserAccessToken(user, persis);
    }
}
