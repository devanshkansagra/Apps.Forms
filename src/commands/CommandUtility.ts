import { IUser } from "@rocket.chat/apps-engine/definition/users";
import { SurveysApp } from "../../SurveysApp";
import { ICommandUtility, ICommandUtilityParams } from "../definitions/ICommandUtility";
import { IRoom } from "@rocket.chat/apps-engine/definition/rooms";
import { IHttp, IModify, IPersistence, IRead } from "@rocket.chat/apps-engine/definition/accessors";
import { sendNotification } from "../helpers/message";

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
        this.app = props.app,
        this.params = props.params,
        this.sender = props.sender,
        this.room = props.room,
        this.read = props.read,
        this.modify = props.modify,
        this.http = props.http,
        this.triggerId = props.triggerId,
        this.threadId = props.threadId
    }

    public async resolveCommand(): Promise<void> {
        const param = this.params[0];
        switch(param) {
            case "hi" : {
                await sendNotification(this.read, this.modify, this.sender, this.room, 'Hi there');
                break;
            }
        }
    }
}
