"use client";
import { useState, useEffect, createContext, useContext } from "react";
import {
    VerifiedOrganizer,
    Tokens,
    Organization,
} from "@/app/models/Organizers";
import { refreshToken } from "@/actions/auth";
import { cookies } from "next/headers";
import { useRouter } from "next/navigation";

const AuthContext = createContext<{
    user: Organization | null;
    tokens: Tokens | null;
    login: (verifiedUser: VerifiedOrganizer) => void;
    logout: () => void;
    getAccessToken: () => string | null;
    getRefreshToken: () => string | null;
    updateAccessToken: () => Promise<void>;
    updateUser: (updatedUserData: Partial<Organization>) => void;
} | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const [user, setUser] = useState<Organization | null>(null);
    const [tokens, setTokens] = useState<Tokens | null>(null);
    const router = useRouter()

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        const storedTokens = localStorage.getItem("tokens");

        if (storedUser && storedTokens) {
            try {
                setUser(JSON.parse(storedUser));
                setTokens(JSON.parse(storedTokens));
            } catch (error) {
                console.error("Error parsing stored auth data:", error);
                localStorage.removeItem("user");
                localStorage.removeItem("tokens");
            }
        }
    }, []);

    const login = (verifiedUser: VerifiedOrganizer) => {
        const { user, tokens } = verifiedUser;

        setUser(user);
        setTokens(tokens);

        console.log(user, tokens);

        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("tokens", JSON.stringify(tokens));
    };

    const logout = () => {
        setUser(null);
        setTokens(null);

        localStorage.removeItem("user");
        localStorage.removeItem("tokens");
        router.replace('/login');
    };

    const updateUser = (updatedUserData: Partial<Organization>) => {
        if (!user) return;
        
        const updatedUser = {
            ...user,
            ...updatedUserData
        };
        
        setUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));
    };

    const getAccessToken = () => {
        return tokens?.access || null;
    };

    const getRefreshToken = () => {
        return tokens?.refresh || null;
    };

    const updateAccessToken = async () => {
        const refresh = getRefreshToken();
        if (!refresh) {
            console.error("No refresh token available.");
            return;
        }

        try {
            await refreshToken(refresh);
            const updatedAccessToken = localStorage.getItem("accessToken");

            if (updatedAccessToken) {
                setTokens((prevTokens) => ({
                    ...prevTokens,
                    access: updatedAccessToken,
                    refresh: prevTokens?.refresh || "",
                }));
                console.log("Access token updated successfully.");
            } else {
                console.error("Failed to update access token.");
            }
        } catch (error) {
            console.error("Error updating access token:", error);
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                tokens,
                login,
                logout,
                getAccessToken,
                getRefreshToken,
                updateAccessToken,
                updateUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
