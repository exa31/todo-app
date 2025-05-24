export const getCookie = (name: string): string | null => {
    if (typeof document === 'undefined') {
        return null; // Tidak bisa mengakses cookie di server-side
    }

    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);

    if (parts.length === 2) {
        return parts.pop()?.split(';').shift() || null;
    }

    return null;
}