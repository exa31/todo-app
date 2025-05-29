import {NextRequest, NextResponse} from "next/server";
import {OAuth2Client} from "google-auth-library";
import UserService from "@/service/UserService";
import {BaseResponse} from "@/model/ResponseModel";
import {connectDB} from "@/database";
import {ResponseLogin} from "@/types";
import logger from "@/lib/logger";

const client = new OAuth2Client({clientId: process.env.GOOGLE_CLIENT_ID});

export async function POST(req: NextRequest) {
    try {
        const [body] = await Promise.all([
            req.json(),
            connectDB()
        ])
        const {credential} = body;

        logger.info(`Google authentication request body: ${JSON.stringify(body)}`);

        if (!credential) {
            return NextResponse.json(
                {error: "Credential is required for authentication"},
                {status: 400, headers: {"Content-Type": "application/json"}}
            )
        }

        const ticket = await client.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        if (!payload) {
            return NextResponse.json(
                {error: "Invalid Google token"},
                {status: 401, headers: {"Content-Type": "application/json"}}
            )
        }

        logger.info(`Payload from Google: ${JSON.stringify(payload)}`);

        if (!payload.email_verified) {
            return NextResponse.json(
                {error: "Email not verified"},
                {status: 401, headers: {"Content-Type": "application/json"}}
            )
        }

        const {email, name} = payload;

        logger.info(`Email and name from Google payload: ${email} ${name}`);

        // use service login

        if (!email || !name) {
            return NextResponse.json(
                {error: "Email and name are required"},
                {status: 400, headers: {"Content-Type": "application/json"}}
            )
        }

        const response = await UserService.login(email, name);

        if (response.data) {
            return NextResponse.json<BaseResponse<ResponseLogin>>(
                {...response, data: response.data},
                {status: response.status, headers: {"Content-Type": "application/json"}}
            );
        } else {
            return NextResponse.json<BaseResponse<null>>(
                {status: 401, message: "Login failed", data: null, timestamp: new Date().toISOString()},
                {status: 401, headers: {"Content-Type": "application/json"}}
            )
        }
    } catch (error) {
        logger.error(`Error in Google authentication: ${JSON.stringify(error)}`);
        return NextResponse.json<BaseResponse<null>>(
            {status: 500, message: "Internal server error", data: null, timestamp: new Date().toISOString()},
            {status: 500, headers: {"Content-Type": "application/json"}}
        )
    }
}