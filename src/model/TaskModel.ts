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
        this.priority = await model<Task>('tasks').countDocuments({
            userId: this.userId,
            status: this.status,
            active: this.active
        })
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
            const isNotUpdateStatus = await model<Task>('tasks').findOne({
                userId: query.userId,
                status: update.status,
                _id: query._id, // Assuming you want to check the task being updated
            });
            if (isNotUpdateStatus) {
                logger.info(`Task no update status found for user ${query.userId} with status ${update.status}, skipping priority setting.`);
                return next(); // Skip setting priority if task already exists
            }

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

taskSchema.post('findOneAndUpdate', async function (
        this: Query<never, Task>,
        doc: Task | null,
        next: CallbackWithoutResultAndOptionalError
    ) {
        try {
            if (doc) {
                logger.info(`Setting task priority for user: ${doc}`);
                //     update task priority on diferent status
                const dataTask = await model<Task>('tasks').find({
                    userId: doc.userId,
                    status: doc.status === 'todo' ? 'done' : 'todo', // Assuming you want to update the opposite status
                    active: true // Assuming you want to count only active tasks
                })

                const bulkUpdate = dataTask.sort((a, b) => a.priority - b.priority)
                    .map(
                        (task, index) => {
                            return {
                                _id: task._id,
                                priority: index,
                            }

                        }
                    );
                if (bulkUpdate.length > 0) {
                    logger.info(`Updating priorities for tasks: ${JSON.stringify(bulkUpdate)}`);
                    await model<Task>('tasks').bulkWrite(
                        bulkUpdate.map(task => ({
                            updateOne: {
                                filter: {_id: task._id},
                                update: {$set: {priority: task.priority}}
                            }
                        }))
                    );
                    logger.info(`Task priorities updated successfully.`);
                }

                const isUpdateForArchived = doc.active === false;
                if (isUpdateForArchived) {
                    logger.info(`Updating priorities for tasks status: ${doc.status}`);
                    const dataTask = await model<Task>('tasks').find({
                        userId: doc.userId,
                        status: doc.status,
                        active: true // Assuming you want to count only active tasks
                    });
                    const sortedDataTask = dataTask.sort((a, b) => a.priority - b.priority);
                    logger.info(`Sorted tasks for user ${doc.userId} with status ${doc.status}: ${JSON.stringify(sortedDataTask)}`);
                    await model<Task>('tasks').bulkWrite(
                        sortedDataTask.map((task, index) => ({
                            updateOne: {
                                filter: {_id: task._id},
                                update: {$set: {priority: index}}
                            }
                        }))
                    );
                    logger.info(`Task priorities updated successfully for archived tasks.`);


                } else {
                    logger.info(`Task with ID ${doc._id} updated successfully.`);
                }

            } else {
                logger.warn("No task found to update.");
            }
            next()

        } catch (error) {
            logger.error(`Error in post findOneAndUpdate hook: ${error}`);
            next(error as Error);
        }
    }
)

taskSchema.post('findOneAndDelete', async function (
        this: Query<never, Task>,
        doc: Task | null,
        next: CallbackWithoutResultAndOptionalError
    ) {
        try {
            if (doc) {
                logger.info(`Task deleted successfully: ${doc._id}`);
                // Update task priorities after deletion
                const dataTask = await model<Task>('tasks').find({
                    userId: doc.userId,
                    status: doc.status,
                    active: true // Assuming you want to count only active tasks
                });

                const sortedDataTask = dataTask.sort((a, b) => a.priority - b.priority);
                logger.info(`Sorted tasks for user ${doc.userId} with status ${doc.status}: ${JSON.stringify(sortedDataTask)}`);
                for (let i = 0; i < sortedDataTask.length; i++) {
                    const task = sortedDataTask[i];
                    if (task.priority !== i) {
                        task.priority = i;
                        await task.save();
                        logger.info(`Updated task ${task._id} priority to ${i}`);
                    }
                }
            } else {
                logger.warn("No task found to delete.");
            }
            next()
        } catch (error) {
            logger.error(`Error in post findOneAndDelete hook: ${error}`);
            next(error as Error);
        }
    }
)

const taskModel = models.tasks || model<Task>('tasks', taskSchema);


export default taskModel;