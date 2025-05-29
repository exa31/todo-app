'use client';

import {Geist, Geist_Mono} from "next/font/google";
import "./globals.css";
import NavBar from "@/components/NavBar";
import {ToastContainer} from "react-toastify";
import {AuthData, AuthProvider} from "@/context";
import {useState} from "react";
import {usePathname} from "next/navigation";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {

    const [auth, setAuth] = useState<AuthData | undefined
    >(undefined)
    const route = usePathname()

    return (
        <html className={"dark"} lang="en">
        <head>
            <script src="https://accounts.google.com/gsi/client" async defer></script>
        </head>
        <body
            className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col `}
        >
        <AuthProvider.Provider value={{user: auth, setAuth}}>
            {
                !route.startsWith('/login') &&
                <NavBar/>
            }
            <ToastContainer/>
            <div className={"bg-gray-400 grow h-full duration-300 transition-all dark:bg-gray-600"}>
                {children}
            </div>
        </AuthProvider.Provider>
        </body>
        </html>
    );
}
