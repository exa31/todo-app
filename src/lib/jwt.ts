import jwt from 'jsonwebtoken';
import {NextRequest} from "next/server";
import {payloadJwt} from "@/types";


const generateJWT = (userId: string): string => {
    const payload = {
        userId,
    };
    return jwt.sign(payload, process.env.JWT_SECRET as string, {
        algorithm: 'HS256',
        expiresIn: '1h',
    });
}

const verifyJWT = (token: string): string | payloadJwt => {
    try {
        return jwt.verify(token, process.env.JWT_SECRET as string, {
            algorithms: ['HS256'],
        });
        ;
    } catch (error) {
        console.error(error);
        throw new Error('Invalid token');
    }
}

const getTokenFromHeader = (req: NextRequest): string | null => {
    const authHeader = req.headers.get("authorization");
    if (authHeader && authHeader.startsWith('Bearer ')) {
        return authHeader.split(' ')[1];
    }
    return null;
}

export {generateJWT, verifyJWT, getTokenFromHeader};