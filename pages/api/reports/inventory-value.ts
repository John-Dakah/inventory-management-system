import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Fetch products from the database
    const products = await prisma.product.findMany();

    // Calculate inventory value (price * quantity)
    const inventoryValue = products.reduce(
      (total, product) => total + (product.price || 0) * (product.quantity || 0),
      0
    );

    res.status(200).json({ inventoryValue });
  } catch (error) {
    console.error("Error calculating inventory value:", error);
    res.status(500).json({ error: "Failed to calculate inventory value" });
  }
}