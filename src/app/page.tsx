"use client"

import CardToDo from "@/components/UI/Card/CardToDo";
import {useEffect, useState} from "react";
import Modal from "@/components/UI/Modal";
import useTask from "@/hook/useTask";
import {TaskFormData} from "@/types/task";
import {toast} from "react-toastify";

export default function HomePage() {

    const [open, setOpen] = useState({
        add: false,
        edit: false,
    });
    const [formData, setFormData] = useState<TaskFormData>({
        title: "",
        description: "",
        status: "todo",
    })

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>, event: "add" | "edit") => {
        try {

            e.preventDefault();
            setErrorMessages(
                {
                    title: "",
                }
            )
            // Add your form submission logic here
            console.log("Form submitted:", formData);
            if (event === "add") {
                // Logic for adding a task
                console.log("Adding task:", formData);
                await addTask(formData)
                getTasks()
                toast.success("Task added successfully!");

                setOpen((prevState) => {
                    return {...prevState, add: false};
                });

            } else if (event === "edit") {
                // Logic for editing a task
                console.log("Editing task:", formData);
                setOpen((prevState) => {
                    return {...prevState, edit: false};
                });
            } else {
                console.error("Unknown event type:", event);
            }
        } catch (error) {
            console.error("Error submitting form:", error);
            toast.error("Failed to submit the form. Please try again.");
        }
    };

    const {data, updateTask, updateTaskPriority, getTasks, addTask, errorMessages, setErrorMessages} = useTask();

    useEffect(() => {
        getTasks();
    }, []);

    const handleUpdatePriority = async (id: string, status: "todo" | "done", priority: number) => {
        try {
            await updateTaskPriority(id, {
                status: status,
                priority: priority,
                _id: id,
            });
            toast.success("Task priority updated successfully!");
        } catch (error) {
            console.error("Error updating task priority:", error);
            toast.error("Failed to update task priority. Please try again.");
        }
    }

    const handleUpdateTask = async (id: string, status: "todo" | "done") => {
        try {
            await updateTask(id, {
                status: status,
                _id: id,
            });
            toast.success(`Task moved to ${status === "todo" ? "To Do" : "Done"} successfully!`);

        } catch (error) {
            console.error("Error updating task:", error);
            toast.error("Failed to update the task. Please try again.");
        }
    }

    return (
        <>
            {/*modal add*/}
            <Modal name={"add"} title={"add task"} size={"md"} isOpen={open.add}
                   handleClose={() => setOpen((prevState) => {
                       return {...prevState, add: false};
                   })}>
                <div>
                    <form onSubmit={(e) => handleSubmit(e, 'add')} className="flex flex-col gap-4">
                        <label htmlFor="title" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Title
                        </label>
                        <input
                            type="text"
                            id="title"
                            name="title"
                            placeholder="Enter task title"
                            value={formData.title}
                            onChange={(e) => setFormData((prevState) => {
                                return {...prevState, title: e.target.value};
                            })}
                            className="border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        {
                            errorMessages.title && (
                                <p className="text-red-500 text-sm">{errorMessages.title}</p>
                            )
                        }
                        <label htmlFor="description" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Description
                        </label>
                        <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={(e) => setFormData((prevState) => {
                                return {...prevState, description: e.target.value};
                            })}
                            className="border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter task description"
                        />
                        <button type="submit"
                                className="btn-primary px-5 py-2 rounded-lg mt-4">Add Task
                        </button>
                    </form>
                </div>
            </Modal>
            {/*modal edit*/}
            <Modal size={"md"} isOpen={open.edit} title={"edit task"} name={"edit"}
                   handleClose={() => setOpen((prevState) => {
                       return {...prevState, edit: false};
                   })}>
                as
            </Modal>
            <div
                className={"container mx-auto w-full px-3 my-10 space-y-10"}>
                <div className="flex items-center justify-center w-full">
                    <button
                        className="btn-primary px-5 py-2 rounded-lg "
                        onClick={() => setOpen((prevState) => {
                            setFormData(
                                {
                                    title: "",
                                    description: "",
                                    status: "todo",
                                }
                            )
                            return {...prevState, add: true};
                        })}
                    >
                        Add Task
                    </button>
                </div>
                <div className={"flex gap-10 overflow-x-hidden items-start h-full justify-between w-full"}>
                    <div id="todo"
                         className="space-y-10 relative min-w-32 grow w-full min-h-[720px] text-center
                            bg-gradient-to-br from-blue-100 to-blue-200 dark:from-gray-700 dark:to-gray-800
                            p-5 rounded-2xl shadow-md border border-blue-300
                            hover:shadow-lg transition-all duration-300">
                        <h1>
                            <span className="text-2xl font-bold text-gray-800 dark:text-white">To Do List</span>
                        </h1>
                        {
                            data && data.todo.length === 0 ? (
                                    <p className="text-gray-500">No tasks available</p>
                                ) :
                                data && data.todo.map((task) => (
                                    <CardToDo key={task._id} position="todo" title={task.title} id={task._id}
                                              handleUpdateTask={handleUpdateTask}
                                              handleUpdatePriority={handleUpdatePriority}
                                              priority={task.priority}
                                              description={task?.description}/>
                                ))
                        }
                    </div>

                    <div id="done"
                         className="space-y-10 relative min-w-32 grow w-full min-h-[720px] text-center
                         bg-gradient-to-br from-green-100 to-green-200 dark:from-gray-600 dark:to-gray-700
                         p-5 rounded-2xl shadow-md border border-green-300 dark:border-gray-500
                         hover:shadow-lg transition-all duration-300">
                        <h1>
                            <span className="text-2xl font-bold text-gray-800 dark:text-white">Done List</span>
                        </h1>
                        {
                            data && data.done.length === 0 ? (
                                    <p className="text-gray-500 dark:text-gray-300">No tasks available</p>
                                ) :
                                data && data.done.map((task) => (
                                    <CardToDo key={task._id} position="done" title={task.title} id={task._id}
                                              handleUpdateTask={handleUpdateTask}
                                              priority={task.priority}
                                              handleUpdatePriority={handleUpdatePriority}
                                              description={task?.description}/>
                                ))
                        }
                    </div>
                </div>
            </div>
        </>
    );
}
