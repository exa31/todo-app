// global.d.ts

export {};

declare global {
    interface Window {
        google: {
            accounts: {
                id: {
                    initialize: (params: {
                        client_id: string;
                        callback: (response: {
                            credential: string;
                        }) => void;
                    }) => void;
                    renderButton: (
                        parent: HTMLElement,
                        options: {
                            theme: 'outline' | 'filled_blue' | 'filled_black';
                            size: 'small' | 'medium' | 'large';
                            width?: string;
                        }
                    ) => void;
                    prompt: () => void;
                };
            };
        };
    }

    // eslint-disable-next-line no-var
    var mongoose: {
        conn: typeof mongoose | null;
        promise: Promise<mongoose.Mongoose> | null;
    };
}