import {NextRequest, NextResponse} from "next/server";
import {OAuth2Client} from "google-auth-library";
import UserService from "@/service/UserService";
import {BaseResponse} from "@/model/ResponseModel";
import {connectDB} from "@/database";

const client = new OAuth2Client({clientId: process.env.GOOGLE_CLIENT_ID});

export async function POST(req: NextRequest) {
    try {
        const [body] = await Promise.all([
            req.json(),
            connectDB()
        ])
        const {credential} = body;

        console.log("Google authentication request body:", body);

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

        console.log("Payload from Google:", payload);

        if (!payload.email_verified) {
            return NextResponse.json(
                {error: "Email not verified"},
                {status: 401, headers: {"Content-Type": "application/json"}}
            )
        }

        const {email, name} = payload;

        console.log("Email and name from Google payload:", email, name);

        // use service login

        if (!email || !name) {
            return NextResponse.json(
                {error: "Email and name are required"},
                {status: 400, headers: {"Content-Type": "application/json"}}
            )
        }

        const response = await UserService.login(email, name);

        return NextResponse.json<BaseResponse<null>>(
            {...response},
            {status: response.status, headers: {"Content-Type": "application/json"}}
        );
    } catch (error) {
        console.error("Error in Google authentication:", error);
        return NextResponse.json<BaseResponse<null>>(
            {status: 500, message: "Internal server error", data: null, timestamp: new Date().toISOString()},
            {status: 500, headers: {"Content-Type": "application/json"}}
        )
    }
}