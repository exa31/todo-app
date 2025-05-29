import {CallbackWithoutResultAndOptionalError, Document, model, models, Query, Schema} from 'mongoose';
import {User} from "@/model/UserModel";
import '@/model/UserModel';
import logger from "@/lib/logger"; // supaya mongoose tahu ada model 'users'

export interface Task extends Document {
    title: string;
    description?: string;
    status: 'todo' | 'inprogress' | 'done';
    userId: User['_id'];
    active: boolean;
    priority: number;
    createdAt: Date;
    updatedAt: Date;
}

const taskSchema = new Schema<Task>({
        title: {type: String, required: true},
        description: {type: String},
        userId: {type: Schema.Types.ObjectId, ref: 'users', required: true},
        priority: {
            type: Number,
            required: true,
            default: 0, // Default priority, will be set in pre-save hook
        },
        status: {
            type: String,
            enum: ['todo', 'done'],
            default: 'todo',
        },
        active: {
            type: Boolean,
            default: true, // Default to active
        }
    },
    {timestamps: true},
);

taskSchema.pre('save', async function (next) {
    logger.info("Setting task priority for user:", this.userId);
    try {
        const countLength = await model<Task>('tasks').countDocuments({
            userId: this.userId,
            status: this.status,
            active: this.active
        });
        this.priority = countLength - 1
        next();
    } catch (error) {
        logger.error("Error setting task priority:", error);
        next(error as Error);
    }
})

taskSchema.pre("findOneAndUpdate", async function (
    this: Query<never, Task>,
    next: CallbackWithoutResultAndOptionalError
) {
    try {
        const query = this.getQuery() as Partial<Task>;
        const update = this.getUpdate() as Partial<Task>;
        logger.info(`Setting task priority for user: ${query.userId}, status: ${update.status}, update: ${JSON.stringify(update)}`);
        if (update && update.status && query.userId) {
            const countLength = await model<Task>('tasks').countDocuments({
                userId: query.userId,
                status: update.status,
                active: true // Assuming you want to count only active tasks
            });
            logger.info(`Count of tasks for user ${query.userId} with status ${update.status}: ${countLength}`);
            if (!update.priority) {
                logger.info(`Setting priority for update: ${countLength}`);
                update.priority = countLength; // Set priority based on count
                logger.info(`new priority set: ${update.priority}`);
            } else {
                logger.info(`Priority already set in update: ${update.priority}`);
            }
        } else {
            logger.info("No status or userId found in the update, skipping priority setting.");
        }
        next();
    } catch (error) {
        logger.error(`Error setting task priority in findOneAndUpdate: ${error}`);
        next(error as Error);
    }
})

const taskModel = models.tasks || model<Task>('tasks', taskSchema);


export default taskModel;