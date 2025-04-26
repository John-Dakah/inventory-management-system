import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
  } from "@/components/ui/breadcrumb"
  import { Card, CardContent } from "@/components/ui/card"
  import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
  import Link from "next/link"
  import { ChevronRight } from "lucide-react"
  
  export default function AddingProductsPage() {
    return (
      <div className="max-w-4xl mx-auto">
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/">Home</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator>
              <ChevronRight className="h-4 w-4" />
            </BreadcrumbSeparator>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/product-management/adding-products">Product Management</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator>
              <ChevronRight className="h-4 w-4" />
            </BreadcrumbSeparator>
            <BreadcrumbItem>
              <BreadcrumbPage>Adding Products</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
  
        <h1 className="text-3xl font-bold mb-6">Adding Products</h1>
  
        <Tabs defaultValue="basic" className="mb-8">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basic">Basic Information</TabsTrigger>
            <TabsTrigger value="advanced">Advanced Options</TabsTrigger>
            <TabsTrigger value="bulk">Bulk Import</TabsTrigger>
          </TabsList>
          <TabsContent value="basic">
            <Card>
              <CardContent className="pt-6">
                <section className="mb-6">
                  <h2 className="text-2xl font-semibold mb-4">Basic Product Information</h2>
                  <p className="mb-4">
                    To add a new product to your inventory, you'll need to provide the following basic information:
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>
                      <strong>Product Name:</strong> A clear, descriptive name for your product
                    </li>
                    <li>
                      <strong>SKU (Stock Keeping Unit):</strong> A unique identifier for your product
                    </li>
                    <li>
                      <strong>Description:</strong> Detailed information about the product
                    </li>
                    <li>
                      <strong>Category:</strong> The product category for organization
                    </li>
                    <li>
                      <strong>Price Information:</strong> Cost price, selling price, and any tax information
                    </li>
                    <li>
                      <strong>Initial Stock Level:</strong> The current quantity in inventory
                    </li>
                  </ul>
                </section>
  
                <section>
                  <h3 className="text-xl font-semibold mb-4">Step-by-Step Process</h3>
                  <ol className="list-decimal pl-6 space-y-3">
                    <li>
                      <p className="font-medium">Navigate to Products</p>
                      <p>
                        From the main dashboard, click on "Products" in the main navigation menu, then select "Add New
                        Product".
                      </p>
                    </li>
                    <li>
                      <p className="font-medium">Enter Basic Details</p>
                      <p>
                        Fill in the product name, SKU, and description. The SKU should be unique and follow your company's
                        naming convention.
                      </p>
                    </li>
                    <li>
                      <p className="font-medium">Select Category</p>
                      <p>
                        Choose an existing category from the dropdown menu or create a new one by clicking "Add New
                        Category".
                      </p>
                    </li>
                    <li>
                      <p className="font-medium">Set Pricing Information</p>
                      <p>
                        Enter the cost price (what you pay), selling price (what customers pay), and any applicable tax
                        rates.
                      </p>
                    </li>
                    <li>
                      <p className="font-medium">Upload Images</p>
                      <p>
                        Add product images by clicking "Upload Images" or dragging and dropping image files. You can add
                        multiple images and set one as the primary image.
                      </p>
                    </li>
                    <li>
                      <p className="font-medium">Save the Product</p>
                      <p>
                        Click "Save" to create the product. You can choose "Save & Add Another" if you need to add
                        multiple products.
                      </p>
                    </li>
                  </ol>
                </section>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="advanced">
            <Card>
              <CardContent className="pt-6">
                <section className="mb-6">
                  <h2 className="text-2xl font-semibold mb-4">Advanced Product Options</h2>
                  <p className="mb-4">
                    Beyond the basic information, you can configure these advanced options for more detailed product
                    management:
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>
                      <strong>Product Attributes:</strong> Characteristics like size, color, material, etc.
                    </li>
                    <li>
                      <strong>Variants:</strong> Different versions of the product (e.g., different sizes or colors)
                    </li>
                    <li>
                      <strong>Barcodes:</strong> UPC, EAN, or other barcode information
                    </li>
                    <li>
                      <strong>Dimensions & Weight:</strong> Physical measurements for shipping calculations
                    </li>
                    <li>
                      <strong>Supplier Information:</strong> Link products to specific suppliers
                    </li>
                    <li>
                      <strong>Minimum Stock Levels:</strong> Set thresholds for low stock alerts
                    </li>
                    <li>
                      <strong>Location Assignment:</strong> Specify which locations carry this product
                    </li>
                  </ul>
                </section>
  
                <section>
                  <h3 className="text-xl font-semibold mb-4">Setting Up Product Attributes</h3>
                  <p className="mb-4">Product attributes help categorize and filter your inventory:</p>
                  <ol className="list-decimal pl-6 space-y-2">
                    <li>In the product form, navigate to the "Attributes" section</li>
                    <li>Click "Add Attribute" and select from existing attributes or create a new one</li>
                    <li>Assign values to each attribute (e.g., Color: Red, Blue, Green)</li>
                    <li>Specify if the attribute should be used for creating variants</li>
                  </ol>
                  <p className="mt-4">
                    For more details, see the{" "}
                    <Link href="/product-management/product-attributes" className="text-blue-600 hover:underline">
                      Product Attributes
                    </Link>{" "}
                    guide.
                  </p>
                </section>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="bulk">
            <Card>
              <CardContent className="pt-6">
                <section className="mb-6">
                  <h2 className="text-2xl font-semibold mb-4">Bulk Product Import</h2>
                  <p className="mb-4">If you have many products to add, the bulk import feature can save you time:</p>
                  <ol className="list-decimal pl-6 space-y-3">
                    <li>
                      <p className="font-medium">Prepare Your Data</p>
                      <p>Download the product import template (CSV or Excel format) from the system.</p>
                    </li>
                    <li>
                      <p className="font-medium">Fill in the Template</p>
                      <p>
                        Enter your product data following the template format. Required fields include Product Name, SKU,
                        and Category.
                      </p>
                    </li>
                    <li>
                      <p className="font-medium">Upload the File</p>
                      <p>Navigate to Products {'>'} Bulk Import and upload your completed file.</p>
                    </li>
                    <li>
                      <p className="font-medium">Validate the Data</p>
                      <p>The system will check for errors or missing information. Review any warnings or errors.</p>
                    </li>
                    <li>
                      <p className="font-medium">Confirm and Import</p>
                      <p>Once validation is successful, click "Import Products" to add them to your inventory.</p>
                    </li>
                  </ol>
                </section>
  
                <section>
                  <h3 className="text-xl font-semibold mb-4">Tips for Successful Bulk Import</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Ensure all SKUs are unique to avoid duplicates</li>
                    <li>Use existing category names exactly as they appear in the system</li>
                    <li>For product variants, use the variant template specifically designed for them</li>
                    <li>Double-check pricing information before importing</li>
                    <li>Consider importing in smaller batches for easier error management</li>
                  </ul>
                </section>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    )
  }
  