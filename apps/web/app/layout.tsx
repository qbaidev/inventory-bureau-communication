import type { Metadata } from "next"
import { Figtree, Geist, Geist_Mono } from "next/font/google"

import { BreakpointIndicator } from "@/core/components/breakpoint-indicator"
import { Toaster } from "@/core/components/ui/sonner"
import { AuthProvider } from "@/services/better-auth/context/auth-provider"
import { QueryProvider } from "@/services/tanstack-query/provider"

import "@/core/styles/globals.css"
import "@/services/orpc/orpc-server"

const figtree = Figtree({ subsets: ["latin"], variable: "--font-sans" })

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
})

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
})

export const metadata: Metadata = {
	title: "IMS-BCS",
	description: "Inventory Management System for the Bureau of Communications Services",
}

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	return (
		<html lang="en" className={`${figtree.variable} light`}>
			<body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
				<AuthProvider>
					<QueryProvider>
						<BreakpointIndicator />
						{children}
						<Toaster richColors closeButton />
					</QueryProvider>
				</AuthProvider>
			</body>
		</html>
	)
}
