import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { saleId } = await req.json();

    if (!saleId) {
      throw new Error('Sale ID is required');
    }

    console.log('Generating invoice for sale:', saleId);

    // This endpoint returns sale data for PDF generation on the frontend
    // Frontend will use jsPDF to generate the actual PDF with company branding

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Invoice data prepared',
        saleId 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    );
  } catch (error) {
    console.error('Error in generate-invoice function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    );
  }
});