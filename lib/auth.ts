export type UserRole = "admin" | "warehouse_manager" | "sales_person"

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
}

export const checkAccess = (userRole: UserRole, requiredRole: UserRole[]): boolean => {
  if (userRole === "admin") return true
  return requiredRole.includes(userRole)
}

export const getDefaultRoute = (role: UserRole): string => {
  switch (role) {
    case "admin":
      return "/dashboard"
    case "warehouse_manager":
      return "/warehouses"
    case "sales_person":
      return "/pos"
    default:
      return "/login"
  }
}

