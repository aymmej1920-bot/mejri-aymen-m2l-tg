/// <reference lib="deno.ns" />
// @deno-types="https://deno.land/std@0.224.0/http/server.d.ts"
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
// @deno-types="https://esm.sh/@supabase/supabase-js@2.45.0/dist/main.d.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(req.headers.get('Authorization')?.split(' ')[1]);
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      });
    }

    // Verify if the user is an Admin
    const { data: adminProfile, error: adminProfileError } = await supabaseAdmin
      .from('profiles')
      .select('role_id, roles(name)')
      .eq('id', user.id)
      .single();

    if (adminProfileError || adminProfile?.roles?.name !== 'Admin') {
      return new Response(JSON.stringify({ error: 'Permission denied: Only Admin users can manage role permissions.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 403,
      });
    }

    const { action, updates } = await req.json();

    let responseMessage = '';

    switch (action) {
      case 'updateRolePermissions': {
        if (!Array.isArray(updates)) throw new Error('Updates must be an array.');

        const updatePromises = updates.map(async (update: { roleId: string; permissionKey: string; enabled: boolean }) => {
          const { roleId, permissionKey, enabled } = update;
          const { error } = await supabaseAdmin
            .from('role_permissions')
            .upsert({ role_id: roleId, permission_key: permissionKey, enabled: enabled }, { onConflict: 'role_id,permission_key' });
          if (error) throw error;
        });

        await Promise.all(updatePromises);
        responseMessage = `Permissions de rôle mises à jour avec succès.`;
        break;
      }
      default:
        throw new Error('Invalid action specified.');
    }

    return new Response(JSON.stringify({ message: responseMessage }), {
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