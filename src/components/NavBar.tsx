'use client'

import useToggleTheme from "@/hook/useToggleTheme";
import {FaRegMoon} from "react-icons/fa";
import {GoSun} from "react-icons/go";
import {getCookie, removeCookie} from "@/lib/cookie";
import {useContext, useEffect, useRef, useState} from "react";
import {usePathname, useRouter} from "next/navigation";
import {AuthProvider} from "@/context";
import {jwtDecode} from "jwt-decode";
import {payloadJwt} from "@/types";
import Link from "next/link";
import {CgMenu} from "react-icons/cg";
import {IoMdClose} from "react-icons/io";

const NavBar = () => {
    const {toggleTheme, theme} = useToggleTheme();
    const router = useRouter();
    const route = usePathname();
    const auth = useContext(AuthProvider)
    const sideBarElement = useRef<HTMLDivElement>(null);
    const [showSideBar, setShowSideBar] = useState(false);

    const handleLogout = () => {
        removeCookie("token");
        auth?.setAuth(undefined);
        router.replace("/login");
    }

    useEffect(() => {
        // Initialize Google Sign-In if needed
        if (typeof window !== 'undefined') {
            const token = getCookie("token");
            if (token) {
                const payload = jwtDecode<payloadJwt>(token)
                // If token exists, set the auth state
                auth?.setAuth({
                    isAuth: true,
                    email: payload.email || "",
                    name: payload.name || "",
                });
            } else {
                // If no token, ensure auth state is cleared
                auth?.setAuth(undefined);
                router.replace("/login");
            }
        }
    }, []);

    useEffect(() => {
        // Close sidebar when clicking outside
        const handleClickOutside = (event: MouseEvent) => {
            if (sideBarElement.current && !sideBarElement.current.contains(event.target as Node)) {
                setShowSideBar(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <>
            <nav className="bg-gray-200 sticky top-0 w-full transition-all duration-300 z-50 dark:bg-gray-800 p-4">
                <div className="container mx-auto z-50 flex justify-between items-center">
                    <h1 className={"text-4xl font-bold text-black dark:text-white"}>ETodo</h1>
                    {/*width > screen small*/}
                    <div className={"flex z-50 items-center justify-between gap-10"}>
                        <div className="sm:flex hidden items-center justify-between">
                            {
                                auth?.user?.isAuth &&
                                <>
                                    <Link href={'/'} className={route === '/' ? "link-active" : "link"}>
                                        Home
                                    </Link>
                                    <Link href={'/archive'} className={route === '/archive' ? "link-active" : "link"}>
                                        Archive
                                    </Link>
                                </>
                            }
                        </div>
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
                            auth?.user?.isAuth
                            && <button onClick={handleLogout}
                                       className={"btn-danger sm:block hidden px-5 py-2 rounded-xl font-semibold"}>Logout</button>
                        }
                        {
                            showSideBar ?
                                <IoMdClose onClick={() => setShowSideBar(false)}
                                           className={"text-black sm:hidden block dark:text-white text-2xl hover:cursor-pointer"}/>
                                :
                                <CgMenu onClick={() => setShowSideBar(true)}
                                        className={"text-black sm:hidden block dark:text-white text-2xl hover:cursor-pointer"}/>
                        }
                    </div>

                </div>
            </nav>
            {/*    width < screen small*/}
            <div
                ref={sideBarElement}
                className={"bg-gray-200 sm:hidden ps-1 space-y-2 dark:bg-gray-800 w-36 z-20 top-0 pt-16 left-0 space-x-4 h-screen fixed duration-300 transition-all" + (showSideBar ? " translate-x-0" : " -translate-x-full")}>
                <Link href={'/'} className={route === '/' ? "side-link-active" : "side-link"}>
                    Home
                </Link>
                <Link href={'/archive'} className={route === '/archive' ? "side-link-active" : "side-link"}>
                    Archive
                </Link>
            </div>
        </>
    );
};

export default NavBar;
