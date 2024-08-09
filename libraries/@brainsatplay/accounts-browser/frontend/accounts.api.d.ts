import * as Realm from "realm-web";
import { UserObj } from "../common/models/user.model";
import { AccountInfoType } from "./general.types";
import { ApiType } from "./_abstract.api";
export declare class AccountsAPI {
    app: Realm.App;
    api: ApiType;
    user: UserObj | null;
    constructor(appName: string, options?: {
        serverURI: string;
    });
    create: (auth: AccountInfoType) => Promise<void>;
    reconfirm: (auth: AccountInfoType) => Promise<void>;
    getGoogleCredentials: () => Promise<Realm.Credentials<globalThis.Realm.Credentials.OAuth2RedirectPayload | globalThis.Realm.Credentials.GooglePayload>>;
    getCredentials: (auth: {
        email: string;
        password: string;
    }) => Promise<Realm.Credentials<{
        [x: string]: unknown;
    }>>;
    login: (creds?: Realm.Credentials<{
        [x: string]: unknown;
    }> | undefined) => Promise<any>;
    logout: () => Promise<{
        type: "FAIL";
        data: {
            err: Error;
        };
    } | {
        type: "LOGOUT";
        data?: undefined;
    }>;
    confirmFromURL: () => Promise<void>;
    resetPassword: (auth: AccountInfoType) => Promise<any>;
    confirmUserFromURL: (url?: URL) => Promise<boolean>;
    completePasswordReset: (password: string) => Promise<any>;
    delete: () => Promise<unknown>;
    updateCustomUserData: (update: object) => Promise<void>;
    set: (key: string, val: any) => Promise<void>;
    updateUser: (update: Partial<UserObj>) => Promise<unknown>;
    private getUser;
}
