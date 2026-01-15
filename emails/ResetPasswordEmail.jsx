// emails/ResetPasswordEmail.jsx
import * as React from "react";
import {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Heading,
  Text,
  Button,
} from "@react-email/components";

export default function ResetPasswordEmail({ resetUrl }) {
  return (
    <Html lang="en">
      <Head />
      <Preview>Reset your password</Preview>
      <Body style={{ backgroundColor: "#f9fafb", margin: 0, padding: 0 }}>
        <Container style={{ padding: "20px", backgroundColor: "#ffffff", borderRadius: "8px", margin: "20px auto", maxWidth: "600px" }}>
          <Heading style={{ fontSize: "24px", marginBottom: "16px", color: "#111827" }}>
            Reset your password
          </Heading>
          <Text style={{ fontSize: "16px", color: "#374151", lineHeight: "1.5", marginBottom: "24px" }}>
            You requested to reset your password. Click the button below to choose a new one. This link is valid for 1 hour.
          </Text>
          <Button
            pX={20}
            pY={12}
            style={{
              backgroundColor: "#6366f1",
              color: "#ffffff",
              textDecoration: "none",
              borderRadius: "6px",
              fontSize: "16px",
            }}
            href={resetUrl}
          >
            Reset Password
          </Button>
          <Text style={{ fontSize: "14px", color: "#6b7280", marginTop: "24px" }}>
            If you did not request this, you can safely ignore this email.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
