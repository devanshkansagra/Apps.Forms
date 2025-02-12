import {
    IAppAccessors,
    IConfigurationExtend,
    IEnvironmentRead,
    ILogger,
} from "@rocket.chat/apps-engine/definition/accessors";
import { App } from "@rocket.chat/apps-engine/definition/App";
import { IAppInfo } from "@rocket.chat/apps-engine/definition/metadata";
import { SurveyCommand } from "./src/commands/SurveyCommand";
import { settings } from "./src/settings/settings";

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
}
