// src/app/providers.tsx

'use client';

import React from 'react';
import TrpcProvider from '../trpc/provider';

import { UserProvider } from '@/contexts/UserContext';
import { MSALWrapper } from '@/components/msal/auth';
import { LanguageProvider } from '@/contexts/language-context';
import { KoksmatSessionProvider } from '@/contexts/koksmat-provider';

export default function Providers({ children }: { children: React.ReactNode }) {
	return <TrpcProvider>
		<MSALWrapper>

			<LanguageProvider>
				<KoksmatSessionProvider>

					<UserProvider>
						{children}
					</UserProvider>
				</KoksmatSessionProvider>
			</LanguageProvider>
		</MSALWrapper>
	</TrpcProvider>

}
