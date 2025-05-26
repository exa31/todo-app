import {createContext} from "react";

export type AuthData = {
    isAuth: boolean;
    email: string;
    name: string;
};

interface AuthContextType {
    user: AuthData | undefined;
    setAuth: React.Dispatch<React.SetStateAction<AuthData | undefined>>;
}

export const AuthProvider = createContext<AuthContextType | null>(null);
