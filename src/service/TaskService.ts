import * as mongoose from "mongoose";
import taskModel, {Task} from "@/model/TaskModel";
import {BaseResponse} from "@/model/ResponseModel";
import {TaskFormData} from "@/types/task";

class TaskService {

    constructor(private readonly taskModel: mongoose.Model<Task>) {
    }

    async createTask(task: TaskFormData): Promise<BaseResponse<null>> {
        try {
            const newTask: Task = new this.taskModel(task);
            await newTask.save();
            return {
                status: 201,
                message: "Task created successfully",
                data: null,
                timestamp: new Date().toISOString(),
            };
        } catch (error) {
            console.error("Error creating task:", error);
            return {
                status: 500,
                message: "Internal server error",
                data: null,
                timestamp: new Date().toISOString(),
            };
        }
    }

    async updateTask(id: string, task: Partial<Task>): Promise<Task | null> {
        return this.taskModel.findByIdAndUpdate(id, task, {new: true}).populate('userId');
    }

    async deleteTask(id: string): Promise<Task | null> {
        return this.taskModel.findByIdAndDelete(id);
    }

    async getTasksByUserId(userId: string): Promise<BaseResponse<Task[]>> {
        const tasks = await this.taskModel.find({userId}).populate('userId');
        return {
            status: 200,
            message: "Tasks fetched successfully",
            data: tasks,
            timestamp: new Date().toISOString(),
        };
    }

    async getTasksByStatus(status: string): Promise<Task[]> {
        return this.taskModel.find({status}).populate('userId');
    }
}

const taskService = new TaskService(taskModel);

export default taskService;
