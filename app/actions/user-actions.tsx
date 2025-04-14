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
export async function getUsers(filters?: UserFilter) {
  try {
    const where: any = {};

    if (filters?.search) {
      where.OR = [
        { fullName: { contains: filters.search, mode: "insensitive" } },
        { email: { contains: filters.search, mode: "insensitive" } },
        { department: { contains: filters.search, mode: "insensitive" } },
      ];
    }

    if (filters?.role && filters.role !== "All") {
      where.role = filters.role;
    }

    if (filters?.status && filters.status !== "All") {
      where.status = filters.status;
    }

    const users = await prisma.oUR_USER.findMany({
      where,
      orderBy: {
        createdAt: "desc",
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

    return users;
  } catch (error) {
    console.error("Failed to fetch users:", error);
    throw new Error("Failed to fetch users");
  }
}

// Get user statistics
export async function getUserStats() {
  try {
    const total = await prisma.oUR_USER.count();
    const active = await prisma.oUR_USER.count({ where: { status: "ACTIVE" } });
    const inactive = await prisma.oUR_USER.count({ where: { status: "INACTIVE" } });
    const admins = await prisma.oUR_USER.count({ where: { role: "admin" } });
    const warehouseManagers = await prisma.oUR_USER.count({ where: { role: "warehouse_manager" } });
    const salesPersons = await prisma.oUR_USER.count({ where: { role: "sales_person" } });

    const departmentsResult = await prisma.oUR_USER.findMany({
      select: { department: true },
      where: { department: { not: null } },
      distinct: ["department"],
    });

    const departments = departmentsResult.map((d) => d.department).filter(Boolean);

    return {
      total,
      active,
      inactive,
      admins,
      warehouseManagers,
      salesPersons,
      departments,
    };
  } catch (error) {
    console.error("Failed to fetch user stats:", error);
    return {
      total: 0,
      active: 0,
      inactive: 0,
      admins: 0,
      warehouseManagers: 0,
      salesPersons: 0,
      departments: [],
    };
  }
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