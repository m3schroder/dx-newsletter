import { serve } from "https://deno.land/std@0.131.0/http/server.ts";
import { OAuth2Client } from "https://deno.land/x/oauth2_client@v1.0.0/mod.ts";
import { corsHeaders } from "../_shared/cors.ts";
import {
  createClient,
  PostgrestResponse,
} from "https://esm.sh/@supabase/supabase-js@2.2.0";
import { Integration, IntegrationConfig } from "../_shared/integration.ts";

serve(async (req: Request): Promise<Response> => {
  // This is needed to invoke your function from a browser.
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }


  const oauth2Client = new OAuth2Client(
    IntegrationConfig.getService("AWEBER").oauthObject
  );

  // Save the state along with the title, domain, integeration type in the database
  const integeration = await storeIntegration();

  // The id of the integeration is the state
  const state = integeration.data![0].id;

  // Obtain authorization URL
  const { uri } = await oauth2Client.code.getAuthorizationUri({
    state,
    disablePkce: true,
  });

  const data = {
    redirectUrl: uri,
  };

  try {
    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});

async function storeIntegration() {
  const supabaseClient = createClient(
    // Supabase API URL - env var exported by default.
    Deno.env.get("SUPABASE_URL") ?? "",
    // Supabase API ANON KEY - env var exported by default.
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  const result = await supabaseClient.from("integeration").insert({
    title: "example 1",
    user_id: "fc28d40e-6993-476f-8d8d-58410ea8985e",
    integeration: "AWEBER",
  }).select();

  return result as PostgrestResponse<Integration>;
}
