import {NextRequest, NextResponse} from "next/server";
import UserService from "@/service/UserService";
import {BaseResponse} from "@/model/ResponseModel";
import {connectDB} from "@/database";
import logger from "@/lib/logger";

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

        const response = await UserService.login(credential);

        return NextResponse.json(response,
            {status: response.status, headers: {"Content-Type": "application/json"}});

    } catch (error) {
        logger.error(`Error in Google authentication: ${JSON.stringify(error)}`);
        return NextResponse.json<BaseResponse<null>>(
            {status: 500, message: "Internal server error", data: null, timestamp: new Date().toISOString()},
            {status: 500, headers: {"Content-Type": "application/json"}}
        )
    }
}