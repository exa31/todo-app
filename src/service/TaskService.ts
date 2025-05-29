import * as mongoose from "mongoose";
import taskModel, {Task} from "@/model/TaskModel";
import {BaseResponse} from "@/model/ResponseModel";
import {TaskFormData} from "@/types/task";
import logger from "@/lib/logger";

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
            logger.error("Error creating task:", error);
            return {
                status: 500,
                message: "Internal server error",
                data: null,
                timestamp: new Date().toISOString(),
            };
        }
    }

    async updateTask(id: string, userId: string, task: Partial<Task>): Promise<BaseResponse<null>> {
        try {
            const updatedTask = await this.taskModel.findOneAndUpdate({_id: id, userId: userId}, task, {new: true});
            if (!updatedTask) {
                return {
                    status: 404,
                    message: "Task not found",
                    data: null,
                    timestamp: new Date().toISOString(),
                };
            }
            return {
                status: 200,
                message: "Task updated successfully",
                data: null,
                timestamp: new Date().toISOString(),
            };

        } catch (error) {
            logger.error("Error updating task:", error);
            return {
                status: 500,
                message: "Internal server error",
                data: null,
                timestamp: new Date().toISOString(),
            };
        }
    }

    async updateTaskPriority(id: string, priority: number, status: string, userId: string): Promise<BaseResponse<null>> {
        try {
            const dataTask = await this.getTasksByUserIdAndStatus(userId, status);
            const sortedDataTask = dataTask.sort((a, b) => a.priority - b.priority);

            const taskUpdateIndex = sortedDataTask.findIndex(t => String(t._id) === id);
            if (taskUpdateIndex === -1) {
                return {
                    status: 404,
                    message: "Task not found",
                    data: null,
                    timestamp: new Date().toISOString(),
                }
            }
            // Update the task's priority
            logger.info(`Task with ID ${id} found at index ${taskUpdateIndex}, current priority: ${sortedDataTask[taskUpdateIndex].priority}, new priority: ${priority}`);
            if (priority === taskUpdateIndex) {
                return {
                    status: 200,
                    message: "Task priority is already set",
                    data: null,
                    timestamp: new Date().toISOString(),
                };
            }
            let dataReOrder: Task[] = [];

            if (taskUpdateIndex > priority) {
                // Geser ke atas: task akan disisipkan sebelum `priority`, dan elemen di antaranya digeser ke bawah
                const dataBefore = sortedDataTask.slice(0, priority);
                const dataBetween = sortedDataTask.slice(priority, taskUpdateIndex); // dari priority sampai sebelum taskUpdateIndex
                const dataAfter = sortedDataTask.slice(taskUpdateIndex + 1);

                dataReOrder = [
                    ...dataBefore,
                    sortedDataTask[taskUpdateIndex],
                    ...dataBetween,
                    ...dataAfter,
                ];
            } else if (taskUpdateIndex < priority) {
                // Geser ke bawah: task akan disisipkan setelah `priority`, dan elemen di antaranya digeser ke atas
                const dataBefore = sortedDataTask.slice(0, taskUpdateIndex);
                const dataBetween = sortedDataTask.slice(taskUpdateIndex + 1, priority + 1); // dari setelah task hingga priority
                const dataAfter = sortedDataTask.slice(priority + 1);

                dataReOrder = [
                    ...dataBefore,
                    ...dataBetween,
                    sortedDataTask[taskUpdateIndex],
                    ...dataAfter,
                ];
            }
            const newPriorityTasks: { id: string, priority: number }[] = dataReOrder.map(
                (task, index) => ({id: String(task._id), priority: index})
            )
            logger.info(`New priority tasks: ${JSON.stringify(newPriorityTasks)}`);


            const bulkOps = newPriorityTasks.map(t => ({
                updateOne: {
                    filter: {_id: t.id},
                    update: {priority: t.priority}
                }
            }));
            await this.taskModel.bulkWrite(bulkOps);
            return {
                status: 200,
                message: "Task priorities updated successfully",
                data: null,
                timestamp: new Date().toISOString(),
            };
        } catch (error) {
            logger.error(`Error updating task priority: ${JSON.stringify(error)}`);
            return {
                status: 500,
                message: "Internal server error",
                data: null,
                timestamp: new Date().toISOString(),
            };
        }
    }

    async deleteTask(id: string, idUser: string): Promise<BaseResponse<null>> {
        try {
            const deleted = await this.taskModel.deleteOne({_id: id, userId: idUser});
            if (deleted.deletedCount === 0) {
                logger.warn(`Task with ID ${id} not found for user ID ${idUser}.`);
                return {
                    status: 404,
                    message: "Task not found",
                    data: null,
                    timestamp: new Date().toISOString(),
                };
            }
            logger.info(`Task with ID ${id} deleted successfully.`);
            return {
                status: 200,
                message: "Task deleted successfully",
                data: null,
                timestamp: new Date().toISOString(),
            };
        } catch (error) {
            logger.error(`Error deleting task with ID ${id}: ${error}`);
            return {
                status: 500,
                message: "Internal server error",
                data: null,
                timestamp: new Date().toISOString(),
            };
        }
    }

    async getTasksByUserId(userId: string): Promise<BaseResponse<Task[]>> {
        try {
            const tasks = await this.taskModel.find({userId});
            logger.info(`Task with User ID ${userId} fetched successfully: ${tasks.length} tasks found.`);
            return {
                status: 200,
                message: "Tasks fetched successfully",
                data: tasks,
                timestamp: new Date().toISOString(),
            };
        } catch (error) {
            logger.error("Error fetching tasks by user ID:", error);
            return {
                status: 500,
                message: "Internal server error",
                data: [],
                timestamp: new Date().toISOString(),
            };
        }
    }

    async getTasksByUserIdAndStatus(userId: string, status: string): Promise<Task[]> {
        try {
            return await this.taskModel.find({userId: userId, status: status})
        } catch (error) {
            logger.error(`Error fetching tasks by user ID and status: ${error}`);
            return [];
        }
    }

    async getTasksByStatus(status: string): Promise<Task[]> {
        return this.taskModel.find({status}).populate('userId');
    }
}

const taskService = new TaskService(taskModel);

export default taskService;
