import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";

export default function ConfirmSignupJb({ confirmUrl }: { confirmUrl: string }) {
  return (
    <Html>
      <Head />
      <Preview>One click to confirm your subscription.</Preview>
      <Body style={body}>
        <Container style={container}>
          <Heading style={h1}>janeyoubradley.com</Heading>
          <Text style={muted}>A weekly note from Jane.</Text>
          <Section style={section}>
            <Text style={text}>
              Thanks for signing up. Click below to confirm your email — one short
              weekly note on what I&apos;m learning by doing: shipping small projects,
              applying AI to real life, and figuring out what it all means in practice.
            </Text>
            <Link href={confirmUrl} style={cta}>
              Confirm my email →
            </Link>
            <Text style={textSmall}>
              If the link does not work, paste this into your browser:
              <br />
              <span style={{ wordBreak: "break-all" }}>{confirmUrl}</span>
            </Text>
          </Section>
          <Hr style={hr} />
          <Text style={footer}>
            If you did not sign up, ignore this email. Your address will not be added
            to the list unless you click confirm.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

const body: React.CSSProperties = {
  backgroundColor: "#0e1014",
  color: "#f5f5f5",
  fontFamily: "Inter, system-ui, sans-serif",
  margin: 0,
  padding: 0,
};
const container: React.CSSProperties = {
  margin: "0 auto",
  maxWidth: "560px",
  padding: "32px 24px",
};
const h1: React.CSSProperties = {
  margin: 0,
  fontSize: "28px",
  fontWeight: 600,
  letterSpacing: "-0.02em",
};
const muted: React.CSSProperties = {
  margin: "8px 0 0 0",
  fontSize: "14px",
  color: "#9ca3af",
};
const section: React.CSSProperties = { marginTop: "32px" };
const text: React.CSSProperties = {
  fontSize: "16px",
  lineHeight: "1.6",
  color: "#e5e7eb",
};
const textSmall: React.CSSProperties = {
  fontSize: "12px",
  lineHeight: "1.6",
  color: "#9ca3af",
  marginTop: "24px",
};
const cta: React.CSSProperties = {
  display: "inline-block",
  marginTop: "16px",
  padding: "12px 20px",
  backgroundColor: "#6dd9c3",
  color: "#0e1014",
  fontWeight: 600,
  textDecoration: "none",
  borderRadius: "8px",
};
const hr: React.CSSProperties = {
  borderColor: "#1f2937",
  margin: "32px 0",
};
const footer: React.CSSProperties = {
  fontSize: "12px",
  color: "#6b7280",
  lineHeight: "1.6",
};
