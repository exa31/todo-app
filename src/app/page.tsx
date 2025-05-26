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

    const {data, getTasks, addTask, errorMessages, setErrorMessages} = useTask();

    useEffect(() => {
        getTasks();
    }, []);

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
                className="grid relative overflow-hidden grid-rows-[20px_1fr_20px] items-center justify-items-center h-full p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
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
                <div id={"todo"}
                     className={`flex items-center justify-center `}>
                    <h1>
                        <span className="text-2xl font-bold text-center text-gray-800">To Do List</span>
                    </h1>
                    <CardToDo position={"todo"} title={'test 1'}/>
                    <CardToDo position={"todo"} title={'test 2'}/>
                    <CardToDo position={"todo"} title={'test 3'}/>
                    <CardToDo position={"todo"} title={'test 4'}/>
                </div>
                <div id={"done"}
                     className={`flex items-center justify-center `}>
                    <h1>
                        <span className="text-2xl font-bold text-center text-gray-800">Done List</span>
                    </h1>
                    <CardToDo position={"done"} title={'test 5'}/>
                    <CardToDo position={"done"} title={'test 6'}/>
                    <CardToDo position={"done"} title={'test 7'}/>
                    <CardToDo position={"done"} title={'test 8'}/>
                </div>

            </div>
        </>
    );
}
