import {JwtPayload} from "jsonwebtoken";

export interface payloadJwt extends JwtPayload {
    userId?: string;
}