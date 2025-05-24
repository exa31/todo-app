'use client'

import useToggleTheme from "@/hook/useToggleTheme";
import {FaRegMoon} from "react-icons/fa";
import {GoSun} from "react-icons/go";
import {getCookie, removeCookie} from "@/lib/cookie";
import Link from "next/link";
import {useEffect, useState} from "react";
import {useRouter} from "next/navigation";

const NavBar = () => {
    const {toggleTheme, theme} = useToggleTheme();
    const router = useRouter();
    const [isAuth, setIsAuth] = useState<boolean>(false);

    const handleLogout = () => {
        removeCookie("token");
        setIsAuth(false);
        router.replace("/login");
    }

    useEffect(() => {
        const token = getCookie("token");
        setIsAuth(!!token);
    }, []);

    return (
        <nav className="bg-gray-200 sticky top-0 w-full transition-all duration-300 z-50 dark:bg-gray-800 p-4">
            <div className="container mx-auto flex justify-between items-center">
                <h1 className={"text-4xl font-bold text-black dark:text-white"}>ETodo</h1>
                <div className={"flex items-center justify-between gap-10"}>
                    {
                        theme === 'dark'
                            ? <button
                                className="text-white rounded duration-300 transition-all hover:cursor-pointer"
                                onClick={toggleTheme}
                            >
                                <GoSun className={"text-2xl"}/>
                            </button>
                            : <button
                                className="text-black rounded duration-300 transition-all hover:cursor-pointer"
                                onClick={toggleTheme}
                            >
                                <FaRegMoon className={"text-2xl"}/>
                            </button>
                    }
                    {
                        isAuth
                            ? <button onClick={handleLogout}
                                      className={"btn-danger px-5 py-2 rounded-xl font-semibold"}>Logout</button>
                            : <Link className={"btn-primary px-5 py-2 rounded-xl font-semibold"}
                                    href={'/login'}>Login</Link>
                    }
                </div>
            </div>
        </nav>
    );
};

export default NavBar;
