import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner"
import { Toaster as TT } from "@/components/ui/toaster"
import './globals.css';
import { headers } from 'next/headers';
import Providers from './providers';
import { APPNAME } from './global';

export async function generateMetadata() {
	const host = (await headers()).get('host') || 't.intra.nexigroup.com';
	const metadata: Metadata = {
		metadataBase: new URL(
			"https://" + host,
		),
		title: {
			template: "%s | Nexi Tools",
			default: "Nexi Tools",
		},
		openGraph: {
			title: "Nexi Tools",
			description: "Nexi tools provide access to your tools",
			images: [
				{
					url: "/og",
					width: 1200,
					height: 600,

					alt: "Koksmat image",
				},
			],
		},

		applicationName: "Nexi Tools",
		referrer: "origin-when-cross-origin",
		keywords: ["no code", "low code", "power apps", "power automate"],
		creator: "Niels Gregers Johansen",
		publisher: "Niels Gregers Johansen",
		description: "Nexi tools provide access to your tools",
	};
	return metadata
}

const geistSans = Geist({
	variable: '--font-geist-sans',
	subsets: ['latin'],
});

const geistMono = Geist_Mono({
	variable: '--font-geist-mono',
	subsets: ['latin'],
});


export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>

				<Providers>{children}</Providers>
				<Toaster />
				<TT />
			</body>
		</html>
	);
}
