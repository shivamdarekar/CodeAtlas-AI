import type { Metadata } from "next";

import "./globals.css";

import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

export const metadata: Metadata = {
	title: "Codebase Assistant",
	description: "AI assistant for understanding GitHub repositories and codebases",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body>
				<TooltipProvider>
					{children}
					<Toaster richColors />
				</TooltipProvider>
			</body>
		</html>
	);
}
import { Geist } from "next/font/google";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

