import React, {useCallback, useEffect, useRef} from 'react';
import {IoCloseSharp} from 'react-icons/io5';

type ModalProps = {
    title: string;
    isOpen: boolean;
    handleClose: () => void;
    children: React.ReactNode;
    size?: "sm" | "md" | "lg" | "xs" | "xl" | "2xl" | "full";
    name: string;
}

const Modal: React.FC<ModalProps> = ({isOpen, handleClose, children, title, size, name}) => {
    const refModal = useRef<HTMLDivElement>(null);

    const sizeClass = useCallback(() => {
        switch (size) {
            case 'xs':
                return 'sm:w-1/5 w-full';         // 20%
            case 'sm':
                return 'xl:w-1/4 w-full';         // 25%
            case 'md':
                return 'sm:w-1/2 w-full';         // 50%
            case 'lg':
                return 'sm:w-3/4 w-full';         // 75%
            case 'xl':
                return 'sm:w-4/5 w-full';         // 80%
            case '2xl':
                return 'sm:w-[90%] w-full';       // 90%
            case 'full':
                return 'w-full h-screen';         // 100% width + full screen height
            default:
                return 'w-full';                  // Fallback
        }
    }, [size]);


    useEffect(() => {
        const handleOutSideClickModal = (e: MouseEvent) => {
            if (refModal.current && e.target === refModal.current) {
                handleClose()
            }
        };

        document.addEventListener("click", handleOutSideClickModal);

        return () => {
            document.removeEventListener("click", handleOutSideClickModal);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [name]);

    useEffect(() => {
        if (isOpen && refModal.current) {
            refModal.current.classList.remove('hidden');
            document.getElementsByTagName('body')[0].classList.add('overflow-hidden');
            refModal.current.style.display = 'flex';
        } else {
            refModal.current!.classList.remove('animate-fade-in');
            document.getElementsByTagName('body')[0].classList.remove('overflow-hidden');
            refModal.current!.classList.add('animate-fade-out');
            setTimeout(() => {
                refModal.current!.classList.remove('animate-fade-out');
                refModal.current!.style.display = 'none';
            }, 300);
        }

        if (!isOpen && refModal.current) {
            refModal.current.classList.add('hidden');
        }
    }, [isOpen])


    return (
        <>
            <div ref={refModal}
                 className={"modal hidden h-full w-full sm:p-0 z-50 bg-opacity-50 justify-center items-center " + (isOpen && 'animate-fade-in')}>
                <div className={'bg-white dark:bg-gray-800 m-auto rounded-xl mx-4 shadow-2xl ' + sizeClass()}>
                    <header className='sm:mx-5 pt-5'>
                        <div className='flex p-3 justify-between dark:border-white border-b '>
                            <h1 className='text-2xl font-bold capitalize dark:text-white text-black'>{title}</h1>
                            <button className={"hover:cursor-pointer"} onClick={handleClose}><IoCloseSharp
                                className='text-black dark:text-white hover:opacity-75 duration-300 transition-all text-3xl'/>
                            </button>
                        </div>
                    </header>
                    <div className="sm:mx-10 sm:px-3 px-10 py-10">
                        {children}
                    </div>
                </div>
            </div>
        </>
    );
};

export default Modal;