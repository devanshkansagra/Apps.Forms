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

export async function CreateFormModal({
    read,
    modify,
    http,
    persis,
    triggerId,
    threadId,
    id,
    questionElement,
}: {
    read: IRead;
    modify: IModify;
    http: IHttp;
    persis: IPersistence;
    triggerId: string | undefined;
    threadId: string | undefined;
    id: string;
    questionElement?: any,
}): Promise<IUIKitSurfaceViewParam> {
    const blocks: LayoutBlock[] = [];

    blocks.push(
        {
            type: "input",
            label: {
                type: TextTypes.PLAIN_TEXT,
                text: "Form Title",
            },
            element: {
                type: "plain_text_input",
                placeholder: {
                    type: TextTypes.PLAIN_TEXT,
                    text: "Untitled",
                },
                appId: id,
                blockId: ElementEnum.FORM_TITLE_BLOCK,
                actionId: ElementEnum.FORM_TITLE_ACTION,
            },
        },
        {
            type: "input",
            label: {
                type: TextTypes.PLAIN_TEXT,
                text: "Description",
            },
            element: {
                type: "plain_text_input",
                placeholder: {
                    type: TextTypes.PLAIN_TEXT,
                    text: "Form Description",
                },
                appId: id,
                blockId: ElementEnum.FORM_DESCRIPTION_BLOCK,
                actionId: ElementEnum.FORM_DESCRIPTION_ACTION,
                multiline: true,
            },
        },
    );

    if(questionElement) {
        blocks.push(...questionElement);
    }

    blocks.push({
        type: 'section',
        accessory: {
            type: 'button',
            text: {
                type: TextTypes.PLAIN_TEXT,
                text: "Add Question",
            },
            blockId: ElementEnum.ADD_QUESTION_BLOCK,
            actionId: ElementEnum.ADD_Question_ACTION,
            appId: id,
        }
    })

    blocks.push({
        type: 'divider',
    })

    return {
        type: UIKitSurfaceType.MODAL,
        id: ModalEnum.CREATE_FORM_VIEW,
        title: {
            type: TextTypes.PLAIN_TEXT,
            text: ModalEnum.CREATE_FORM_TITLE,
        },
        blocks: blocks,
        submit: {
            type: "button",
            text: {
                type: TextTypes.PLAIN_TEXT,
                text: "Create",
            },
            blockId: "",
            actionId: "",
            appId: id,
        },
    };
}
