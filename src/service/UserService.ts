import * as mongoose from "mongoose";
import userModel, {User} from "@/model/UserModel";
import {generateJWT} from "@/lib/jwt";
import {cookies} from "next/headers";
import {BaseResponse} from "@/model/ResponseModel";
import {ResponseLogin} from "@/types";
import logger from "@/lib/logger";

class UserService {

    constructor(private readonly userModel: mongoose.Model<User>) {
    }

    async createUser(user: User): Promise<User> {
        const newUser = new this.userModel(user);
        return newUser.save();
    }

    async login(email: string, name: string): Promise<BaseResponse<ResponseLogin | null>> {
        try {

            let user: User | null = await this.userModel.findOne({email});
            if (!user) {
                user = new this.userModel({email, name: name});
                await user.save();
            }
            const token = generateJWT(String(user._id));

            const cookie = await cookies()
            cookie.set({
                name: "token",
                value: token,
                sameSite: "strict",
                secure: true,
                maxAge: 60 * 60 * 24, // 1 day
            })
            return {
                status: 200,
                message: "Login successful",
                data: {
                    email: user.email,
                    name: user.name,
                },
                timestamp: new Date().toISOString(),
            }
        } catch (error) {
            logger.error(`Error during user login: ${JSON.stringify(error)}`);
            return {
                status: 500,
                message: "Internal server error",
                data: null,
                timestamp: new Date().toISOString(),
            };
        }
    }
}

const userService = new UserService(userModel);

export default userService;
