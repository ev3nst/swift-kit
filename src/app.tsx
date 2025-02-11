import { lazy, Suspense, useEffect, useState } from 'react';
import { Router, Route } from 'wouter';

import { ErrorBoundary } from '@/components/error-boundary';
import { DragEventProvider } from '@/components/drag-provider';
import { Toaster } from '@/components/sonner';
import { Loading } from '@/components/loading';

import { dbWrapper } from '@/lib/db';

import Layout from '@/layout';

// Source & Content
import Media from './pages/media';
const Movie = lazy(() => import('@/pages/media/movie'));
const Downloader = lazy(() => import('@/pages/downloader'));
const Notes = lazy(() => import('@/pages/notes'));

// File Systems
import ImageManipulation from './pages/image-manipulation';
const ImageManipulator = lazy(
	() => import('@/pages/image-manipulation/image-manipulator'),
);
const IconGenerator = lazy(
	() => import('@/pages/image-manipulation/icon-generator'),
);

import VideoManipulation from './pages/video-manipulation';
const NoIntroOutro = lazy(
	() => import('@/pages/video-manipulation/no-intro-outro'),
);
const BulkInterpolation = lazy(
	() => import('@/pages/video-manipulation/bulk-interpolation'),
);
const CutAndMerge = lazy(
	() => import('@/pages/video-manipulation/cut-and-merge'),
);
const FilenameReplacer = lazy(() => import('@/pages/filename-replacer'));

// Security
const Keychain = lazy(() => import('@/pages/keychain'));
const Placeholder = lazy(() => import('@/pages/placeholder'));

function App() {
	const [dbInitialized, setDbInitialized] = useState(false);

	useEffect(() => {
		(async () => {
			await dbWrapper.initialize();
			setDbInitialized(true);
		})();
	}, []);

	useEffect(() => {
		import('./styles/tiptap.css');
		import('./styles/animated-bg.css');
		import('./styles/react-color.css');
	}, []);

	if (dbInitialized === false) {
		return <Loading />;
	}

	return (
		<ErrorBoundary>
			<DragEventProvider>
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
							<Route path="(media|)" nest>
								<Media>
									<Route path="(movies|)" component={Movie} />
									<Route
										path="animes"
										component={Placeholder}
									/>
									<Route
										path="tv-series"
										component={Placeholder}
									/>
									<Route
										path="games"
										component={Placeholder}
									/>
								</Media>
							</Route>

							<Route path="/downloader" component={Downloader} />
							<Route path="/notes" component={Notes} />
							<Route
								path="/filename-replacer"
								component={FilenameReplacer}
							/>

							<Route path="/image-manipulation" nest>
								<ImageManipulation>
									<Route
										path="(manipulator|)"
										component={ImageManipulator}
									/>
									<Route
										path="/icon-generator"
										component={IconGenerator}
									/>
								</ImageManipulation>
							</Route>

							<Route path="/video-manipulation" nest>
								<VideoManipulation>
									<Route
										path="(no-intro-outro|)"
										component={NoIntroOutro}
									/>
									<Route
										path="bulk-interpolation"
										component={BulkInterpolation}
									/>
									<Route
										path="cut-and-merge"
										component={CutAndMerge}
									/>
								</VideoManipulation>
							</Route>
							<Route path="/security" component={Placeholder} />
							<Route path="/keychain" component={Keychain} />
						</Suspense>
					</Router>
				</Layout>
			</DragEventProvider>
		</ErrorBoundary>
	);
}

export default App;
