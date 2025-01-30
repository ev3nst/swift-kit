import { lazy, Suspense } from 'react';
import { Router, Route } from 'wouter';

import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/sonner';
import { Loading } from '@/components/loading';

import Layout from '@/layout';

const Media = lazy(() => import('@/pages/media/index'));
const Movie = lazy(() => import('@/pages/media/movie'));
const Downloader = lazy(() => import('@/pages/downloader'));
const Notes = lazy(() => import('@/pages/notes'));
const FilenameReplacer = lazy(() => import('@/pages/filename-replacer'));

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
						<Route path="/media" nest>
							<Media>
								<Route path="(movies|)" component={Movie} />
								<Route path="animes" component={Placeholder} />
								<Route
									path="tv-series"
									component={Placeholder}
								/>
								<Route path="games" component={Placeholder} />
							</Media>
						</Route>

						<Route path="/downloader" component={Downloader} />
						<Route path="/notes" component={Notes} />
						<Route
							path="/filename-replacer"
							component={FilenameReplacer}
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
