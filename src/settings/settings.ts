import {
    ISetting,
    SettingType,
} from "@rocket.chat/apps-engine/definition/settings";
import { OAuthSetting } from "../enums/OAuthSettingEnum";

export const settings: ISetting[] = [
    {
        id: 'api-key',
        type: SettingType.STRING,
        packageValue: "",
        required: true,
        public: false,
        section: "CredentialSettings",
        i18nLabel: "API Key",
        i18nPlaceholder: "API Key",
        hidden: false,
        multiline: false,
    },
    {
        id: 'client-id',
        type: SettingType.STRING,
        packageValue: "",
        required: true,
        public: false,
        section: "CredentialSettings",
        i18nLabel: "Client ID",
        i18nPlaceholder: "Client ID",
        hidden: false,
        multiline: false,
    },
];
