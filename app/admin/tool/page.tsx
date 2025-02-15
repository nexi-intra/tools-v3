import React from 'react'
import dynamic from 'next/dynamic';

// Dynamically import your component with SSR disabled
const NoSSRComponent = dynamic(() => import('.'), {
  ssr: false,
});

export default function Page() {
  return <NoSSRComponent />;
}

