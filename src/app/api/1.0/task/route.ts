import {NextRequest, NextResponse} from "next/server";
import {connectDB} from "@/database";
import {BaseResponse} from "@/model/ResponseModel";
import {getTokenFromHeader, verifyJWT} from "@/lib/jwt";
import {payloadJwt} from "@/types";
import {Task} from "@/model/TaskModel";
import taskService from "@/service/TaskService";

export async function GET(req: NextRequest) {
    try {
        await connectDB() // Uncomment if you need to connect to the database

        // Here you can implement your logic to fetch tasks

        const token = getTokenFromHeader(req)

        if (!token) {
            return NextResponse.json<BaseResponse<null>>(
                {status: 401, message: "Unauthorized", data: null, timestamp: new Date().toISOString()},
                {status: 401, headers: {"Content-Type": "application/json"}}
            )
        }

        const payloadToken: payloadJwt | string = verifyJWT(token)

        console.log(payloadToken)

        if (!payloadToken || typeof payloadToken === "string" || !payloadToken.userId) {
            return NextResponse.json<BaseResponse<null>>(
                {status: 401, message: "Unauthorized", data: null, timestamp: new Date().toISOString()},
                {status: 401, headers: {"Content-Type": "application/json"}}
            )
        }

        // Here you can fetch tasks based on the user ID from the payload

        const response: BaseResponse<Task[]> = await taskService.getTasksByUserId(payloadToken.userId)

        return NextResponse.json<BaseResponse<Task[]>>(
            {...response},
            {status: response.status, headers: {"Content-Type": "application/json"}}
        );


    } catch (error) {
        console.error("Error connecting to the database:", error);
        if (error instanceof Error && error.message.includes("expired")) {
            return NextResponse.json<BaseResponse<null>>(
                {status: 401, message: "Token expired", data: null, timestamp: new Date().toISOString()},
                {status: 401, headers: {"Content-Type": "application/json"}}
            )
        }
        return NextResponse.json<BaseResponse<null>>(
            {status: 500, message: "Internal Server Error", data: null, timestamp: new Date().toISOString()},
            {status: 500, headers: {"Content-Type": "application/json"}}
        )
    }
}

export async function POST(req: NextRequest) {
    try {
        await connectDB() // Uncomment if you need to connect to the database

        const token = getTokenFromHeader(req)

        if (!token) {
            return NextResponse.json<BaseResponse<null>>(
                {status: 401, message: "Unauthorized", data: null, timestamp: new Date().toISOString()},
                {status: 401, headers: {"Content-Type": "application/json"}}
            )
        }

        const payloadToken: payloadJwt | string = verifyJWT(token)

        if (!payloadToken || typeof payloadToken === "string" || !payloadToken.userId) {
            return NextResponse.json<BaseResponse<null>>(
                {status: 401, message: "Unauthorized", data: null, timestamp: new Date().toISOString()},
                {status: 401, headers: {"Content-Type": "application/json"}}
            )
        }

        const body = await req.json()

        const response = await taskService.createTask({...body, userId: payloadToken.userId})

        return NextResponse.json<BaseResponse<null>>(
            {...response},
            {status: response.status, headers: {"Content-Type": "application/json"}}
        );

    } catch (error) {
        console.error("Error connecting to the database:", error);
        if (error instanceof Error && error.message.includes("expired")) {
            return NextResponse.json<BaseResponse<null>>(
                {status: 401, message: "Token expired", data: null, timestamp: new Date().toISOString()},
                {status: 401, headers: {"Content-Type": "application/json"}}
            )
        }
        return NextResponse.json<BaseResponse<null>>(
            {status: 500, message: "Internal Server Error", data: null, timestamp: new Date().toISOString()},
            {status: 500, headers: {"Content-Type": "application/json"}}
        )
    }
}