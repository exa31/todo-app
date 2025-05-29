import {useRef} from "react";

const useDebounce = <
    T extends (...args: never[]) => void // gunakan any[] di sini agar lebih fleksibel
>(
    callback: T,
    delay: number
): ((...args: Parameters<T>) => void) => {
    const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

    return (...args: Parameters<T>) => {
        if (timer.current) clearTimeout(timer.current);
        timer.current = setTimeout(() => {
            callback(...args);
        }, delay);
    };
};

export default useDebounce;
