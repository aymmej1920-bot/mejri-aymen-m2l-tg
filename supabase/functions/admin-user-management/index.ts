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

    // --- Admin Role Check ---
    const { data: adminProfile, error: adminProfileError } = await supabaseAdmin
      .from('profiles')
      .select('role_id, fk_role_id!roles(name)') // Use explicit foreign key name here
      .eq('id', user.id)
      .single();

    if (adminProfileError) {
      console.error("Edge Function: Error fetching admin profile for user ID:", user.id, adminProfileError);
      return new Response(JSON.stringify({ error: 'Permission denied: Could not retrieve user profile for role check.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 403,
      });
    }

    if (!adminProfile || adminProfile.fk_role_id?.name !== 'Admin') {
      console.warn("Edge Function: User ID", user.id, "is not an Admin or profile/role not found. Profile data:", adminProfile);
      return new Response(JSON.stringify({ error: 'Permission denied: Only Admin users can perform this action.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 403,
      });
    }
    // --- End Admin Role Check ---

    const { action, email, password, roleName, firstName, lastName, userId, suspend } = await req.json();

    let responseMessage = '';

    switch (action) {
      case 'inviteUser': {
        const { data: roleData, error: roleError } = await supabaseAdmin
          .from('roles')
          .select('id')
          .eq('name', roleName)
          .single();

        if (roleError || !roleData) throw new Error(`Role '${roleName}' not found.`);

        const { data: invitedUser, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
          data: {
            first_name: firstName,
            last_name: lastName,
            role_id: roleData.id,
          },
          redirectTo: Deno.env.get('SUPABASE_URL') + '/login', // Redirect to login page after invite
        });

        if (inviteError) throw inviteError;

        responseMessage = `Invitation envoyée à ${email} avec le rôle ${roleName}.`;
        break;
      }
      case 'createUser': {
        const { data: roleData, error: roleError } = await supabaseAdmin
          .from('roles')
          .select('id')
          .eq('name', roleName)
          .single();

        if (roleError || !roleData) throw new Error(`Role '${roleName}' not found.`);

        const { data: createdUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
          user_metadata: {
            first_name: firstName,
            last_name: lastName,
            role_id: roleData.id,
          },
        });

        if (createError) throw createError;

        // Manually insert into profiles table as handle_new_user might not trigger for admin.createUser
        const { error: profileInsertError } = await supabaseAdmin.from('profiles').insert({
          id: createdUser.user.id,
          first_name: firstName,
          last_name: lastName,
          role_id: roleData.id,
        });
        if (profileInsertError) console.error("Error inserting profile for created user:", profileInsertError);


        responseMessage = `Utilisateur ${email} créé avec succès avec le rôle ${roleName}.`;
        break;
      }
      case 'updateUserRole': {
        if (!userId || !roleName) throw new Error('User ID and role name are required.');

        const { data: roleData, error: roleError } = await supabaseAdmin
          .from('roles')
          .select('id')
          .eq('name', roleName)
          .single();

        if (roleError || !roleData) throw new Error(`Role '${roleName}' not found.`);

        const { error: profileUpdateError } = await supabaseAdmin
          .from('profiles')
          .update({ role_id: roleData.id })
          .eq('id', userId);

        if (profileUpdateError) throw profileUpdateError;

        responseMessage = `Rôle de l'utilisateur ${userId} mis à jour en ${roleName}.`;
        break;
      }
      case 'updateUserStatus': {
        if (!userId || typeof suspend !== 'boolean') throw new Error('User ID and suspend status are required.');

        const { error: userUpdateError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
          app_metadata: { is_suspended: suspend },
        });

        if (userUpdateError) throw userUpdateError;

        responseMessage = `Compte utilisateur ${userId} ${suspend ? 'suspendu' : 'activé'} avec succès.`;
        break;
      }
      case 'listUsers': {
        const { data: authUsers, error: authUsersError } = await supabaseAdmin.auth.admin.listUsers();
        if (authUsersError) throw authUsersError;

        const userIds = authUsers.users.map(u => u.id);
        const { data: profilesData, error: profilesError } = await supabaseAdmin
          .from('profiles')
          .select('id, first_name, last_name, avatar_url, updated_at, role_id, fk_role_id!roles(id, name, description)') // Explicitly use the foreign key name
          .in('id', userIds);

        if (profilesError) throw profilesError;

        const usersList = authUsers.users.map(authUser => {
          const profile = profilesData.find(p => p.id === authUser.id);
          return {
            id: authUser.id,
            email: authUser.email,
            firstName: profile?.first_name || null,
            lastName: profile?.last_name || null,
            avatarUrl: profile?.avatar_url || null,
            updatedAt: profile?.updated_at || null,
            roleId: profile?.role_id || null,
            role: profile?.fk_role_id || null, // Use the explicit foreign key name here
            is_suspended: authUser.app_metadata?.is_suspended || false,
          };
        }).filter(u => u.id !== user.id); // Exclude the current admin user

        return new Response(JSON.stringify({ users: usersList }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        });
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