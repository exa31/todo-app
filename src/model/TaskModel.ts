import {Document, model, models, Schema} from 'mongoose';
import {User} from "@/model/UserModel";
import '@/model/UserModel'; // supaya mongoose tahu ada model 'users'

export interface Task extends Document {
    title: string;
    description?: string;
    status: 'todo' | 'inprogress' | 'done';
    userId: User['_id'];
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
    },
    {timestamps: true},
);

taskSchema.pre('save', async function (next) {
    console.log("Setting task priority for user:", this.userId);
    try {
        const countLength = await model<Task>('tasks').countDocuments({userId: this.userId});
        this.priority = countLength + 1; // Set priority based on the number of tasks
        next();
    } catch (error) {
        console.error("Error setting task priority:", error);
        next(error as Error);
    }
})

const taskModel = models.tasks || model<Task>('tasks', taskSchema);


export default taskModel;