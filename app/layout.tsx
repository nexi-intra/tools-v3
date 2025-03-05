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
			template: "%s | Tools",
			default: "Tools",
		},
		openGraph: {
			title: "Magic Button Tools",
			description: "Magic Button provide access to your tools, and works as a smart way of figuring out which tool to use when",
			images: [
				{
					url: "/og",
					width: 1200,
					height: 600,

					alt: "Koksmat image",
				},
			],
		},

		applicationName: "Magic Button",
		referrer: "origin-when-cross-origin",
		keywords: ["no code", "low code", "power apps", "power automate"],
		creator: "Niels Gregers Johansen",
		publisher: "Niels Gregers Johansen",
		description: "Magic Button provide access to your tools, and works as a smart way of figuring out which tool to use when",
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
