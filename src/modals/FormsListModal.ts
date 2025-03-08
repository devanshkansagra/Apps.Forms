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

export async function FormsListModal({
    read,
    modify,
    persis,
    triggerId,
    threadId,
    data,
    id,
}: {
    read: IRead;
    modify: IModify;
    persis: IPersistence;
    triggerId: string | undefined;
    threadId: string | undefined;
    data: any;
    id: string;
}): Promise<IUIKitSurfaceViewParam> {
    let blocks: LayoutBlock[] = [];
    if (!Array.isArray(data) || data.length === 0) {
        blocks.push({
            type: "section",
            text: {
                type: TextTypes.PLAIN_TEXT,
                text: "No data found",
            },
        });
        return {
            id: ModalEnum.FORM_LIST_VIEW,
            type: UIKitSurfaceType.MODAL,
            title: {
                type: TextTypes.PLAIN_TEXT,
                text: ModalEnum.FORM_LIST_TITLE,
            },
            blocks: blocks,
        };
    }
    data.forEach((form, index) => {
        blocks.push({
            type: "section",
            text: {
                type: "mrkdwn",
                text: "### " + form.info.title
            },
            accessory: {
                type: 'button',
                blockId: "",
                actionId: "",
                appId: id,
                text: {
                    type: "plain_text",
                    text: 'See responses on google',
                },
                url: `https://docs.google.com/forms/d/${form.formId}/edit#responses`
            }
        });
        blocks.push({ type: 'divider' });
    });
    return {
        id: ModalEnum.FORM_LIST_VIEW,
        type: UIKitSurfaceType.MODAL,
        title: {
            type: TextTypes.PLAIN_TEXT,
            text: ModalEnum.FORM_LIST_TITLE,
        },
        blocks: blocks,
    };
}
