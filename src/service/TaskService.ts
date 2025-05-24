import * as mongoose from "mongoose";
import {Task} from "@/model/TaskModel";

class TaskService {

    constructor(private readonly db: mongoose.Connection, private readonly taskModel: mongoose.Model<Task>) {
    }

    async createTask(task: Task): Promise<Task> {
        const newTask = new this.taskModel(task);
        return newTask.save();
    }

    async getTaskById(id: string): Promise<Task | null> {
        return this.taskModel.findById(id).populate('userId');
    }

    async updateTask(id: string, task: Partial<Task>): Promise<Task | null> {
        return this.taskModel.findByIdAndUpdate(id, task, {new: true}).populate('userId');
    }

    async deleteTask(id: string): Promise<Task | null> {
        return this.taskModel.findByIdAndDelete(id);
    }

    async getTasksByUserId(userId: string): Promise<Task[]> {
        return this.taskModel.find({userId}).populate('userId');
    }

    async getTasksByStatus(status: string): Promise<Task[]> {
        return this.taskModel.find({status}).populate('userId');
    }
}

export default TaskService;
