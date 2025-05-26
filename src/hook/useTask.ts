import {useState} from "react";
import {apiFetch, validateForm} from "@/lib";
import {getCookie} from "@/lib/cookie";
import {BaseResponse} from "@/model/ResponseModel";
import {useRouter} from "next/navigation";
import {ZodError} from "zod";
import {TaskFormData, TaskModel, TaskModelSchema} from "@/types/task";


const useTask = () => {
    const [data, setData] = useState<TaskModel[]>([]);
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
                setData(response.data || []);
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

    return {
        data,
        getTasks,
        addTask,
        loading,
        errorMessages,
        setErrorMessages,
    };
}

export default useTask;