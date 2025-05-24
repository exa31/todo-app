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
            removeCookie("token");
            return;
        }
        if (res.status === 403) {
            // Handle forbidden access
            throw new Error("Forbidden access");
        }
        if (res.status === 404) {
            // Handle not found
            throw new Error("Resource not found");
        }
        if (res.status === 400) {
            // Handle bad request
            const errorData = await res.json();
            throw new Error(`Bad request: ${errorData.message}`);
        }
        throw new Error(`API error: ${res.status}`);
    } else {
        return await res.json() as Promise<T>;
    }
}
