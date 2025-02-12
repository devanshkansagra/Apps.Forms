import {
    ISetting,
    SettingType,
} from "@rocket.chat/apps-engine/definition/settings";
export enum OAuthSetting {
    API_KEY = "google-cloud-api-key",
    CLIENT_ID = "google-forms-client-id",
    CLIENT_SECRET = "google-forms-secret",
}

export const settings: ISetting[] = [
    {
        id: OAuthSetting.API_KEY,
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
        id: OAuthSetting.CLIENT_ID,
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
    {
        id: OAuthSetting.CLIENT_SECRET,
        type: SettingType.PASSWORD,
        packageValue: "",
        required: true,
        public: false,
        section: "CredentialSettings",
        i18nLabel: "Client Secret",
        i18nPlaceholder: "Client Secret",
        hidden: false,
        multiline: false,
    },
];
