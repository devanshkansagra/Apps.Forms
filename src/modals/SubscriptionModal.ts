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

export async function SubscriptionModal({
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
            id: ModalEnum.SUBSCRIPTION_LIST_VIEW,
            type: UIKitSurfaceType.MODAL,
            title: {
                type: TextTypes.PLAIN_TEXT,
                text: ModalEnum.SUBSCRIPTION_LIST_TITLE,
            },
            blocks: blocks,
        };
    }
    data.forEach((form, index) => {
        blocks.push({
            type: "section",
            text: {
                type: "mrkdwn",
                text: "### " + form.info.title,
            },
            accessory: {
                type: "button",
                blockId: form.formId,
                actionId: ElementEnum.SUBSCRIPTION_ACTION,
                appId: id,
                text: {
                    type: "plain_text",
                    text: "Subscribe",
                },
            },
        });
        blocks.push({ type: "divider" });
    });
    return {
        id: ModalEnum.SUBSCRIPTION_LIST_VIEW,
        type: UIKitSurfaceType.MODAL,
        title: {
            type: TextTypes.PLAIN_TEXT,
            text: ModalEnum.SUBSCRIPTION_LIST_TITLE,
        },
        blocks: blocks,
    };
}