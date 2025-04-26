"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { hash, compare } from "bcrypt";

export type UserFormData = {
  email: string;
  password?: string;
  fullName: string;
  department?: string;
  status: "ACTIVE" | "INACTIVE";
  role: "admin" | "warehouse_manager" | "sales_person";
};

export type UserFilter = {
  search?: string;
  role?: string;
  status?: string;
};

// Get all users with optional filtering
export async function getUsers(adminId: string) {
  return prisma.oUR_USER.findMany({
    where: {
      createdById: adminId,
      NOT: { id: adminId },
    },
    select: {
      id: true,
      email: true,
      fullName: true,
      department: true,
      status: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

// in user-actions.ts

// Get user statistics
export async function getUserStats(adminId: string) {
  const users = await prisma.oUR_USER.findMany({
    where: { createdById: adminId },
  });

  const total = users.length;
  const active = users.filter((user) => user.status === "ACTIVE").length;
  const inactive = users.filter((user) => user.status === "INACTIVE").length;
  const admins = users.filter((user) => user.role === "admin").length;
  const warehouseManagers = users.filter((user) => user.role === "warehouse_manager").length;
  const salesPersons = users.filter((user) => user.role === "sales_person").length;
  const departments = [...new Set(users.map((user) => user.department).filter(Boolean))];

  return { total, active, inactive, admins, warehouseManagers, salesPersons, departments };
}
// Add a new user
export async function addUser(data: UserFormData) {
  try {
    const emailExists = await prisma.oUR_USER.count({ where: { email: data.email } });
    if (emailExists) {
      return { error: "Email already exists" };
    }

    if (!data.password || data.password.length < 6) {
      return { error: "Password must be at least 6 characters" };
    }

    const hashedPassword = await hash(data.password, 10);

    const user = await prisma.oUR_USER.create({
      data: {
        email: data.email,
        password: hashedPassword,
        fullName: data.fullName,
        department: data.department || "",
        status: "ACTIVE",
        role: data.role,
      },
    });

    revalidatePath("/users");
    return { user: { ...user, password: undefined } };
  } catch (error) {
    console.error("Failed to add user:", error);
    return { error: "Failed to add user" };
  }
}

// Update an existing user
export async function updateUser(id: string, data: UserFormData) {
  try {
    const emailExists = await prisma.oUR_USER.count({
      where: { email: data.email, NOT: { id } },
    });
    if (emailExists) {
      return { error: "Email already exists" };
    }

    const updateData: any = {
      email: data.email,
      fullName: data.fullName,
      department: data.department || null,
      status: data.status,
      role: data.role,
    };

    if (data.password && data.password.length > 0) {
      if (data.password.length < 6) {
        return { error: "Password must be at least 6 characters" };
      }
      updateData.password = await hash(data.password, 10);
    }

    const user = await prisma.oUR_USER.update({
      where: { id },
      data: updateData,
    });

    revalidatePath("/users");
    return { user: { ...user, password: undefined } };
  } catch (error) {
    console.error("Failed to update user:", error);
    return { error: "Failed to update user" };
  }
}

// Delete a user
export async function deleteUser(id: string) {
  try {
    await prisma.oUR_USER.delete({
      where: { id },
    });

    revalidatePath("/users");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete user:", error);
    return { error: "Failed to delete user" };
  }
}