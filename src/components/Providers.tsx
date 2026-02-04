"use client";

import { AuthProvider } from "@/context/AuthContext";
import { Toaster } from "sonner";

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <AuthProvider>
            <Toaster position="top-center" richColors />
            {children}
        </AuthProvider>
    );
}
