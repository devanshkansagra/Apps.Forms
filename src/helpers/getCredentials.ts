import { IModify, IRead } from "@rocket.chat/apps-engine/definition/accessors";
import { IRoom } from "@rocket.chat/apps-engine/definition/rooms";
import { IUser } from "@rocket.chat/apps-engine/definition/users";
import { OAuthSetting } from "../enums/OAuthSettingEnum";

export async function getCredentials(
    read: IRead,
    modify: IModify,
    user: IUser,
    room: IRoom,
) {
    const clientId = (await read
        .getEnvironmentReader()
        .getSettings()
        .getValueById('client-id'))

    const APIKey = (await read
        .getEnvironmentReader()
        .getSettings()
        .getValueById('api-key'))


    return { clientId, APIKey };
}
