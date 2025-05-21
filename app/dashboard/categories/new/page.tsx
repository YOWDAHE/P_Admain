import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CategoryForm } from "@/components/dashboard/categories/category-form"

export default function NewCategoryPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Create New Category</h1>

      <Card>
        <CardHeader>
          {/* <CardTitle>Category Details</CardTitle> */}
          <CardDescription>Fill in the details below to create a new category.</CardDescription>
        </CardHeader>
        <CardContent>
          <CategoryForm />
        </CardContent>
      </Card>
    </div>
  )
}
