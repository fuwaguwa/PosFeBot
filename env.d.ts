import type {ArrayString} from "@skyra/env-utilities";


declare module "@skyra/env-utilities" {
    interface Env {
        ownerIds: ArrayString;
        botToken: string;
        mongoDB: string;
    }
}

export {};