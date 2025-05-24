import {Document, model, Schema} from 'mongoose';
import {User} from "@/model/UserModel";

export interface Task extends Document {
    title: string;
    description?: string;
    status: 'todo' | 'inprogress' | 'done';
    userId: User['_id'];
    createdAt: Date;
    updatedAt: Date;
}

const taskSchema = new Schema<Task>({
        title: {type: String, required: true},
        description: {type: String},
        userId: {type: Schema.Types.ObjectId, ref: 'users', required: true},
        status: {
            type: String,
            enum: ['todo', 'inprogress', 'done'],
            default: 'todo',
        },
    },
    {timestamps: true},
);

export default model<Task>('tasks', taskSchema);