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

export async function AddQuestionModal({
    read,
    modify,
    http,
    persis,
    id,
}: {
    read: IRead;
    modify: IModify;
    http: IHttp;
    persis: IPersistence;
    id: string;
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
                blockId: "",
                actionId: "",
                placeholder: {
                    type: TextTypes.PLAIN_TEXT,
                    text: "Untitled Question",
                },
            },
        },
        {
            type: "input",
            label: {
                type: TextTypes.PLAIN_TEXT,
                text: "Type of Question",
            },
            element: {
                type: "static_select",
                appId: id,
                blockId: "",
                actionId: "",
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
        },
    );

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
