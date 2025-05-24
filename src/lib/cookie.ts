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

export const setCookie = (name: string, value: string, days: number): void => {
    if (typeof document === 'undefined') {
        return; // Tidak bisa mengakses cookie di server-side
    }

    let expires = '';
    if (days) {
        const date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = `; expires=${date.toUTCString()}`;
    }

    document.cookie = `${name}=${value || ''}${expires}; path=/`;
}

export const removeCookie = (name: string): void => {
    if (typeof document === 'undefined') {
        return; // Tidak bisa mengakses cookie di server-side
    }

    document.cookie = `${name}=; Max-Age=0; path=/`;
}