export enum OAuthSetting {
    API_KEY = "google-cloud-api-key",
    CLIENT_ID = "google-forms-client-id",
    CLIENT_SECRET = "google-forms-secret",
}

export enum OAuthURL {
    ACCESSS_TOKEN_URI = "https://oauth2.googleapis.com/token",
    AUTH_URI = "https://accounts.google.com/o/oauth2/auth",
    REFRESH_TOKEN_URI = "https://oauth2.googleapis.com/token",
    REVOKE_TOKEN_URI = "https://oauth2.googleapis.com/revoke",
    REDIRECT_URL = "http://localhost:3000/api/apps/public/d6588a9f-0f27-4e6e-8975-e6cc380f0cab/google-cloud-callback"
}
