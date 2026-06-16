import { AppShell } from "@/layout/AppShell";

export default async function ChatPage({ params }: { params: Promise<{ namespace: string }> }) {
  const resolvedParams = await params;
  return <AppShell namespace={resolvedParams.namespace} />;
}
