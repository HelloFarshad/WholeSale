import { serve } from "https://deno.land/std@0.179.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.38.5";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders,
      status: 204,
    });
  }

  try {
    // Create a Supabase client with the Admin key
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const url = new URL(req.url);
    const path = url.pathname.split("/").pop();

    // Check if it's requesting real-time stock
    if (path === "current-stock") {
      const params = url.searchParams;
      const itemId = params.get("itemId");
      const warehouseId = params.get("warehouseId");

      // Calculate current stock
      const { data, error } = await supabaseClient.rpc("calculate_stock", {
        p_item_id: itemId,
        p_warehouse_id: warehouseId,
      });

      if (error) {
        throw error;
      }

      // Return the current stock value
      return new Response(
        JSON.stringify({
          currentStock: data,
          itemId,
          warehouseId,
          timestamp: new Date().toISOString(),
        }),
        {
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
          status: 200,
        }
      );
    }

    // Get stock levels for multiple items
    if (path === "stock-levels") {
      // Get request body - expects {itemIds: string[], warehouseId?: string}
      const { itemIds, warehouseId } = await req.json();

      if (!itemIds || !Array.isArray(itemIds)) {
        throw new Error("Invalid request body. Expected array of item IDs.");
      }

      // For each item ID, calculate the stock
      const stockPromises = itemIds.map(async (itemId) => {
        const { data } = await supabaseClient.rpc("calculate_stock", {
          p_item_id: itemId,
          p_warehouse_id: warehouseId || null,
        });
        return {
          itemId,
          currentStock: data || 0,
        };
      });

      const stockLevels = await Promise.all(stockPromises);

      return new Response(
        JSON.stringify({
          stockLevels,
          warehouseId,
          timestamp: new Date().toISOString(),
        }),
        {
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
          status: 200,
        }
      );
    }

    // Get low stock alerts
    if (path === "low-stock-alerts") {
      const { data, error } = await supabaseClient
        .from("current_stock_by_item_and_warehouse")
        .select("item_id, warehouse_id, current_stock, items:item_id(name), warehouses:warehouse_id(name)")
        .lt("current_stock", 10);

      if (error) {
        throw error;
      }

      return new Response(
        JSON.stringify({
          alerts: data,
          timestamp: new Date().toISOString(),
        }),
        {
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
          status: 200,
        }
      );
    }

    // Default response if no specific endpoint matched
    return new Response(
      JSON.stringify({
        error: "Not found",
        availableEndpoints: ["/current-stock", "/stock-levels", "/low-stock-alerts"],
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
        status: 404,
      }
    );
  } catch (error) {
    console.error("Error processing request:", error);
    
    return new Response(
      JSON.stringify({
        error: error.message || "An error occurred processing the request",
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
        status: 500,
      }
    );
  }
});