// src/app/providers.tsx

'use client';

import React from 'react';
import TrpcProvider from '../trpc/provider';

import { UserProvider } from '@/lib/UserContext';

export default function Providers({ children }: { children: React.ReactNode }) {
	return <TrpcProvider>
		<UserProvider>
			{children}
		</UserProvider>
	</TrpcProvider>

}
