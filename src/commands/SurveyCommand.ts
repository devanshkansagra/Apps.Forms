import {
    ISlashCommand,
    SlashCommandContext,
} from "@rocket.chat/apps-engine/definition/slashcommands";
import { SurveysApp } from "../../SurveysApp";
import {
    IRead,
    IModify,
    IHttp,
    IPersistence,
} from "@rocket.chat/apps-engine/definition/accessors";
import { IRoom } from "@rocket.chat/apps-engine/definition/rooms";
import { IUser } from "@rocket.chat/apps-engine/definition/users";

export class SurveyCommand implements ISlashCommand {
    constructor(private readonly app: SurveysApp) {}
    public command: string = "survey";
    public i18nParamsExample: string = "";
    public i18nDescription: string = "";
    public providesPreview: boolean = false;

    public async executor(
        context: SlashCommandContext,
        read: IRead,
        modify: IModify,
        http: IHttp,
        persis: IPersistence,
    ): Promise<void> {
        const params = context.getArguments();
        const room = context.getRoom();
        const sender = context.getSender();

    }
}
