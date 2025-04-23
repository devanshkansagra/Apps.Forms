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
import { AuthPersistence } from "../persistence/authPersistence";
import { SurveysApp } from "../../SurveysApp";
import { IUser } from "@rocket.chat/apps-engine/definition/users";
import { sendNotification } from "../helpers/message";
import { IRoom } from "@rocket.chat/apps-engine/definition/rooms";
import { ModalPersistence } from "../persistence/ModalPersistence";
import { OtherEnum } from "../enums/OtherEnums";

export async function CreateFormModal({
    app,
    read,
    modify,
    http,
    sender,
    room,
    persis,
    triggerId,
    threadId,
    modalPersistence,
    id,
}: {
    app: SurveysApp;
    read: IRead;
    modify: IModify;
    http: IHttp;
    sender: IUser;
    room: IRoom | undefined;
    persis: IPersistence;
    triggerId: string | undefined;
    threadId: string | undefined;
    modalPersistence?: ModalPersistence;
    id: string;
}): Promise<IUIKitSurfaceViewParam> {
    let blocks: LayoutBlock[] = [];
    const authPersistence = new AuthPersistence(app);
    const token = await authPersistence.getAccessTokenForUser(sender, read);

    if (!token) {
        await sendNotification(
            read,
            modify,
            sender,
            room as IRoom,
            "You are not logged in"
        );
        return {} as IUIKitSurfaceViewParam;
    }
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
        }
    );

    const records = modalPersistence ? await modalPersistence.getAllInteractionActionId() : null;
    if (records) {
        records.data.forEach((record, index) => {
            let block: LayoutBlock;
            block = {
                type: "input",
                label: {
                    type: "plain_text",
                    text: "Add new Question",
                },
                element: {
                    type: "plain_text_input",
                    actionId: record?.[ElementEnum.QUESTION_NAME],
                    blockId: ElementEnum.QUESTION_TITLE_BLOCK,
                    appId: id,
                    placeholder: {
                        type: "plain_text",
                        text: "Untitled Question",
                    },
                },
            };

            blocks.push(block);

            block = {
                type: "actions",
                elements: [
                    {
                        type: "static_select",
                        actionId: record?.[ElementEnum.QUESTION_TYPE],
                        options: [
                            {
                                value: "TEXT",
                                text: {
                                    type: "plain_text",
                                    text: "Short Answer",
                                    emoji: true,
                                },
                            },
                            {
                                value: "PARAGRAPH",
                                text: {
                                    type: "plain_text",
                                    text: "Paragraph",
                                    emoji: true,
                                },
                            },
                            {
                                value: "RADIO",
                                text: {
                                    type: "plain_text",
                                    text: "Radio",
                                    emoji: true,
                                },
                            },
                            {
                                value: "CHECKBOX",
                                text: {
                                    type: "plain_text",
                                    text: "Checkbox",
                                    emoji: true,
                                },
                            },
                        ],
                        placeholder: {
                            type: "plain_text",
                            text: "Select type of question",
                        },
                        appId: id,
                        blockId:ElementEnum.QUESTION_TYPE_BLOCK,
                    },
                ],
            };
            blocks.push(block);

            const options = addOptions(record, app);
            blocks.push(...options);
        });
    }

    blocks.push({
        type: "actions",
        elements: [
            {
                type: "button",
                text: {
                    type: TextTypes.PLAIN_TEXT,
                    text: "Add Question",
                },
                blockId: ElementEnum.ADD_QUESTION_BLOCK,
                actionId: ElementEnum.ADD_QUESTION_ACTION,
                appId: id,
            },
        ],
    });

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
        clearOnClose: true,
        close: {
            type: "button",
            text: {
                type: TextTypes.PLAIN_TEXT,
                text: "Close",
            },
            blockId: "",
            actionId: "",
            appId: id,
        },
    };
}



function addOptions(record: object, app: SurveysApp) {
    const config = record?.[OtherEnum.ADDITIONAL_CONFIG];
    const blocks: LayoutBlock[] = [];

    if(config) {
        const options = config?.[OtherEnum.OPTIONS];
        options.forEach((option) => {
            const actionId = option?.[ElementEnum.INPUT_FIELD];
            let inputElement: LayoutBlock = {
                type: 'input',
                label: {
                    text: '',
                    type: 'plain_text',
                },
                element: {
                    type: 'plain_text_input',
                    blockId: ElementEnum.QUESTION_TITLE_BLOCK,
                    actionId: actionId,
                    appId: app.getID(),
                    placeholder: {
                        type: 'plain_text',
                        text: "Untitled Option",
                    }
                }
            }
            blocks.push(inputElement)
        })

        let optionButton: LayoutBlock = {
            type: 'section',
            accessory: {
                type: 'button',
                actionId: ElementEnum.ADD_OPTION_ACTION,
                blockId: ElementEnum.ADD_OPTION_BLOCK,
                appId: app.getID(),
                text: {
                    type: 'plain_text',
                    text: "Add Option",
                },
                value: record?.[ElementEnum.QUESTION_TYPE],
            }
        }

        blocks.push(optionButton);
    }
    return blocks;
}