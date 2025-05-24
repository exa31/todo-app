import * as mongoose from "mongoose";
import TaskModel, {Task} from "@/model/TaskModel";
import {BaseResponse} from "@/model/ResponseModel";

class TaskService {

    constructor(private readonly taskModel: mongoose.Model<Task>) {
    }

    async createTask(task: Task): Promise<Task> {
        const newTask = new this.taskModel(task);
        return newTask.save();
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

const taskService = new TaskService(TaskModel);

export default taskService;
