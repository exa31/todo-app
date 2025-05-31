'use client'

import {useEffect, useRef} from "react";
import useDebounce from "@/hook/useDebounce";

const CardToDo = ({
                      title,
                      handleUpdatePriority,
                      priority,
                      position,
                      description,
                      id,
                      handleUpdateTask,
                      handleEditTask,
                      handleDeleteTask,
                      handleArchiveTask
                  }: {
    title: string,
    id: string,
    position: "todo" | "done",
    description?: string,
    priority: number,
    handleUpdateTask: (id: string, status: "todo" | "done") => Promise<void>
    handleUpdatePriority: (id: string, status: "todo" | "done", priority: number) => Promise<void>
    handleEditTask: (id: string, status: "done" | "todo") => void
    handleDeleteTask: (id: string, status: "done" | "todo") => void
    handleArchiveTask: (id: string, status: "done" | "todo") => void
}) => {
    const startPos = useRef({x: 0, y: 0});
    const isDragging = useRef(false);
    const elementRef = useRef<HTMLDivElement>(null);
    const doneRef = useRef<HTMLDivElement>(null);
    const todoRef = useRef<HTMLDivElement>(null);
    const currentPosition = useRef<"todo" | "done">(position);
    const thisElementIndex = useRef<number>(-1);
    const debounceUpdatePosition = useDebounce(
        handleUpdatePriority,
        300
    )
    const handleMouseDown = (e: React.MouseEvent) => {
        isDragging.current = true;
        // simpan posisi awal mouse
        startPos.current = {x: e.clientX, y: e.clientY};
        thisElementIndex.current = Array.from(e.currentTarget.parentElement?.children || [])
            .filter((el) => el.classList.contains("card"))
            .indexOf(e.currentTarget as HTMLDivElement);
        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("mouseup", handleMouseUp);
    };

    const handleMouseMove = (e: MouseEvent) => {
        if (!isDragging.current || !elementRef.current) return;

// Hitung jarak mouse dari titik awal drag
        const deltaX = e.clientX - startPos.current.x;
        const deltaY = e.clientY - startPos.current.y;

// Ubah posisi dan tampilan elemen yang sedang di-drag
        elementRef.current.style.zIndex = "1000";
        elementRef.current.style.position = "sticky";
        elementRef.current.style.transform = `translate(${deltaX}px, ${deltaY}px)`;

// Logika pemindahan urutan
        if (position === "done" && doneRef.current) {
            const allChildren = Array.from(doneRef.current.children);
            const siblingsCard = allChildren.filter(
                (el) => el.classList.contains("card")
            );

            const currentEl = elementRef.current;
            const currentIndex = siblingsCard.indexOf(currentEl); // ambil posisi sekarang dalam siblingsCard

            const someIsHitted = siblingsCard.findIndex((sibling) => {
                if (sibling === currentEl) return false; // skip self
                const rect = sibling.getBoundingClientRect();
                return (
                    e.clientY >= rect.top &&
                    e.clientY <= rect.bottom &&
                    e.clientX >= rect.left &&
                    e.clientX <= rect.right
                );
            });

            if (someIsHitted !== -1 && currentIndex !== someIsHitted) {
                // Update posisi drag awal supaya tidak loncat saat looping
                startPos.current = {
                    x: e.clientX,
                    y: e.clientY,
                };

                const refParent = doneRef.current;

                // Pindah DOM elemen
                if (currentIndex > someIsHitted) {
                    refParent.insertBefore(currentEl, siblingsCard[someIsHitted]);
                } else {
                    refParent.insertBefore(currentEl, siblingsCard[someIsHitted + 1] || null);
                }

                debounceUpdatePosition(id, "done", someIsHitted);
                thisElementIndex.current = someIsHitted;
            }
        } else if (position === "todo" && todoRef.current) {
            const allChildren = Array.from(todoRef.current.children);
            const siblingsCard = allChildren.filter(
                (el) => el.classList.contains("card")
            );

            const currentEl = elementRef.current;
            const currentIndex = siblingsCard.indexOf(currentEl); // ambil posisi sekarang dalam siblingsCard

            const someIsHitted = siblingsCard.findIndex((sibling) => {
                if (sibling === currentEl) return false; // skip self
                const rect = sibling.getBoundingClientRect();
                return (
                    e.clientY >= rect.top &&
                    e.clientY <= rect.bottom &&
                    e.clientX >= rect.left &&
                    e.clientX <= rect.right
                );
            });

            if (someIsHitted !== -1 && currentIndex !== someIsHitted) {
                // Update posisi drag awal supaya tidak loncat saat looping
                startPos.current = {
                    x: e.clientX,
                    y: e.clientY,
                };

                const refParent = todoRef.current;

                // Pindah DOM elemen
                if (currentIndex > someIsHitted) {
                    refParent.insertBefore(currentEl, siblingsCard[someIsHitted]);
                } else {
                    refParent.insertBefore(currentEl, siblingsCard[someIsHitted + 1] || null);
                }

                debounceUpdatePosition(id, "todo", someIsHitted);
                thisElementIndex.current = someIsHitted;
            }
        }
    };

    useEffect(() => {
        const element = elementRef.current;
        if (element) {
            startPos.current = {x: element.getBoundingClientRect().left, y: element.getBoundingClientRect().top};
            if (position === "done") {
                element.classList.add("bg-green-500", "dark:bg-green-600");
            } else {
                element.classList.add("bg-red-600", "dark:bg-red-500");
            }
        }
        todoRef.current = document.getElementById('todo') as HTMLDivElement;
        doneRef.current = document.getElementById('done') as HTMLDivElement;
    }, []);

    const handleMouseUp = async (e: MouseEvent) => {
        isDragging.current = false;

        if (elementRef.current) {
            // check parent element have id done
            const parentElement = document.elementsFromPoint(e.clientX, e.clientY);
            const isToDone = parentElement.some((el) => el.id === "done");
            const isToTodo = parentElement.some((el) => el.id === "todo");
            if (isToDone && currentPosition.current === "todo") {
                if (doneRef.current) {
                    currentPosition.current = "done";
                    elementRef.current.style.zIndex = "0";
                    await handleUpdateTask(id, "done");
                    // elementRef.current.style.transform = `translate(${0}px, ${0}px)`;
                    // doneRef.current.appendChild(elementRef.current);
                }
            } else if (isToTodo && currentPosition.current === "done") {
                if (todoRef.current) {
                    currentPosition.current = "todo";
                    elementRef.current.style.zIndex = "0";
                    await handleUpdateTask(id, "todo");
                    // elementRef.current.style.transform = `translate(${0}px, ${0}px)`;
                    // todoRef.current.appendChild(elementRef.current);
                }
            } else {
                elementRef.current.style.zIndex = "0";
                // reset posisi terakhir
                elementRef.current.style.transform = `translate(${0}px, ${0}px)`;
            }
        }

        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
    };


    return (
        <div
            onMouseDown={handleMouseDown}
            ref={elementRef}
            draggable={false}
            data-id={id}
            className="mx-auto card z-0 rounded-xl shadow-md border border-gray-300 dark:border-gray-600
           hover:scale-105 bg-white dark:bg-gray-700 px-3 py-2
               font-semibold text-gray-800 dark:text-gray-100 h-full min-h-36 min-w-22 w-full"
            style={{
                cursor: "grab",
                userSelect: "none",
            }}
        >
            <h3 draggable={false} className={"text-lg font-bold text-gray-800 dark:text-gray-100"}>
                {title}
            </h3>
            {description && (
                <p draggable={false} className="text-sm text-start text-gray-600 dark:text-gray-300">
                    {description}
                </p>
            )}
            <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-black dark:text-white">Priority: {priority + 1}</span>
                <button
                    onClick={() => handleUpdatePriority(id, position, priority ? priority + 1 : 1)}
                    className="btn-secondary px-2 py-1 rounded-lg text-xs"
                >
                    Increase Priority
                </button>

                <button
                    onClick={() => handleUpdateTask(id, position === "todo" ? "done" : "todo")}
                    className="btn-primary px-2 py-1 rounded-lg text-xs"
                >
                    {position === "todo" ? "Mark as Done" : "Reopen Task"}
                </button>
            </div>
            <div className="flex items-center justify-between mt-2">
                <button
                    onClick={() => handleEditTask(id, position)}
                    className="btn-secondary px-2 py-1 rounded-lg text-xs"
                >
                    Edit
                </button>
                <button
                    onClick={() => handleArchiveTask(id, position)}
                    className="btn-secondary px-2 py-1 rounded-lg text-xs"
                >
                    Archive
                </button>
                <button
                    onClick={() => handleDeleteTask(id, position)}
                    className="btn-warning px-2 py-1 rounded-lg text-xs"
                >
                    Remove
                </button>
            </div>
        </div>
    );
}

export default CardToDo;