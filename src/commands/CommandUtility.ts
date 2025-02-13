import { IUser } from "@rocket.chat/apps-engine/definition/users";
import { SurveysApp } from "../../SurveysApp";
import {
    ICommandUtility,
    ICommandUtilityParams,
} from "../definitions/ICommandUtility";
import { IRoom } from "@rocket.chat/apps-engine/definition/rooms";
import {
    IHttp,
    IModify,
    IPersistence,
    IRead,
} from "@rocket.chat/apps-engine/definition/accessors";
import { sendNotification } from "../helpers/message";
import { CommandEnum } from "../enums/CommandEnum";
import { createForm } from "../handlers/CreateFormHandler";

export class CommandUtility implements ICommandUtility {
    app: SurveysApp;
    params: Array<string>;
    sender: IUser;
    room: IRoom;
    read: IRead;
    modify: IModify;
    http: IHttp;
    persis: IPersistence;
    triggerId?: string;
    threadId?: string;

    constructor(props: ICommandUtilityParams) {
        this.app = props.app;
        this.params = props.params;
        this.sender = props.sender;
        this.room = props.room;
        this.read = props.read;
        this.modify = props.modify;
        this.http = props.http;
        this.triggerId = props.triggerId;
        this.threadId = props.threadId;
    }

    public async resolveCommand(): Promise<void> {
        if (this.params.length > 0) {
            switch (this.params[0]) {
                case CommandEnum.CREATE: {
                    await createForm(
                        this.app,
                        this.read,
                        this.modify,
                        this.sender,
                        this.http,
                        this.persis,
                        this.triggerId,
                        this.threadId,
                    );
                    break;
                }
                default: {
                    console.log("Unknown command: " + this.params[0]);
                }
            }
        } else {
            console.log("No command provided");
        }
    }
}
