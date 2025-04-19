import {
    IModify,
    IPersistence,
    IRead,
} from "@rocket.chat/apps-engine/definition/accessors";
import { SurveysApp } from "../../SurveysApp";
import { authorize } from "../oauth2/auth";
import { IUser } from "@rocket.chat/apps-engine/definition/users";
import { IRoom } from "@rocket.chat/apps-engine/definition/rooms";
import { sendNotification } from "../helpers/message";

export async function handleLogin(
    app: SurveysApp,
    read: IRead,
    modify: IModify,
    user: IUser,
    room: IRoom,
    persistence: IPersistence,
) {
    await authorize(app, read, modify, user, room, persistence);
}

export async function logout(
    app: SurveysApp,
    read: IRead,
    modify: IModify,
    user: IUser,
    room: IRoom,
    persistence: IPersistence,
) {
    await app.sdk.revokeAccessToken(read, modify ,user, room, persistence);
}
