'use client'

import {useEffect, useRef} from "react";

const CardToDo = ({title, position}: { title: string, position: "todo" | "done" }) => {
    const startPos = useRef({x: 0, y: 0});
    const isDragging = useRef(false);
    const elementRef = useRef<HTMLDivElement>(null);
    const doneRef = useRef<HTMLDivElement>(null);
    const todoRef = useRef<HTMLDivElement>(null);
    const currentPosition = useRef<"todo" | "done">(position);

    const handleMouseDown = (e: React.MouseEvent) => {
        isDragging.current = true;
        // simpan posisi awal mouse
        startPos.current = {x: e.clientX, y: e.clientY};
        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("mouseup", handleMouseUp);
    };

    const handleMouseMove = (e: MouseEvent) => {
        if (!isDragging.current) return;
        if (!elementRef.current) return;

        // jarak mouse dari posisi awal
        const deltaX = e.clientX - startPos.current.x;
        const deltaY = e.clientY - startPos.current.y;

        // jarak mouse dari posisi terakhir
        const newX = deltaX;
        const newY = deltaY;
        if (elementRef.current) {
            elementRef.current.style.transform = `translate(${newX}px, ${newY}px)`;
        }
    };

    useEffect(() => {
        const element = elementRef.current;
        if (element) {
            startPos.current = {x: element.getBoundingClientRect().left, y: element.getBoundingClientRect().top};
            if (position === "done") {
                element.style.background = "#22c55e"; // green for done
            } else {
                element.style.background = "#c52222"; // red for todo
            }
        }
        todoRef.current = document.getElementById('todo') as HTMLDivElement;
        doneRef.current = document.getElementById('done') as HTMLDivElement;
    }, []);

    const handleMouseUp = (e: MouseEvent) => {
        isDragging.current = false;

        if (elementRef.current) {
            // check parent element have id done
            const parentElement = document.elementsFromPoint(e.clientX, e.clientY);
            const isToDone = parentElement.some((el) => el.id === "done");
            const isToTodo = parentElement.some((el) => el.id === "todo");
            if (isToDone && currentPosition.current === "todo") {
                console.log("masuk done");
                if (doneRef.current) {
                    elementRef.current.style.transform = `translate(${0}px, ${0}px)`;
                    doneRef.current.appendChild(elementRef.current);
                    elementRef.current.style.background = "#22c55e";
                    currentPosition.current = "done";
                }
            } else if (isToTodo && currentPosition.current === "done") {

                console.log("masuk todo");
                if (todoRef.current) {
                    currentPosition.current = "todo";
                    elementRef.current.style.transform = `translate(${0}px, ${0}px)`;
                    elementRef.current.style.background = "#c52222";
                    todoRef.current.appendChild(elementRef.current);
                }
            } else {
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
            style={{
                width: 150,
                height: 100,
                cursor: "grab",
                userSelect: "none",
            }}
        >
            {title}
        </div>
    );
}

export default CardToDo;