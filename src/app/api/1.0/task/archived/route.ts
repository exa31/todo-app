import {NextRequest, NextResponse} from "next/server";
import {connectDB} from "@/database";
import {getTokenFromHeader, verifyJWT} from "@/lib/jwt";
import {BaseResponse} from "@/model/ResponseModel";
import taskService from "@/service/TaskService";
import {Task} from "@/model/TaskModel";

export async function GET(req: NextRequest) {
    try {
        await connectDB() // Uncomment if you need to connect to the database

        const token = getTokenFromHeader(req)

        if (!token) {
            return NextResponse.json<BaseResponse<null>>(
                {
                    status: 401,
                    message: "Unauthorized: Token is required",
                    data: null,
                    timestamp: new Date().toISOString()
                },
                {status: 401, headers: {"Content-Type": "application/json"}}
            )
        }
        // Extract userId from the token
        const payload = verifyJWT(token);
        if (typeof payload === 'string' || !payload.userId) {
            return NextResponse.json<BaseResponse<null>>(
                {
                    status: 401,
                    message: "Unauthorized: Invalid token",
                    data: null,
                    timestamp: new Date().toISOString()
                },
                {status: 401, headers: {"Content-Type": "application/json"}}
            )
        }

        const userId = payload.userId;
        // Here you can fetch tasks based on the user ID from the payload

        const response = await taskService.getTaskArchivedByUserId(userId);
        return NextResponse.json<BaseResponse<Task[]>>(
            {
                status: response.status,
                message: response.message,
                data: response.data,
                timestamp: new Date().toISOString()
            },
            {status: response.status, headers: {"Content-Type": "application/json"}}
        );
    } catch (error) {
        console.error("Error in GET /api/1.0/task/archived:", error);
        return NextResponse.json<BaseResponse<null>>(
            {
                status: 500,
                message: "Internal Server Error",
                data: null,
                timestamp: new Date().toISOString()
            },
            {status: 500, headers: {"Content-Type": "application/json"}}
        );
    }

}