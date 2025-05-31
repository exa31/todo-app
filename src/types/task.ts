import {z} from "zod";

export const TaskModelSchema = z.object({
    title: z.string().min(3, "Title must be at least 3 characters long"),
    description: z.string().optional(),
})

export type TaskModel = z.infer<typeof TaskModelSchema> & {
    _id: string;
    priority: number;
    status: "todo" | "in-progress" | "done";
    active: boolean;
    userId: string;
    createdAt: Date;
    updatedAt: Date;
}

export type TaskFormData = {
    title: string;
    description?: string;
    status: "todo" | "in-progress" | "done";
    _id?: string;
}