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

export async function CreateFormModal({
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
    const blocks: LayoutBlock[] = [];

    blocks.push({
        type: 'input',
        label: {
            type: TextTypes.PLAIN_TEXT,
            text: "Title",
        },
        element: {
            type: 'plain_text_input',
            placeholder: {
                type: TextTypes.PLAIN_TEXT,
                text: "Form Title",
            },
            appId: id,
            blockId: '',
            actionId: '',
        }
    })

    return {
        type: UIKitSurfaceType.MODAL,
        title: {
            type: TextTypes.PLAIN_TEXT,
            text: ModalEnum.CREATE_FORM_TITLE,
        },
        blocks: blocks,
        submit: {
            type: 'button',
            text: {
                type: TextTypes.PLAIN_TEXT,
                text: "Create",
            },
            blockId: '',
            actionId: '',
            appId: id,
        },
        close: {
            type: 'button',
            text: {
                type: TextTypes.PLAIN_TEXT,
                text: "Close",
            },
            blockId: '',
            actionId: '',
            appId: id,
        }
    }
};
