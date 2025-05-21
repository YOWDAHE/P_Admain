import axios from "axios";
import {
    CategoryCreationSchema,
    CategoryCreationResponseSchema,
    newCategioryType,
    CategoryCreationResponseType,
    PaginatedCategoryType,
    PaginatedCategorySchema,
} from "@/app/models/Categories";
import { z } from "zod";

const BASE_URL = "https://www.mindahun.pro.et/api/v1";

export async function createCategory(
    data: newCategioryType,
    token: string
): Promise<CategoryCreationResponseType> {
    try {
        const validatedData = CategoryCreationSchema.parse(data);

        console.log("Base url: ", BASE_URL);
        const response = await axios.post(`${BASE_URL}/categories/`, validatedData, {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
        });

        return CategoryCreationResponseSchema.parse(response.data);
    } catch (error: any) {
        console.error("Error creating category:", error);
        throw new Error(
            error.response?.data?.message || "An unexpected error occurred"
        );
    }
}

// Fetch a category by ID
export async function fetchCategory(
    id: number,
    token: string
): Promise<CategoryCreationResponseType> {
    try {
        const response = await axios.get(`${BASE_URL}/categories/${id}/`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        return CategoryCreationResponseSchema.parse(response.data);
    } catch (error: any) {
        console.error("Error fetching category:", error);
        throw new Error(
            error.response?.data?.message || "An unexpected error occurred"
        );
    }
}

// Update a category by ID
export async function updateCategory(
    id: number,
    data: newCategioryType,
    token: string
): Promise<CategoryCreationResponseType> {
    try {
        const validatedData = CategoryCreationSchema.parse(data);

        const response = await axios.put(
            `${BASE_URL}/categories/${id}/`,
            validatedData,
            {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        return CategoryCreationResponseSchema.parse(response.data);
    } catch (error: any) {
        console.error("Error updating category:", error);
        throw new Error(
            error.response?.data?.message || "An unexpected error occurred"
        );
    }
}

// Partially update a category by ID
export async function partialUpdateCategory(
    id: number,
    data: Partial<newCategioryType>,
    token: string
): Promise<CategoryCreationResponseType> {
    try {
        const response = await axios.patch(`${BASE_URL}/categories/${id}/`, data, {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
        });

        return CategoryCreationResponseSchema.parse(response.data);
    } catch (error: any) {
        console.error("Error partially updating category:", error);
        throw new Error(
            error.response?.data?.message || "An unexpected error occurred"
        );
    }
}

// Delete a category by ID
export async function deleteCategory(id: number, token: string): Promise<void> {
    try {
        await axios.delete(`${BASE_URL}/categories/${id}/`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
    } catch (error: any) {
        console.error("Error deleting category:", error);
        throw new Error(
            error.response?.data?.message || "An unexpected error occurred"
        );
    }
}

// Fetch all categories for an organizer
export async function fetchCategoriesByOrganizer(
    organizerId: number,
    token: string
): Promise<PaginatedCategoryType> {
    try {
        const response = await axios.get(
            `${BASE_URL}/organizations/${organizerId}/categories/`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        return PaginatedCategorySchema.parse(response.data);
    } catch (error: any) {
        console.error("Error fetching categories:", error);
        throw new Error(
            error.response?.data?.message || "An unexpected error occurred"
        );
    }
}
