"use client";

import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import Link from "next/link";
import { CategoriesTable } from "@/components/dashboard/categories/categories-table";
import { useAuth } from "@/hooks/use-auth";
import { useEffect, useState } from "react";
import { CategoryCreationResponseType } from "@/app/models/Categories";
import { fetchCategoriesByOrganizer } from "@/actions/category.action";

export default function CategoriesPage() {
	const { getAccessToken, user } = useAuth();
	const [categories, setCategories] = useState<
		CategoryCreationResponseType[] | null
	>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchCategories = async () => {
			setIsLoading(true);
			setError(null);

			const accessToken = getAccessToken();
			if (!accessToken) {
				setError("No access token available.");
				setIsLoading(false);
				return;
			}

			if (!user || !user.id) {
				setError("No user or organization ID available.");
				setIsLoading(false);
				return;
			}

			try {
				const response = await fetchCategoriesByOrganizer(user.id, accessToken);
				setCategories(response.results);
			} catch (err: any) {
				setError(err.message || "Failed to fetch categories.");
			} finally {
				setIsLoading(false);
			}
		};

		fetchCategories();
	}, [getAccessToken, user]);

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<h1 className="text-3xl font-bold">Categories</h1>
				<Button asChild>
					<Link href="/dashboard/categories/new">
						<PlusCircle className="mr-2 h-4 w-4" />
						New Category
					</Link>
				</Button>
			</div>

			{isLoading || categories == null ? (
				<p>Loading categories...</p>
			) : error ? (
				<p className="text-red-500">{error}</p>
			) : categories?.length === 0 ? (
				<div className="bg-white p-6 h-[300px] flex flex-col items-center justify-center rounded shadow-md text-center text-gray-500">
					<p>No categories found.</p>
					<p>Click "New Category" to create one.</p>
				</div>
			) : (
				<CategoriesTable categories={categories} />
			)}
		</div>
	);
}
