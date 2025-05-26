import {ZodSchema} from "zod";
import {removeCookie} from "@/lib/cookie";

export const validateForm = async <T>(values: T, schema: ZodSchema) => {
    await schema.parseAsync(values);
};

export async function apiFetch<T>(path: string, options?: RequestInit) {
    const res = await fetch(`${path}`, {
        ...options,
        headers: {
            ...(options?.headers || {})
        }
    });

    if (!res.ok) {
        if (res.status === 401) {
            // Handle unauthorized access, e.g., redirect to login
            console.log("Unauthorized access, removing token cookie");
            removeCookie("token");
            return;
        }
        if (res.status === 403) {
            // Handle forbidden access
            console.log("Forbidden access, throwing error");
            throw new Error("Forbidden access");
        }
        if (res.status === 404) {
            // Handle not found
            console.log("Resource not found, throwing error");
            throw new Error("Resource not found");
        }
        if (res.status === 400) {
            // Handle bad request
            console.log("Bad request, throwing error");
            const errorData = await res.json();
            throw new Error(`Bad request: ${errorData.message}`);
        }
        // Handle other errors
        console.log(`API error with status ${res.status}, throwing error`);
        throw new Error(`API error: ${res.status}`);
    } else {
        return await res.json() as Promise<T>;
    }
}
