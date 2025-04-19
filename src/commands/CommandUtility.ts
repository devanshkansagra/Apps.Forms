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
import {
    createForm,
    deleteForms,
    getForms,
    subscribe,
    aiCreate,
} from "../handlers/FormHandler";
import { handleLogin, logout } from "../handlers/AuthorizationHandler";

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
        this.persis = props.persis;
        this.modify = props.modify;
        this.http = props.http;
        this.triggerId = props.triggerId;
        this.threadId = props.threadId;
    }

    public async resolveCommand(): Promise<void> {
        const [subCommand, ...rest] = this.params;
        let prompt = "";

        if (this.params.length > 0) {
            switch (subCommand.toLowerCase()) {
                case CommandEnum.CREATE: {
                    if (rest.length !== 0) {
                        prompt = this.params.join(" ");
                        await aiCreate(
                            this.app,
                            this.read,
                            this.modify,
                            this.sender,
                            this.room,
                            this.persis,
                            prompt,
                        );
                    } else {
                        await createForm(
                            this.app,
                            this.read,
                            this.modify,
                            this.sender,
                            this.room,
                            this.http,
                            this.persis,
                            this.triggerId,
                            this.threadId,
                        );
                    }
                    break;
                }
                case CommandEnum.LOGIN: {
                    await handleLogin(
                        this.app,
                        this.read,
                        this.modify,
                        this.sender,
                        this.room,
                        this.persis,
                    );
                    break;
                }

                case CommandEnum.LIST: {
                    await getForms(
                        this.app,
                        this.read,
                        this.modify,
                        this.sender,
                        this.room,
                        this.persis,
                        this.triggerId as string,
                        this.threadId,
                    );
                    break;
                }
                case CommandEnum.SUBSCRIBE: {
                    await subscribe(
                        this.app,
                        this.read,
                        this.modify,
                        this.sender,
                        this.room,
                        this.persis,
                        this.triggerId as string,
                        this.threadId,
                    );
                    break;
                }
                case CommandEnum.CLEAR: {
                    await deleteForms(
                        this.app,
                        this.read,
                        this.modify,
                        this.sender,
                        this.room,
                        this.persis,
                    );
                    break;
                }
                case CommandEnum.LOGOUT: {
                    await logout(
                        this.app,
                        this.read,
                        this.modify,
                        this.sender,
                        this.room,
                        this.persis,
                    )
                    break;
                }

                default: {
                    prompt = this.params.join(" ");
                    await aiCreate(
                        this.app,
                        this.read,
                        this.modify,
                        this.sender,
                        this.room,
                        this.persis,
                        prompt,
                    );
                    break;
                }
            }
        } else {
            console.log("No command provided");
        }
    }
}
