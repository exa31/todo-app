'use client';


import {useEffect, useState} from 'react';
import {BaseResponse} from "@/model/ResponseModel";
import {toast} from "react-toastify";
import {useRouter} from "next/navigation";


type Sparkle = {
    id: number;
    left: number;
    startTime: number;
    color: string;
};

export default function LoginPage() {

    const [sparkles, setSparkles] = useState<Sparkle[]>([]);
    const router = useRouter()

    useEffect(() => {
        if (typeof window !== 'undefined' && window.google) {
            window.google.accounts.id.initialize({
                client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
                callback: handleCredentialResponse,
            });

            window.google.accounts.id.renderButton(
                document.getElementById('google-login-button')!,
                {
                    theme: "filled_blue", // <- ini untuk dark mode

                    size: 'large',
                }
            );
        }

        // Generate sparkles on component mount
    }, []);

    // Buat sparkle baru setiap 100ms
    useEffect(() => {
        const interval = setInterval(() => {
            const newSparkle: Sparkle = {
                id: Date.now(),
                left: Math.random() * 99, // posisi horizontal acak
                startTime: Date.now(),
                color: `hsl(${Math.random() * 360}, 100%, 50%)`, // warna acak
            };
            setSparkles((prev) => [...prev, newSparkle]);
        }, 100);

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const cleanupInterval = setInterval(() => {
            setSparkles((prev) =>
                prev.filter((sparkle) => Date.now() - sparkle.startTime < 3000)
            );
        }, 500);
        return () => clearInterval(cleanupInterval);
    }, []);

    const handleCredentialResponse = async (response: {
        credential: string;
    }) => {
        const res = await fetch('/api/1.0/auth/google', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({credential: response.credential}),
        });
        if (!res.ok) {
            const errorData: BaseResponse<null> = await res.json();
            console.error('Login failed:', errorData);
            toast.error(errorData.message);
            return;
        } else {
            const data: BaseResponse<null> = await res.json();
            console.log('Login successful:', data);
            toast.success(data.message);
            router.replace('/')
            // Redirect or perform any other action after successful login

        }


    };

    return (
        <div className="container overflow-hidden flex-1 m-auto flex items-center justify-center">
            <div
                className={"p-20 gap-10 z-50 bg-white duration-300 shadow-2xl transition-all dark:bg-gray-800 rounded-lg flex flex-col items-center justify-center relative"}>
                <h1 className="text-4xl font-bold dark:text-white text-black text-center mb-4">
                    Sign in or Sign up with Google
                </h1>
                <div id="google-login-button"></div>
            </div>
            {sparkles.map((sparkle) => (
                <div
                    key={sparkle.id}
                    style={{
                        position: "absolute",
                        left: `${sparkle.left}%`,
                        bottom: 0,
                        width: "10px",
                        height: "10px",
                        backgroundColor: sparkle.color,
                        borderRadius: "50%",
                        zIndex: 1,
                        animation: "moveUp 60s linear forwards",
                        filter: "drop-shadow(0 0 4px rgba(255, 255, 255, 0.5))",
                    }}
                />
            ))}
        </div>
    );
}
