import { AnyDate } from "./common-types";
export declare function randomId(tag?: string): string;
export declare const initModel: <T>(obj: T, partial?: Partial<T> | undefined) => void;
export declare function toDate(date: AnyDate): Date | null;
