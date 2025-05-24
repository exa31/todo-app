import {Task} from "@/model/TaskModel";
import {useState} from "react";
import {apiFetch} from "@/lib";
import {getCookie} from "@/lib/cookie";
import {BaseResponse} from "@/model/ResponseModel";

const useTask = () => {
    const [data, setData] = useState<Task[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    const getTasks = async () => {
        if (loading) return;
        setLoading(true);
        try {
            const token = getCookie("token");
            if (!token) {
                console.error('No token found');
                return;
            }
            const response = await apiFetch<BaseResponse<Task[]>>('/api/1.0/task', {
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

    return {
        data,
        getTasks,
    };
}

export default useTask;