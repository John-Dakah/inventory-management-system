export async function getCurrentAdminId(): Promise<string> {
    try {
      const response = await fetch("/api/auth/me", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
  
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("Error fetching admin ID:", errorData);
        throw new Error(errorData.error || "Failed to fetch current admin ID");
      }
  
      const data = await response.json();
      return data.id; // Assuming the API returns the admin's ID as `id`
    } catch (error) {
      console.error("Error in getCurrentAdminId:", error);
      throw error;
    }
  }