export declare function getData<G>(route: string, mainURI: string): Promise<{
    type: "ERROR";
    error: any;
    data?: undefined;
} | {
    type: "SUCCESS";
    data: G;
    error?: undefined;
}>;
export declare function postData<S, G>(route: string, send: S, mainURI: string): Promise<{
    type: "ERROR";
    error: any;
    data?: undefined;
} | {
    type: "SUCCESS";
    data: G;
    error?: undefined;
}>;
export declare function patchData<S, G>(route: string, send: Partial<S>, mainURI: string): Promise<{
    type: "ERROR";
    error: any;
    data?: undefined;
} | {
    type: "SUCCESS";
    data: G;
    error?: undefined;
}>;
export declare function deleteData<S, G>(route: string, mainURI: string): Promise<{
    type: "ERROR";
    error: any;
    data?: undefined;
} | {
    type: "SUCCESS";
    data: G;
    error?: undefined;
}>;
