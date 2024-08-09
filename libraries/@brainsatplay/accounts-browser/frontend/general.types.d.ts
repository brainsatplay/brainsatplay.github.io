import { AnyObj } from "@giveback007/util-lib";
export declare type DefaultUserProfileData = {
    name?: string;
    email?: string;
    pictureUrl?: string;
    firstName?: string;
    lastName?: string;
    sex?: string;
    birthday?: string;
    minAge?: string;
    maxAge?: string;
};
export declare type PeerType = "anon-user" | "api-key" | "local-userpass" | "custom-function" | "custom-token" | "oauth2-google" | "oauth2-facebook" | "oauth2-apple";
export declare type RealmUser = {
    id: string;
    accessToken: string | null;
    refreshToken: string | null;
    /** Check if this is correct: */
    profile: DefaultUserProfileData;
    identities: {
        id: string;
        peerType: PeerType;
    }[];
    state: "active" | "logged-out" | "removed";
    customData: AnyObj;
};
export declare type AccountInfoType = Realm.Auth.RegisterUserDetails;
export declare type AccountConfirmationType = {
    token: string;
    tokenId: string;
};
