import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
	return (
		<main className="min-h-screen bg-background px-6 py-10 text-foreground">
			<div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
				<section className="space-y-4">
					<Badge variant="secondary" className="w-fit">
						AI Codebase Assistant
					</Badge>
					<h1 className="max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">
						Understand any repository with chat, code search, and architecture tracing.
					</h1>
					<p className="max-w-2xl text-muted-foreground">
						Upload a public GitHub repo, index its code, and ask questions about flows,
						structure, bugs, and improvements.
					</p>
					<div className="flex flex-wrap gap-3">
						<Button>Upload Repository</Button>
						<Button variant="outline">Explore Architecture</Button>
					</div>
				</section>

				<Card className="max-w-2xl">
					<CardHeader>
						<CardTitle>Project Overview</CardTitle>
						<CardDescription>
							The frontend is ready for the repository upload, chat, and flow tracing UI.
						</CardDescription>
					</CardHeader>
					<CardContent className="text-sm text-muted-foreground">
						Next, we can connect the backend API, render repository summaries, and add
						chat-driven code exploration.
					</CardContent>
				</Card>
			</div>
		</main>
	);
}
