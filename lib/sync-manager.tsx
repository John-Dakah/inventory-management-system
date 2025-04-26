import { getDB } from "@/lib/db-utils";

export async function addToSyncQueue(item: {
  id: string;
  operation: "create" | "update" | "delete";
  data?: any;
  type: string;
  timestamp: number;
}): Promise<void> {
  try {
    const db = await getDB();

    // Ensure the sync queue exists
    const syncQueueItem = {
      id: item.id,
      operation: item.operation,
      data: item.data,
      type: item.type,
      timestamp: item.timestamp,
    };

    // Add the item to the sync queue in IndexedDB
    await (db as any).put("syncQueue", syncQueueItem);

    console.log("Added to sync queue:", syncQueueItem);
  } catch (error) {
    console.error("Error adding to sync queue:", error);
    throw error;
  }
}