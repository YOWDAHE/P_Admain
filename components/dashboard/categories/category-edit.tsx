"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { fetchCategory, updateCategory } from "@/actions/category.action";
import { CategoryCreationResponseType } from "@/app/models/Categories";

interface CategoryEditFormProps {
  categoryId: number;
}

export function CategoryEditForm({ categoryId }: CategoryEditFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { getAccessToken } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<{
    name: string;
    description: string;
  }>({
    name: "",
    description: "",
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategoryDetails = async () => {
      setIsLoading(true);
      setError(null);

      const accessToken = getAccessToken();
      if (!accessToken) {
        setError("No access token available.");
        toast({
          title: "Error",
          description: "No access token available.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      try {
        const category: CategoryCreationResponseType = await fetchCategory(
          categoryId,
          accessToken
        );
        setFormData({
          name: category.name,
          description: category.description || "",
        });
      } catch (err: any) {
        setError(err.message || "Failed to fetch category details.");
        toast({
          title: "Error",
          description: err.message || "Failed to fetch category details.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategoryDetails();
  }, [categoryId, getAccessToken, toast]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const accessToken = getAccessToken();
    if (!accessToken) {
      setError("No access token available.");
      toast({
        title: "Error",
        description: "No access token available.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    try {
      await updateCategory(categoryId, formData, accessToken);
      toast({
        title: "Success",
        description: "Category updated successfully.",
      });
      router.push("/dashboard/categories");
    } catch (err: any) {
      setError(err.message || "Failed to update category.");
      toast({
        title: "Error",
        description: err.message || "Failed to update category.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-destructive/15 text-destructive p-3 rounded-md text-sm">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="name">Category Name *</Label>
        <Input
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Enter category name"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
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
          {isLoading ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </form>
  );
}
