import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  renderToBuffer,
} from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#ffffff",
    padding: 0,
  },
  border: {
    margin: 30,
    padding: 40,
    borderWidth: 3,
    borderColor: "#1a1a2e",
    borderStyle: "solid",
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  innerBorder: {
    borderWidth: 1,
    borderColor: "#c4c4c4",
    borderStyle: "solid",
    padding: 30,
    flex: 1,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    fontSize: 12,
    letterSpacing: 8,
    color: "#666666",
    textTransform: "uppercase",
    marginBottom: 10,
  },
  platformName: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1a1a2e",
    marginBottom: 20,
  },
  divider: {
    width: 100,
    height: 2,
    backgroundColor: "#1a1a2e",
    marginBottom: 20,
  },
  certTitle: {
    fontSize: 16,
    color: "#333333",
    marginBottom: 6,
  },
  presentedTo: {
    fontSize: 11,
    color: "#888888",
    marginBottom: 10,
    letterSpacing: 3,
    textTransform: "uppercase",
  },
  recipientName: {
    fontSize: 32,
    color: "#1a1a2e",
    marginBottom: 16,
  },
  description: {
    fontSize: 12,
    color: "#555555",
    textAlign: "center",
    maxWidth: 400,
    marginBottom: 30,
    lineHeight: 1.6,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    borderTopStyle: "solid",
  },
  footerItem: {
    alignItems: "center",
  },
  footerLabel: {
    fontSize: 8,
    color: "#999999",
    letterSpacing: 2,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  footerValue: {
    fontSize: 11,
    color: "#333333",
  },
  verificationCode: {
    fontSize: 10,
    color: "#888888",
    marginTop: 20,
  },
});

interface CertificateData {
  recipientName: string;
  certificateTitle: string;
  description: string;
  issuedDate: string;
  verificationCode: string;
}

function CertificateDocument({
  recipientName,
  certificateTitle,
  description,
  issuedDate,
  verificationCode,
}: CertificateData) {
  return (
    <Document>
      <Page size="LETTER" orientation="landscape" style={styles.page}>
        <View style={styles.border}>
          <View style={styles.innerBorder}>
            <Text style={styles.header}>Certificate of Completion</Text>
            <Text style={styles.platformName}>DEVOPS ENGINEERS</Text>
            <View style={styles.divider} />
            <Text style={styles.certTitle}>{certificateTitle}</Text>
            <Text style={styles.presentedTo}>Presented To</Text>
            <Text style={styles.recipientName}>{recipientName}</Text>
            <Text style={styles.description}>{description}</Text>

            <View style={styles.footer}>
              <View style={styles.footerItem}>
                <Text style={styles.footerLabel}>Date Issued</Text>
                <Text style={styles.footerValue}>{issuedDate}</Text>
              </View>
              <View style={styles.footerItem}>
                <Text style={styles.footerLabel}>Verification</Text>
                <Text style={styles.footerValue}>{verificationCode}</Text>
              </View>
              <View style={styles.footerItem}>
                <Text style={styles.footerLabel}>Issued By</Text>
                <Text style={styles.footerValue}>DEVOPS ENGINEERS</Text>
              </View>
            </View>

            <Text style={styles.verificationCode}>
              Verify at: devopsengineer.com/certificates/{verificationCode}
            </Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}

/**
 * Generate a PDF buffer for a certificate.
 */
export async function generateCertificatePDF(
  data: CertificateData
): Promise<Buffer> {
  const buffer = await renderToBuffer(
    <CertificateDocument {...data} />
  );
  return Buffer.from(buffer);
}
