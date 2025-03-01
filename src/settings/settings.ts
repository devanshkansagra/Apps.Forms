import {
    ISetting,
    SettingType,
} from "@rocket.chat/apps-engine/definition/settings";
import { OAuthSetting } from "../enums/OAuthSettingEnum";

export const settings: ISetting[] = [
    {
        id: 'client-id',
        type: SettingType.STRING,
        packageValue: "",
        required: true,
        public: false,
        section: "CredentialSettings",
        i18nLabel: "Google OAuth Client ID",
        i18nPlaceholder: "Client ID",
        hidden: false,
        multiline: false,
    },
    {
        id: 'client-secret',
        type: SettingType.PASSWORD,
        packageValue: "",
        required: true,
        public: false,
        section: "CredentialSettings",
        i18nLabel: "Google OAuth Client Secret",
        i18nPlaceholder: "Client Secret",
        hidden: false,
        multiline: false,
    },
    {
        id: 'api-key',
        type: SettingType.STRING,
        packageValue: "",
        required: true,
        public: false,
        section: "CredentialSettings",
        i18nLabel: "Google OAuth API Key",
        i18nPlaceholder: "API Key",
        hidden: false,
        multiline: false,
    },
];
