'use client';

import CardArchive from "@/components/UI/Card/CardArchive";
import useTask from "@/hook/useTask";
import {useEffect} from "react";
import {toast} from "react-toastify";

const ArchivePage = () => {

    const {dataArchived, getTasksArchived, deleteTask} = useTask()

    const handleDeleteTask = async (id: string) => {
        try {
            await deleteTask(id);
            toast.success("Task deleted successfully!");
            getTasksArchived()
        } catch (error) {
            console.error("Error deleting task:", error);
            toast.error("Failed to delete the task. Please try again.");
        }
    }

    useEffect(() => {
        getTasksArchived();
    }, []);

    return (
        <div className={'container mx-auto px-4 py-8'}>
            <h1 className={'text-center text-2xl text-black dark:text-white font-bold'}>Archive</h1>
            <div>
                {
                    dataArchived.length > 0 ? (
                        <div className={'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-8'}>
                            {dataArchived.map((task) => (
                                <CardArchive key={task._id} id={task._id} description={task.description}

                                             handleDeleteTask={handleDeleteTask}
                                             title={task.title}/>
                            ))}
                        </div>
                    ) : (
                        <p className={'text-center text-gray-500 mt-8'}>No archived tasks found.</p>
                    )
                }
            </div>
        </div>
    );
}

export default ArchivePage;