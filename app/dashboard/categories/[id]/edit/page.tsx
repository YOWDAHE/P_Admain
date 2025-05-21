"use client";

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { CategoryEditForm } from "@/components/dashboard/categories/category-edit";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/components/ui/use-toast";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { CategoryCreationResponseType } from "@/app/models/Categories";
import { fetchCategory } from "@/actions/category.action";

export default function EditCategoryPage() {
    const { getAccessToken } = useAuth();
    const toast = useToast();
    const router = useRouter();
    const params = useParams();
    const categoryId = parseInt(Array.isArray(params?.id) ? params.id[0] : params?.id || "", 10);

    const [category, setCategory] = useState<CategoryCreationResponseType | null>(
        null
    );
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchCategoryDetails = async () => {
            const accessToken = getAccessToken();
            if (!accessToken) {
                toast.toast({
                    title: "Error",
                    description: "No access token available.",
                    variant: "destructive",
                });
                router.push("/dashboard/categories");
                return;
            }

            if (isNaN(categoryId)) {
                toast.toast({
                    title: "Error",
                    description: "Invalid category ID.",
                    variant: "destructive",
                });
                router.push("/dashboard/categories");
                return;
            }

            try {
                const categoryData = await fetchCategory(categoryId, accessToken);
                setCategory(categoryData);
            } catch (err: any) {
                setError(err.message || "Failed to fetch category details.");
                toast.toast({
                    title: "Error",
                    description: err.message || "Failed to fetch category details.",
                    variant: "destructive",
                });
                router.push("/dashboard/categories");
            } finally {
                setIsLoading(false);
            }
        };

        fetchCategoryDetails();
    }, [categoryId, getAccessToken, toast, router]);

    if (isLoading) {
        return <p>Loading...</p>;
    }

    if (error) {
        return <p className="text-red-500">{error}</p>;
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Edit Category</h1>

            <Card>
                <CardHeader>
                    <CardTitle>Category Details</CardTitle>
                    <CardDescription>Update the details of your category.</CardDescription>
                </CardHeader>
                <CardContent>
                    {category && <CategoryEditForm categoryId={categoryId} />}
                </CardContent>
            </Card>
        </div>
    );
}
