import {NextRequest, NextResponse} from "next/server";
import taskService from "@/service/TaskService";
import {BaseResponse} from "@/model/ResponseModel";
import {connectDB} from "@/database";
import logger from "@/lib/logger";
import {getTokenFromHeader, verifyJWT} from "@/lib/jwt";

export async function PUT(request: NextRequest) {
    try {
        // Connect to the database if needed
        await connectDB(); // Uncomment if you need to connect to the database

        const token = getTokenFromHeader(request)

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

        if (!userId) {
            return NextResponse.json<BaseResponse<null>>(
                {
                    status: 401,
                    message: "Unauthorized: User ID is required",
                    data: null,
                    timestamp: new Date().toISOString()
                },
                {status: 401, headers: {"Content-Type": "application/json"}}
            )
        }

        const {id, priority, status} = await request.json();

        if (!id || typeof priority !== 'number' || !status) {
            return NextResponse.json<BaseResponse<null>>(
                {
                    status: 400,
                    message: "Bad Request: Missing or invalid parameters",
                    data: null,
                    timestamp: new Date().toISOString()
                },
                {status: 400, headers: {"Content-Type": "application/json"}}
            );
        }

        // Assuming you have a service to handle the update logic
        const response = await taskService.updateTaskPriority(id, priority, status, userId);
        return NextResponse.json<BaseResponse<null>>(
            {
                status: response.status,
                message: response.message,
                data: response.data,
                timestamp: new Date().toISOString(),
            },
            {status: response.status, headers: {"Content-Type": "application/json"}}
        )
    } catch (error) {
        logger.error(`Error connecting to the database: ${JSON.stringify(error)}`);
        return NextResponse.json<BaseResponse<null>>(
            {
                status: 500,
                message: "Internal Server Error",
                data: null,
                timestamp: new Date().toISOString(),
            },
            {status: 500, headers: {"Content-Type": "application/json"}}
        );
    }
}