import { serve } from "https://deno.land/std@0.131.0/http/server.ts";
import { OAuth2Client } from "https://deno.land/x/oauth2_client@v1.0.0/mod.ts";

import { corsHeaders } from "../_shared/cors.ts";
import { authObject } from "../_shared/aweber.ts";

serve(async (req: Request) => {
  // This is needed to invoke your function from a browser.
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const oauth2Client = new OAuth2Client(authObject);

  // Generate a random state
  const state = crypto.randomUUID();

  // Obtain authorization URL
  const { uri } = await oauth2Client.code.getAuthorizationUri({
    state,
    disablePkce: true,
  });

  const data = {
    redirectUrl: uri,
  };

  // TODO - Save the state along with the title, domain, integeration type in the database


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
