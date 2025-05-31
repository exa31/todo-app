type CardArchiveProps = {
    title: string;
    description?: string;
    handleDeleteTask: (id: string) => void;
    id: string;
}

const CardArchive: React.FC<CardArchiveProps> = ({title, id, description, handleDeleteTask}) => {
    return (
        <div className="bg-white gap-5 flex flex-col dark:bg-gray-800 shadow-md rounded-lg p-4 mb-4">
            <div className={"grow"}>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
                <p className="text-gray-700 wrap-break-word dark:text-gray-300">{description}</p>
            </div>
            <button
                onClick={() => handleDeleteTask(id)}
                className="btn-warning px-2 py-1 rounded-lg text-xs"
            >
                Remove
            </button>
        </div>

    );
}

export default CardArchive;