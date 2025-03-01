import {
    IModify,
    IPersistence,
    IRead,
} from "@rocket.chat/apps-engine/definition/accessors";
import { SurveysApp } from "../../SurveysApp";
import { IUser } from "@rocket.chat/apps-engine/definition/users";
import { IRoom } from "@rocket.chat/apps-engine/definition/rooms";
import { OAuth2Service } from "./OAuth2Service";
import { LayoutBlock } from "@rocket.chat/ui-kit";
import { ElementEnum } from "../enums/ElementEnum";
import { sendNotification } from "../helpers/message";
import { TextTypes } from "../enums/TextTypes";
import { getAuthorizationURL } from "../helpers/getAuthorizationURL";

export async function authorize(
    app: SurveysApp,
    read: IRead,
    modify: IModify,
    user: IUser,
    room: IRoom,
    persistence: IPersistence,
) {
    try {
        const url = await getAuthorizationURL(read, user);
        const blocks: LayoutBlock[] = [
            {
                type: "section",
                text: {
                    type: TextTypes.PLAIN_TEXT,
                    text: "Click 👇 to Login with Google",
                    emoji: true,
                },
            },
            {
                type: "actions",
                elements: [
                    {
                        type: "button",
                        actionId: ElementEnum.LOGIN_BUTTON_ACTION,
                        appId: app.getID(),
                        blockId: ElementEnum.LOGIN_BUTTON_BLOCK,
                        text: {
                            type: "plain_text",
                            text: "Login with Google",
                            emoji: true,
                        },
                        style: "primary",
                        url: url as any,
                    },
                ],
            },
        ];
        await sendNotification(
            read,
            modify,
            user,
            room,
            "Login with Google",
            blocks,
        );
    } catch (error: any) {
        console.log(error);
    }
}
