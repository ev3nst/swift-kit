import { lazy, Suspense } from 'react';
import { Router, Route } from 'wouter';

import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/sonner';
import { Loading } from '@/components/loading';

import Layout from '@/layout';

const Placeholder = lazy(() => import('@/pages/placeholder'));

function App() {
	return (
		<ErrorBoundary>
			<Toaster
				toastOptions={{
					classNames: {
						success: 'text-green-500',
						error: 'text-red-500',
						info: 'text-blue-500',
					},
				}}
			/>
			<Layout>
				<Router>
					<Suspense fallback={<Loading />}>
						<Route path="/(media|)" component={Placeholder} />
						<Route path="/downloader" component={Placeholder} />
						<Route path="/url-gatherer" component={Placeholder} />
						<Route path="/notes" component={Placeholder} />
						<Route
							path="/filename-replacer"
							component={Placeholder}
						/>
						<Route
							path="/image-manipulator"
							component={Placeholder}
						/>
						<Route
							path="/video-manipulator"
							component={Placeholder}
						/>
						<Route path="/security" component={Placeholder} />
						<Route path="/keychain" component={Placeholder} />
					</Suspense>
				</Router>
			</Layout>
		</ErrorBoundary>
	);
}

export default App;
