import {
    IAppAccessors,
    IAppInstallationContext,
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
import {
    IAuthData,
    IOAuth2Client,
    IOAuth2ClientOptions,
} from "@rocket.chat/apps-engine/definition/oauth2/IOAuth2";
import { ExecuteViewSubmitHandler } from "./src/handlers/ExecuteViewSubmitHandler";
import { ExecuteBlockActionHandler } from "./src/handlers/ExecuteBlockActionHandler";
import { ExecuteViewClosedHandler } from "./src/handlers/ExecuteViewClosedHandler";
import {
    ApiSecurity,
    ApiVisibility,
} from "@rocket.chat/apps-engine/definition/api";
import { WebhookEndpoint } from "./src/endpoints/webhook"
import { OAuthURL } from "./src/enums/OAuthSettingEnum";
import { SDK } from "./src/lib/SDK";
import { IOAuthAppParams } from "@rocket.chat/apps-engine/definition/accessors/IOAuthApp";
import { IRoom } from "@rocket.chat/apps-engine/definition/rooms";
import { IUser } from "@rocket.chat/apps-engine/definition/users";
import { sendMessage, sendNotification } from "./src/helpers/message";
import { PostWebhookEndpoint } from "./src/endpoints/postWebhook";

export class SurveysApp extends App {
    public sdk: SDK;
    constructor(info: IAppInfo, logger: ILogger, accessors: IAppAccessors) {
        super(info, logger, accessors);
    }

    public async initialize(
        configuration: IConfigurationExtend,
        environmentRead: IEnvironmentRead,
    ): Promise<void> {
        await configuration.slashCommands.provideSlashCommand(
            new SurveyCommand(this),
        );

        await Promise.all(
            settings.map((setting) => {
                configuration.settings.provideSetting(setting);
            }),
        );

        await configuration.api.provideApi({
            visibility: ApiVisibility.PUBLIC,
            security: ApiSecurity.UNSECURE,
            endpoints: [new WebhookEndpoint(this)],
        });
        await configuration.api.provideApi({
            visibility: ApiVisibility.PUBLIC,
            security: ApiSecurity.UNSECURE,
            endpoints: [new PostWebhookEndpoint(this)],
        });

        this.sdk = new SDK(this.getAccessors().http, this);
    }

    public async onInstall(
        context: IAppInstallationContext,
        read: IRead,
        http: IHttp,
        persistence: IPersistence,
        modify: IModify,
    ): Promise<void> {
        const room = (await read.getRoomReader().getById("GENERAL")) as IRoom;
        const { user } = context;
        await sendNotification(
            read,
            modify,
            user,
            room,
            "Hello " +
                user.name +
                "! Thank you for installing Smart Google Forms RocketChat app",
        );
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
    ): Promise<IUIKitResponse | void> {
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
        context: UIKitViewCloseInteractionContext,
        read: IRead,
        http: IHttp,
        persistence: IPersistence,
        modify: IModify
    ): Promise<IUIKitResponse> {
        const handler = new ExecuteViewClosedHandler(
            this,
            read,
            http,
            persistence,
            modify,
        );

        return await handler.execute(context);
    }
}
