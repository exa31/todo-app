import {useState} from "react";
import {apiFetch, validateForm} from "@/lib";
import {getCookie} from "@/lib/cookie";
import {BaseResponse} from "@/model/ResponseModel";
import {useRouter} from "next/navigation";
import {ZodError} from "zod";
import {TaskFormData, TaskModel, TaskModelSchema} from "@/types/task";


const useTask = () => {
    const [data, setData] = useState<{ todo: TaskModel[], done: TaskModel[] }>({
        todo: [],
        done: [],
    });
    const router = useRouter()
    const [loading, setLoading] = useState<boolean>(false);
    const [errorMessages, setErrorMessages] = useState<{ title: string }>({
        title: "",
    });

    const getTasks = async () => {
        if (loading) return;
        setLoading(true);
        try {
            const token = getCookie("token");
            if (!token) {
                console.error('No token found');
                router.push('/login');
                return;
            }
            const response = await apiFetch<BaseResponse<TaskModel[]>>('/api/1.0/task', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    "Authorization": `Bearer ${token}`,
                },
            });

            if (response) {
                const todoTasks = response.data.filter(task => task.status === 'todo').sort(
                    (a, b) => a.priority - b.priority
                );
                const doneTasks = response.data.filter(task => task.status === 'done').sort(
                    (a, b) => a.priority - b.priority
                );
                setData({
                    todo: todoTasks,
                    done: doneTasks,
                })
                console.log(todoTasks)
            }
        } catch (error) {
            console.error('Error fetching tasks:', error);
        } finally {
            setLoading(false);
        }
    }

    const addTask = async (task: TaskFormData) => {
        if (loading) return;
        setLoading(true);
        try {
            const token = getCookie("token");
            if (!token) {
                console.error('No token found');
                router.push('/login');
                return;
            }

            await validateForm(task, TaskModelSchema)

            const response = await apiFetch<BaseResponse<null>>('/api/1.0/task', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify(task),
            });

            if (response && response.data) {
                getTasks()
            }
        } catch (error) {
            if (error instanceof ZodError) {
                const errors: { title: string } = {
                    title: "",
                };
                error.errors.forEach(err => {
                    if (err.path.length > 0) {
                        const key = err.path[0] as keyof typeof errorMessages;
                        errors[key] = err.message;
                    }
                });
                setErrorMessages(errors);
                throw errors;
            }
            console.error('Error adding task:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    }

    const updateTask = async (id: string, task: Partial<TaskModel>) => {
        if (loading) return;
        setLoading(true);
        try {
            const token = getCookie("token");
            if (!token) {
                console.error('No token found');
                router.push('/login');
                return;
            }

            await apiFetch<BaseResponse<TaskModel>>(`/api/1.0/task`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify(task),
            });

            if (task.status === 'done') {
                const dataUpdate = data.todo.find(t => t._id === id);
                if (!dataUpdate) {
                    console.error('Task not found in todo list');
                    return;
                }
                dataUpdate.priority = data.done.length
                const newTodo = data.todo.filter(t => t._id !== id);
                const newDone = [...data.done, dataUpdate];
                setData({
                    todo: newTodo,
                    done: newDone,
                });
            } else if (task.status === 'todo') {
                const dataUpdate = data.done.find(t => t._id === id);
                if (!dataUpdate) {
                    console.error('Task not found in done list');
                    return;
                }
                dataUpdate.priority = data.todo.length
                const newDone = data.done.filter(t => t._id !== id);
                const newTodo = [...data.todo, dataUpdate];
                setData({
                    todo: newTodo,
                    done: newDone,
                });
            }
        } catch (error) {
            console.error('Error updating task:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    }

    const updateTaskPriority = async (id: string, task: Partial<TaskModel>) => {
        if (loading) return;
        setLoading(true);
        try {
            const token = getCookie("token");
            if (!token) {
                console.error('No token found');
                router.push('/login');
                return;
            }

            await apiFetch<BaseResponse<null>>(`/api/1.0/task/priority`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify({id: id, priority: task.priority, status: task.status}),
            });
            // Update the local state after successful API call
            if (task.status === 'done' && typeof task.priority === 'number') {
                const dataUpdate = data.done.findIndex(t => t._id === id);
                if (dataUpdate === -1) {
                    console.error('Task not found in done list');
                    return;
                }
                let newDone = [...data.done];
                if (dataUpdate > task.priority) {
                    const dataBefore = data.done.slice(0, task.priority);
                    const dataBetween = data.done.slice(task.priority, dataUpdate);
                    const dataAfter = data.done.slice(dataUpdate + 1);
                    newDone = [
                        ...dataBefore,
                        data.done[dataUpdate],
                        ...dataBetween,
                        ...dataAfter,
                    ].map((task, index) => ({
                        ...task,
                        priority: index,
                    }));
                } else if (dataUpdate < task.priority) {
                    const dataBefore = data.done.slice(0, dataUpdate);
                    const dataBetween = data.done.slice(dataUpdate + 1, task.priority + 1);
                    const dataAfter = data.done.slice(task.priority + 1);
                    newDone = [
                        ...dataBefore,
                        ...dataBetween,
                        data.done[dataUpdate],
                        ...dataAfter,
                    ].map((task, index) => ({
                        ...task,
                        priority: index,
                    }));
                }
                setData(prevData => ({
                    ...prevData,
                    done: newDone,
                }));
            } else if (task.status === 'todo' && typeof task.priority === 'number') {
                const dataUpdate = data.todo.findIndex(t => t._id === id);
                if (dataUpdate === -1) {
                    console.error('Task not found in todo list');
                    return;
                }
                let newTodo = [...data.todo];
                if (dataUpdate > task.priority) {
                    const dataBefore = data.todo.slice(0, task.priority);
                    const dataBetween = data.todo.slice(task.priority, dataUpdate);
                    const dataAfter = data.todo.slice(dataUpdate + 1);
                    newTodo = [
                        ...dataBefore,
                        data.todo[dataUpdate],
                        ...dataBetween,
                        ...dataAfter,
                    ].map((task, index) => ({
                        ...task,
                        priority: index,
                    }));
                } else if (dataUpdate < task.priority) {
                    const dataBefore = data.todo.slice(0, dataUpdate);
                    const dataBetween = data.todo.slice(dataUpdate + 1, task.priority + 1);
                    const dataAfter = data.todo.slice(task.priority + 1);
                    newTodo = [
                        ...dataBefore,
                        ...dataBetween,
                        data.todo[dataUpdate],
                        ...dataAfter,
                    ].map((task, index) => ({
                        ...task,
                        priority: index,
                    }));
                }
                setData(prevData => ({
                    ...prevData,
                    todo: newTodo,
                }));
            }

        } catch (error) {
            console.error('Error updating task priority:', error);
            throw error;
        } finally {
            setLoading(false);
        }

    }

    return {
        data,
        getTasks,
        addTask,
        updateTaskPriority,
        loading,
        setData,
        errorMessages,
        setErrorMessages,
        updateTask,
    };
}

export default useTask;