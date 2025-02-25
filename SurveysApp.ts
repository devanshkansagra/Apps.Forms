import {
    IAppAccessors,
    IConfigurationExtend,
    IEnvironmentRead,
    IHttp,
    ILogger,
    IModify,
    IPersistence,
    IRead,
} from "@rocket.chat/apps-engine/definition/accessors";
import { App } from "@rocket.chat/apps-engine/definition/App";
import { IAppInfo } from "@rocket.chat/apps-engine/definition/metadata";
import { SurveyCommand } from "./src/commands/SurveyCommand";
import { settings } from "./src/settings/settings";
import {
    IUIKitResponse,
    UIKitBlockInteractionContext,
    UIKitViewCloseInteractionContext,
    UIKitViewSubmitInteractionContext,
} from "@rocket.chat/apps-engine/definition/uikit";
import { IOAuth2Client } from "@rocket.chat/apps-engine/definition/oauth2/IOAuth2";
import { ExecuteViewSubmitHandler } from "./src/handlers/ExecuteViewSubmitHandler";
import { ExecuteBlockActionHandler } from "./src/handlers/ExecuteBlockActionHandler";
import { ExecuteViewClosedHandler } from "./src/handlers/ExecuteViewClosedHandler";
import {
    ApiSecurity,
    ApiVisibility,
} from "@rocket.chat/apps-engine/definition/api";
import { WebhookEndpoint } from "./src/endpoints/webhook";
import { OAuth2Service } from "./src/oauth2/OAuth2Service";
import { OAuthURL } from "./src/enums/OAuthSettingEnum";
import { SDK } from "./src/lib/SDK";

export class SurveysApp extends App {
    constructor(info: IAppInfo, logger: ILogger, accessors: IAppAccessors) {
        super(info, logger, accessors);
    }

    public oAuth2ClientInstance: OAuth2Service;
    public sdk: SDK;
    public oAuth2Config = {
        alias: "google-cloud",
        accessTokenUri: OAuthURL.ACCESSS_TOKEN_URI,
        authUri: OAuthURL.AUTH_URI,
        refreshTokenUri: OAuthURL.REFRESH_TOKEN_URI,
        revokeTokenUri: OAuthURL.REVOKE_TOKEN_URI,
        defaultScopes: ["email"],
    };
    public async initialize(
        configurationExtend: IConfigurationExtend,
        environmentRead: IEnvironmentRead,
    ): Promise<void> {

        this.oAuth2ClientInstance = new OAuth2Service(this, this.oAuth2Config);
        await configurationExtend.slashCommands.provideSlashCommand(
            new SurveyCommand(this),
        );

        await Promise.all(
            settings.map((setting) => {
                configurationExtend.settings.provideSetting(setting);
            }),
        );

        await configurationExtend.api.provideApi({
            visibility: ApiVisibility.PUBLIC,
            security: ApiSecurity.UNSECURE,
            endpoints: [new WebhookEndpoint(this)],
        });
    }

    public async extendConfiguration(configuration: IConfigurationExtend, environmentRead: IEnvironmentRead): Promise<void> {
        await this.oAuth2ClientInstance.setup(configuration);
        this.sdk = new SDK(this.getAccessors().http);
    }

    public async executeViewSubmitHandler(
        context: UIKitViewSubmitInteractionContext,
        read: IRead,
        http: IHttp,
        persistence: IPersistence,
        modify: IModify,
    ): Promise<void | IUIKitResponse> {
        const handler = new ExecuteViewSubmitHandler(
            this,
            context,
            read,
            http,
            persistence,
            modify,
        );

        return await handler.execute();
    }

    public async executeBlockActionHandler(
        context: UIKitBlockInteractionContext,
        read: IRead,
        http: IHttp,
        persistence: IPersistence,
        modify: IModify,
    ): Promise<IUIKitResponse> {
        const handler = new ExecuteBlockActionHandler(
            this,
            context,
            read,
            http,
            persistence,
            modify,
        );

        return await handler.execute();
    }

    public async executeViewClosedHandler(
        read: IRead,
        http: IHttp,
        persistence: IPersistence,
        modify: IModify,
        context: UIKitViewCloseInteractionContext,
    ): Promise<IUIKitResponse> {
        const handler = new ExecuteViewClosedHandler(
            this,
            read,
            http,
            persistence,
            modify,
            context,
        );

        return await handler.execute();
    }
}
