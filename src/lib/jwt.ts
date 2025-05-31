import jwt from 'jsonwebtoken';
import {NextRequest} from "next/server";
import {payloadJwt} from "@/types";
import logger from "@/lib/logger";


const generateJWT = (payload: object): string => {
    return jwt.sign(payload, process.env.JWT_SECRET as string, {
        algorithm: 'HS256',
        expiresIn: '1d', // Token will expire in 1 day
    });
}

const verifyJWT = (token: string): string | payloadJwt => {
    try {
        return jwt.verify(token, process.env.JWT_SECRET as string, {
            algorithms: ['HS256'],
        });
        ;
    } catch (error) {
        logger.error(`JWT verification failed: ${error}`);
        if (error instanceof jwt.TokenExpiredError) {
            throw new Error('Token has expired');
        } else if (error instanceof jwt.JsonWebTokenError) {
            throw new Error('Invalid token');
        }
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