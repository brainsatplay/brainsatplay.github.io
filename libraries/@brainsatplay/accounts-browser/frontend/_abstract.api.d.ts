import { AnyObj } from "@giveback007/util-lib";
export declare type ApiType = {
    byId: Function;
    getIds: Function;
    all: Function;
    create: Function;
    patch: Function;
    search: Function;
    delete: Function;
};
export declare const Api: <T extends AnyObj>(route: string, serverURI: string) => {
    byId: (id: string) => Promise<{
        type: "ERROR";
        error: any;
        data?: undefined;
    } | {
        type: "SUCCESS";
        data: T | null;
        error?: undefined;
    }>;
    getIds: (ids: string[]) => Promise<{
        type: "ERROR";
        error: any;
        data?: undefined;
    } | {
        type: "SUCCESS";
        data: {
            found: T[];
            fail: string[];
        };
        error?: undefined;
    }>;
    all: () => Promise<{
        type: "ERROR";
        error: any;
        data?: undefined;
    } | {
        type: "SUCCESS";
        data: T[];
        error?: undefined;
    }>;
    create: (obj: Partial<T>) => Promise<{
        type: "ERROR";
        error: any;
        data?: undefined;
    } | {
        type: "SUCCESS";
        data: T;
        error?: undefined;
    }>;
    patch: (id: string, obj: Partial<T>) => Promise<{
        type: "ERROR";
        error: any;
        data?: undefined;
    } | {
        type: "SUCCESS";
        data: T;
        error?: undefined;
    }>;
    search: (searchParams: Partial<T>) => Promise<{
        type: "ERROR";
        error: any;
        data?: undefined;
    } | {
        type: "SUCCESS";
        data: T[];
        error?: undefined;
    }>;
    delete: (id: string) => Promise<{
        type: "ERROR";
        error: any;
        data?: undefined;
    } | {
        type: "SUCCESS";
        data: T[];
        error?: undefined;
    }>;
};
