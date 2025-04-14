import { NextApiRequest, NextApiResponse } from "next";
import { getUsers } from "@/app/actions/user-actions";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const users = await getUsers();
    res.status(200).json(users);
  } catch (error) {
    console.error("Failed to fetch users:", error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
}