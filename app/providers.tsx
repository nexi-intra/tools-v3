

'use client';

import React from 'react';
import TrpcProvider from '../trpc/provider';

import { UserProvider } from '@/contexts/UserContext';
import { MSALWrapper } from '@/components/msal/auth';
import { LanguageProvider } from '@/contexts/language-context';
import { KoksmatSessionProvider } from '@/contexts/koksmat-provider';
import { MagicboxProvider } from '@/contexts/magicbox-providers';
import ErrorBoundary from '@/components/error-boundary';
import Authenticate, { UserProfileAPI } from '@/components/authenticate';
import { UserProfileProvider } from '@/contexts/userprofile-context';
import { ApplicationRoot } from '@/components/application-root';
import TabNavigatorWithReorder from '@/components/tab-navigator-with-reorder';
import { BreadcrumbProvider } from '@/contexts/breadcrumb-context';
import { useExampleHook } from '@/contexts/lookup-provider';

export default function Providers({ children }: { children: React.ReactNode }) {
	//return <div>{children}</div>

	return (

		<TrpcProvider>
			<ErrorBoundary>
				<MagicboxProvider>
					<MSALWrapper>
						<BreadcrumbProvider lookupHandlers={[useExampleHook()]}>
							<LanguageProvider>
								<KoksmatSessionProvider>

									<UserProfileProvider>
										<ApplicationRoot hideBreadcrumb topnav={<TabNavigatorWithReorder />} >
											{children}
										</ApplicationRoot>
									</UserProfileProvider>

								</KoksmatSessionProvider>
							</LanguageProvider>
						</BreadcrumbProvider>
					</MSALWrapper>
				</MagicboxProvider>
			</ErrorBoundary>
		</TrpcProvider>

	)

}
