import jwt from 'jsonwebtoken';
import {NextRequest} from "next/server";


const generateJWT = (userId: string): string => {
    const payload = {
        userId,
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET || "test", {
        algorithm: 'HS256',
        expiresIn: '1h',
    });
    return token;
}

const verifyJWT = (token: string): string | jwt.JwtPayload => {
    try {
        return jwt.verify(token, process.env.JWT_SECRET || "test", {
            algorithms: ['HS256'],
        });
        ;
    } catch (error) {
        console.error(error);
        throw new Error('Invalid token');
    }
}

const decodeJWT = (token: string): string | jwt.JwtPayload => {
    try {
        return jwt.decode(token) as string | jwt.JwtPayload;
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

export {generateJWT, verifyJWT, decodeJWT, getTokenFromHeader};