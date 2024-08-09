export declare class UserObj {
    _id: string;
    id: string;
    email: string;
    username: string;
    firstName: string;
    lastName: string;
    image: string | null;
    customUserData: {
        [x: string]: any;
    };
    /** eg:
     * ```ts
     * [
     *      { id: "123456789...", peerType: "oauth2-google" },
     *      { id: "123456789...", peerType: "myalyce" },
     * ]
     * ``` */
    identities: {
        id: string;
        peerType: string;
    }[];
    constructor(p?: Partial<UserObj>);
}
export declare const UserObjKeys: (keyof UserObj)[];
