"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { createCategory } from "@/actions/category.action";

export function CategoryForm() {
    const router = useRouter();
    const { toast } = useToast();
    const { getAccessToken } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        const formData = new FormData(e.currentTarget);
        const name = formData.get("name") as string;
        const description = formData.get("description") as string;

        try {
            
            const token = getAccessToken();
            console.log("Token: ", token);
            if (!token) {
                throw new Error("You are not authorized to perform this action.");
            }

            const result = await createCategory(
                { name, description },
                token
            );

            toast({
                title: "Success",
                description: "Category created successfully",
            });
            router.push("/dashboard/categories");
        } catch (err: any) {
            setError(err.message || "An error occurred while creating the category");
            toast({
                title: "Error",
                description: err.message || "Failed to create category. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
                <div className="bg-destructive/15 text-destructive p-3 rounded-md text-sm">
                    {error}
                </div>
            )}

            <div className="space-y-2">
                <Label htmlFor="name">Category Name *</Label>
                <Input id="name" name="name" placeholder="Enter category name" required />
            </div>

            <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                    id="description"
                    name="description"
                    placeholder="Enter category description"
                    rows={5}
                />
            </div>

            <div className="flex justify-end space-x-4">
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push("/dashboard/categories")}
                >
                    Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Creating..." : "Create Category"}
                </Button>
            </div>
        </form>
    );
}
