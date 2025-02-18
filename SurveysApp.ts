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
    UIKitViewSubmitInteractionContext,
} from "@rocket.chat/apps-engine/definition/uikit";
import { ExecuteViewSubmitHandler } from "./src/handlers/ExecuteViewSubmitHandler";
import { ExecuteBlockActionHandler } from "./src/handlers/ExecuteBlockActionHandler";

export class SurveysApp extends App {
    constructor(info: IAppInfo, logger: ILogger, accessors: IAppAccessors) {
        super(info, logger, accessors);
    }

    public async initialize(
        configurationExtend: IConfigurationExtend,
        environmentRead: IEnvironmentRead,
    ): Promise<void> {
        await configurationExtend.slashCommands.provideSlashCommand(
            new SurveyCommand(this),
        );

        await Promise.all(
            settings.map((setting) => {
                configurationExtend.settings.provideSetting(setting);
            }),
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
}
