import {NextRequest, NextResponse} from "next/server";
import {connectDB} from "@/database";
import {BaseResponse} from "@/model/ResponseModel";
import {Task} from "@/model/TaskModel";
import taskService from "@/service/TaskService";
import logger from "@/lib/logger";
import {getTokenFromHeader, verifyJWT} from "@/lib/jwt";

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

        const response: BaseResponse<Task[]> = await taskService.getTasksByUserId(userId)

        return NextResponse.json<BaseResponse<Task[]>>(
            {...response},
            {status: response.status, headers: {"Content-Type": "application/json"}}
        );


    } catch (error) {
        logger.error(`Error connecting to the database: ${JSON.stringify(error)}`);
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

        const body = await req.json()

        const response = await taskService.createTask({...body, userId})

        return NextResponse.json<BaseResponse<null>>(
            {...response},
            {status: response.status, headers: {"Content-Type": "application/json"}}
        );

    } catch (error) {
        logger.error(`Error connecting to the database: ${JSON.stringify(error)}`);
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

export async function PUT(req: NextRequest) {
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

        const body = await req.json()

        const response = await taskService.updateTask(body._id, userId, body)

        return NextResponse.json<BaseResponse<Task | null>>(
            {...response},
            {status: response.status, headers: {"Content-Type": "application/json"}}
        );
    } catch (error) {
        logger.error(`Error connecting to the database: ${JSON.stringify(error)}`);
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

export async function DELETE(req: NextRequest) {
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

        const id = req.nextUrl.searchParams.get("id");

        if (!id) {
            return NextResponse.json<BaseResponse<null>>(
                {
                    status: 400,
                    message: "Bad Request: Task ID is required",
                    data: null,
                    timestamp: new Date().toISOString()
                },
                {status: 400, headers: {"Content-Type": "application/json"}}
            )
        }

        const response = await taskService.deleteTask(id, userId)

        return NextResponse.json<BaseResponse<Task | null>>(
            {...response},
            {status: response.status, headers: {"Content-Type": "application/json"}}
        );
    } catch (error) {
        logger.error(`Error connecting to the database: ${JSON.stringify(error)}`);
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