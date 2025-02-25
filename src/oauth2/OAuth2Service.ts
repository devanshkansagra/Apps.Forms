import { IOAuth2Client } from "@rocket.chat/apps-engine/definition/oauth2/IOAuth2";
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
    ): Promise<void> {
        await this.oauthClient.refreshUserAccessToken(user, persis);
    }

    public async revokeUserAccessToken(
        user: IUser,
        persis: IPersistence,
    ): Promise<void> {
        await this.oauthClient.revokeUserAccessToken(user, persis);
    }

    public async handleOAuthCallback(
        read: IRead,
        code: string,
        http: IHttp,
        persis: IPersistence,
    ): Promise<void> {
        try {
            const { clientId, clientSecret } = await getCredentials(read)
            const response = await http.post(this.config.accessTokenUri, {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                data: `code=${code}&client_id=${clientId}&redirect_uri=${this.config.redirectUri}&&response_type=code&scope=email`,
            });

            if (response.statusCode === 200 && response.data) {
                const tokenData = response.data;
                console.log(tokenData);
            } else {
                this.app
                    .getLogger()
                    .error(`Failed to get access token: ${response.content}`);
            }
        } catch (error) {
            console.log(error);
        }
    }
}
