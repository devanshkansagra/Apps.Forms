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

export async function AddQuestionModal({
    read,
    modify,
    http,
    persis,
    id,
    optionBlock,
}: {
    read: IRead;
    modify: IModify;
    http: IHttp;
    persis: IPersistence;
    id: string;
    optionBlock?: any;
}): Promise<IUIKitSurfaceViewParam> {
    const blocks: LayoutBlock[] = [];

    blocks.push(
        {
            type: "input",
            label: {
                type: TextTypes.PLAIN_TEXT,
                text: "Question Title",
            },
            element: {
                type: "plain_text_input",
                appId: id,
                blockId: ElementEnum.QUESTION_TITLE_BLOCK,
                actionId: ElementEnum.QUESTION_TITLE_ACTION,
                placeholder: {
                    type: TextTypes.PLAIN_TEXT,
                    text: "Untitled Question",
                },
            },
        },
        {
            type: "actions",
            elements: [
                {
                    type: "static_select",
                    appId: id,
                    blockId: ElementEnum.QUESTION_TYPE_BLOCK,
                    actionId: ElementEnum.QUESTION_TYPE_ACTION,
                    options: [
                        {
                            value: "Short Answer",
                            text: {
                                type: "plain_text",
                                text: "Short Answer",
                            },
                        },
                        {
                            value: "Paragraph",
                            text: {
                                type: "plain_text",
                                text: "Paragraph",
                            },
                        },
                        {
                            value: "Multiple Choice",
                            text: {
                                type: "plain_text",
                                text: "Multiple Choice",
                            },
                        },
                    ],
                    placeholder: {
                        type: TextTypes.PLAIN_TEXT,
                        text: "Select the type of Question",
                    },
                },
            ],
        },
    );

    if(optionBlock) {
        blocks.push(optionBlock);
    }


    return {
        type: UIKitSurfaceType.MODAL,
        id: ModalEnum.ADD_QUESTION_VIEW,
        title: {
            type: TextTypes.PLAIN_TEXT,
            text: ModalEnum.ADD_QUESTION_TITLE,
        },
        blocks: blocks,
        submit: {
            type: "button",
            text: {
                type: TextTypes.PLAIN_TEXT,
                text: "Add Question",
            },
            blockId: "",
            actionId: "",
            appId: id,
        },
    };
}
