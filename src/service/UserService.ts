import * as mongoose from "mongoose";
import userModel, {User} from "@/model/UserModel";
import {generateJWT} from "@/lib/jwt";
import {cookies} from "next/headers";
import {BaseResponse} from "@/model/ResponseModel";
import {ResponseLogin} from "@/types";
import logger from "@/lib/logger";
import {NextResponse} from "next/server";
import {OAuth2Client} from "google-auth-library";

class UserService {

    constructor(private readonly userModel: mongoose.Model<User>, private readonly client: OAuth2Client) {
    }

    async createUser(user: User): Promise<User> {
        const newUser = new this.userModel(user);
        return newUser.save();
    }

    async login(credential: string): Promise<NextResponse<BaseResponse<ResponseLogin | null>>> {
        try {

            const ticket = await this.client.verifyIdToken({
                idToken: credential,
                audience: process.env.GOOGLE_CLIENT_ID,
            });

            const payload = ticket.getPayload();
            if (!payload) {
                return NextResponse.json<BaseResponse<null>>(
                    {status: 401, message: "Invalid Google token", data: null, timestamp: new Date().toISOString()},
                    {status: 401, headers: {"Content-Type": "application/json"}}
                )
            }

            logger.info(`Payload from Google: ${JSON.stringify(payload)}`);

            if (!payload.email_verified) {
                return NextResponse.json<BaseResponse<null>>(
                    {status: 401, message: "Email not verified", data: null, timestamp: new Date().toISOString()},
                    {status: 401, headers: {"Content-Type": "application/json"}}
                )
            }

            const {email, name} = payload;

            logger.info(`Email and name from Google payload: ${email} ${name}`);

            // use service login

            if (!email || !name) {
                return NextResponse.json<BaseResponse<null>>(
                    {
                        status: 400,
                        message: "Email and name are required",
                        data: null,
                        timestamp: new Date().toISOString()
                    },
                    {status: 400, headers: {"Content-Type": "application/json"}}
                )
            }
            let user: User | null = await this.userModel.findOne({email});
            if (!user) {
                user = new this.userModel({email, name: name});
                await user.save();
            }
            const payloadJwt = {
                userId: String(user._id),
                email: user.email,
                name: user.name,
            }
            const token = generateJWT(payloadJwt);

            const cookie = await cookies()
            cookie.set({
                name: "token",
                value: token,
                sameSite: "strict",
                secure: true,
                maxAge: 60 * 60 * 24, // 1 day
            })

            logger.info(`User ${user.email} logged in successfully.`);

            return NextResponse.json<BaseResponse<ResponseLogin>>(
                {
                    status: 200,
                    message: "Login successful",
                    data: {
                        email: user.email,
                        name: user.name,
                    },
                    timestamp: new Date().toISOString(),
                },
                {status: 200, headers: {"Content-Type": "application/json"}}
            );
        } catch (error) {
            logger.error(`Error during user login: ${JSON.stringify(error)}`);
            return NextResponse.json<BaseResponse<null>>(
                {
                    status: 500,
                    message: "Internal server error",
                    data: null,
                    timestamp: new Date().toISOString(),
                },
                {status: 500, headers: {"Content-Type": "application/json"}}
            );
        }
    }
}

const userService = new UserService(userModel, new OAuth2Client({clientId: process.env.GOOGLE_CLIENT_ID}));

export default userService;
