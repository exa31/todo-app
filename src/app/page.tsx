import CardToDo from "@/components/UI/Card/CardToDo";

export default function HomePage() {
    return (
        <div
            className="grid relative overflow-hidden grid-rows-[20px_1fr_20px] items-center justify-items-center h-full p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
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
    );
}
