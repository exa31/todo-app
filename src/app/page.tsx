"use client"

import CardToDo from "@/components/UI/Card/CardToDo";
import {useEffect, useState} from "react";
import Modal from "@/components/UI/Modal";
import useTask from "@/hook/useTask";

export default function HomePage() {

    const [open, setOpen] = useState({
        add: false,
        edit: false,
    });

    const {data, getTasks} = useTask();

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
                    <form className="flex flex-col gap-4">
                        <label htmlFor="title" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Title
                        </label>
                        <input
                            type="text"
                            id="title"
                            name="title"
                            className="border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />

                        <label htmlFor="description" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Description
                        </label>
                        <textarea
                            id="description"
                            name="description"
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
