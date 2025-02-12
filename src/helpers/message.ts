import { IModify, IRead } from "@rocket.chat/apps-engine/definition/accessors";
import { IRoom } from "@rocket.chat/apps-engine/definition/rooms";
import { IUser } from "@rocket.chat/apps-engine/definition/users";

export async function sendNotification(
    read: IRead,
    modify: IModify,
    sender: IUser,
    room: IRoom,
    message: any,
) {
    const user = (await read.getUserReader().getAppUser()) as IUser;
    const messageBuilder = modify
        .getCreator()
        .startMessage()
        .setSender(user)
        .setRoom(room)
        .setGroupable(false)
        .setText(message);

    return read.getNotifier().notifyUser(sender, messageBuilder.getMessage());
}
