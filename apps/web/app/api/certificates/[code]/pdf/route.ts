import { NextResponse } from "next/server";
import { getCertificateByCode } from "@/lib/certificates";
import { generateCertificatePDF } from "@/lib/pdf-certificate";

export async function GET(
  _request: Request,
  { params }: { params: { code: string } }
) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return NextResponse.json(
      { error: "Service unavailable" },
      { status: 503 }
    );
  }

  const certificate = await getCertificateByCode(params.code);
  if (!certificate) {
    return NextResponse.json(
      { error: "Certificate not found" },
      { status: 404 }
    );
  }

  try {
    const pdfBuffer = await generateCertificatePDF({
      recipientName: (certificate as any).profiles?.display_name || "Learner",
      certificateTitle: certificate.title,
      description: certificate.description || `Successfully completed the ${certificate.title} learning path on the DEVOPS ENGINEERS platform.`,
      issuedDate: new Date(certificate.issued_at).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      verificationCode: certificate.verification_code,
    });

    return new Response(new Uint8Array(pdfBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="certificate-${certificate.verification_code}.pdf"`,
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch (error) {
    console.error("PDF generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate PDF" },
      { status: 500 }
    );
  }
}
