// lib/logger.ts
import winston from 'winston';
import path from 'path';

const logDir = 'logs';

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.printf(({level, message, timestamp}) => {
            return `[${timestamp}] ${level.toUpperCase()}: ${message}`;
        })
    ),
    transports: [
        new winston.transports.File({filename: path.join(logDir, 'error.log'), level: 'error'}),
        new winston.transports.File({filename: path.join(logDir, 'combined.log')}),
    ],
});

// Tambahkan log ke console juga saat development
if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: winston.format.simple(),
    }));
}

export default logger;
