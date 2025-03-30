import {
    IHttp,
    IModify,
    IPersistence,
    IRead,
    IUIKitSurfaceViewParam,
} from "@rocket.chat/apps-engine/definition/accessors";
import { UIKitSurfaceType } from "@rocket.chat/apps-engine/definition/uikit";
import { LayoutBlock } from "@rocket.chat/ui-kit";
import { TextTypes } from "../enums/TextTypes";
import { ModalEnum } from "../enums/ModalEnum";
import { ElementEnum } from "../enums/ElementEnum";
import { QuestionPersistence } from "../persistence/questionPersistence";

export async function ChannelModal({
    read,
    modify,
    http,
    persis,
    triggerId,
    threadId,
    id,
}: {
    read: IRead;
    modify: IModify;
    http: IHttp;
    persis: IPersistence;
    triggerId: string | undefined;
    threadId: string | undefined;
    id: string;
}): Promise<IUIKitSurfaceViewParam> {
    let blocks: LayoutBlock[] = [];
    blocks.push({
        type: "input",
        label: {
            type: "plain_text",
            text: "Select Channel to share",
        },
        element: {
            type: 'multi_channels_select',
            actionId: "usersActionId",
            appId: id,
            blockId: "usersBlockId",
        },
    });

    return {
        type: UIKitSurfaceType.MODAL,
        id: ModalEnum.CREATE_FORM_VIEW,
        title: {
            type: TextTypes.PLAIN_TEXT,
            text: "Select Channel To Share",
        },
        blocks: blocks,
        submit: {
            type: "button",
            text: {
                type: TextTypes.PLAIN_TEXT,
                text: "Share",
            },
            blockId: "",
            actionId: "",
            appId: id,
        },
    };
}
