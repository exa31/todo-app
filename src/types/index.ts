import {JwtPayload} from "jsonwebtoken";

export interface payloadJwt extends JwtPayload {
    userId?: string;
}

export type ResponseLogin = {
    email: string;
    name: string;
}