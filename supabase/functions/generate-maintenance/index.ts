/// <reference lib="deno.ns" />
// @deno-types="https://deno.land/std@0.224.0/http/server.d.ts"
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
// @deno-types="https://esm.sh/@supabase/supabase-js@2.45.0/dist/main.d.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';
// @deno-types="https://esm.sh/v135/date-fns@2.30.0/deno/index.d.ts"
import { addMonths, format, parseISO } from "https://esm.sh/date-fns@2.30.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create a Supabase client with the service role key for elevated privileges
    // This allows the function to bypass RLS and access all user data for automation
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const today = format(new Date(), "yyyy-MM-dd");
    const now = new Date();

    // Fetch all active maintenance plans
    const { data: activePlans, error: plansError } = await supabase
      .from('maintenance_plans')
      .select('*')
      .eq('status', 'Actif');

    if (plansError) throw plansError;

    const generatedMaintenances: any[] = [];
    const updatedPlans: any[] = [];

    for (const plan of activePlans) {
      let isDue = false;
      let latestOdometer: number | null = null;

      // For mileage-based plans, get the latest odometer reading for the vehicle
      if (plan.interval_type === "Kilométrage") {
        const { data: fuelEntries, error: fuelError } = await supabase
          .from('fuel_entries')
          .select('odometer_reading, date')
          .eq('vehicle_license_plate', plan.vehicle_license_plate)
          .eq('user_id', plan.user_id) // Ensure we get odometer for the correct user's vehicle
          .order('date', { ascending: false })
          .limit(1);

        if (fuelError) console.error("Error fetching fuel entries for odometer:", fuelError);
        latestOdometer = fuelEntries && fuelEntries.length > 0 ? fuelEntries[0].odometer_reading : null;

        if (latestOdometer !== null && plan.next_due_odometer !== null && latestOdometer >= plan.next_due_odometer) {
          isDue = true;
        }
      } else if (plan.interval_type === "Temps" && plan.next_due_date) {
        const nextDueDate = parseISO(plan.next_due_date);
        if (nextDueDate <= now) {
          isDue = true;
        }
      }

      if (isDue) {
        // 1. Create new maintenance entry
        const newMaintenance = {
          user_id: plan.user_id,
          vehicle_license_plate: plan.vehicle_license_plate,
          type: plan.type,
          description: `Maintenance générée automatiquement par plan: ${plan.description}`,
          cost: plan.estimated_cost,
          date: today,
          provider: plan.provider,
          status: "Planifiée",
        };

        const { data: insertedMaintenance, error: insertError } = await supabase
          .from('maintenances')
          .insert(newMaintenance)
          .select();

        if (insertError) {
          console.error("Error inserting new maintenance:", insertError);
          continue; // Skip to next plan if insert fails
        }
        generatedMaintenances.push(insertedMaintenance[0]);

        // 2. Update the maintenance plan for the next due date/odometer
        let newNextDueDate: string | null = null;
        let newNextDueOdometer: number | null = null;

        if (plan.interval_type === "Temps") {
          const lastDate = new Date(now); // Use current date as last generated date
          const futureDate = addMonths(lastDate, plan.interval_value);
          newNextDueDate = format(futureDate, "yyyy-MM-dd");
        } else if (plan.interval_type === "Kilométrage" && latestOdometer !== null) {
          newNextDueOdometer = latestOdometer + plan.interval_value;
        } else if (plan.interval_type === "Kilométrage" && latestOdometer === null) {
          console.warn(`No odometer reading found for vehicle ${plan.vehicle_license_plate} (user: ${plan.user_id}). Cannot update next_due_odometer for plan ${plan.id}.`);
        }

        const updatedPlanData = {
          last_generated_date: today,
          next_due_date: newNextDueDate,
          next_due_odometer: newNextDueOdometer,
        };

        const { data: updatedPlanResult, error: updatePlanError } = await supabase
          .from('maintenance_plans')
          .update(updatedPlanData)
          .eq('id', plan.id)
          .select();

        if (updatePlanError) {
          console.error("Error updating maintenance plan:", updatePlanError);
          continue;
        }
        updatedPlans.push(updatedPlanResult[0]);
      }
    }

    return new Response(JSON.stringify({
      message: `Maintenance generation completed. Generated ${generatedMaintenances.length} maintenances.`,
      generatedMaintenances: generatedMaintenances.map(mapToCamelCase),
      updatedPlans: updatedPlans.map(mapToCamelCase),
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error("Edge Function error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});

// Helper to map snake_case to camelCase (copied from FleetContext for self-contained function)
const mapToCamelCase = (obj: any): any => {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map(item => mapToCamelCase(item));
  }
  const newObj: any = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const camelKey = key.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
      newObj[camelKey] = mapToCamelCase(obj[key]);
    }
  }
  return newObj;
};