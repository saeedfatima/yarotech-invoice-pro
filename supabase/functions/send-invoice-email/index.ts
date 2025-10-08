const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface InvoiceEmailRequest {
  invoiceId: string;
  customerName: string;
  saleDate: string;
  total: number;
  issuerName: string;
  pdfBase64: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const {
      invoiceId,
      customerName,
      saleDate,
      total,
      issuerName,
      pdfBase64,
    }: InvoiceEmailRequest = await req.json();

    if (!invoiceId || !pdfBase64) {
      throw new Error("Invoice ID and PDF data are required");
    }

    const resendApiKey = Deno.env.get("RESEND_API_KEY");

    if (!resendApiKey) {
      console.error("RESEND_API_KEY not configured");
      throw new Error("Email service not configured");
    }

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #2196F3; color: white; padding: 20px; text-align: center; }
            .content { background-color: #f8f9fa; padding: 20px; margin: 20px 0; }
            .footer { text-align: center; color: #666; font-size: 12px; padding: 20px; }
            .invoice-details { background: white; padding: 15px; border-left: 4px solid #2196F3; margin: 15px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>YAROTECH NETWORK LIMITED</h1>
              <p>Invoice Copy</p>
            </div>

            <div class="content">
              <h2>Invoice Generated Successfully</h2>
              <p>Dear Admin,</p>
              <p>A new invoice has been generated. Please find the details below:</p>

              <div class="invoice-details">
                <strong>Invoice ID:</strong> ${invoiceId}<br>
                <strong>Customer:</strong> ${customerName}<br>
                <strong>Date:</strong> ${new Date(saleDate).toLocaleString()}<br>
                <strong>Total Amount:</strong> ₦${total.toLocaleString('en-NG', { minimumFractionDigits: 2 })}<br>
                <strong>Issued By:</strong> ${issuerName}
              </div>

              <p>The invoice PDF is attached to this email.</p>
            </div>

            <div class="footer">
              <p>YAROTECH Network Limited<br>
              No. 122 Lukoro Plaza A, Farm Center, Kano State<br>
              Email: info@yarotech.com.ng</p>
              <p>This is an automated message. Please do not reply to this email.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: "YAROTECH Invoices <onboarding@resend.dev>",
        to: ["info@yarotech.com.ng"],
        subject: `New Invoice Generated - ${invoiceId}`,
        html: emailHtml,
        attachments: [
          {
            filename: `${invoiceId}.pdf`,
            content: pdfBase64.split(',')[1],
          },
        ],
      }),
    });

    const resendData = await resendResponse.json();

    if (!resendResponse.ok) {
      console.error("Resend API error:", resendData);
      throw new Error(`Failed to send email: ${resendData.message || 'Unknown error'}`);
    }

    console.log("Email sent successfully:", resendData);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Invoice email sent successfully",
        emailId: resendData.id,
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error sending invoice email:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";

    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage,
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
