import { lazy, Suspense } from 'react';
import { Router, Route, Switch } from 'wouter';

import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/sonner';
import { Loading } from '@/components/loading';
import { DragEventProvider } from '@/components/drag-provider';

import Layout from '@/layout';

import YTDownloader from '@/pages/yt-downloader';
const NoIntroOutro = lazy(() => import('@/pages/no-intro-outro'));
const IMGConverter = lazy(() => import('@/pages/img-manipulation/converter'));
const IMGCompressor = lazy(() => import('@/pages/img-manipulation/compressor'));
const FilenameReplacer = lazy(() => import('@/pages/filename-replacer'));

import { setTheme } from '@/lib/utils';

setTheme();

function App() {
	return (
		<DragEventProvider>
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
				<Router>
					<Suspense fallback={<Loading />}>
						<Switch>
							<Layout>
								<Route
									path="/(yt-downloader|)"
									component={YTDownloader}
								/>
								<Route
									path="/no-intro-outro"
									component={NoIntroOutro}
								/>
									<Route
										path="/image-manipulation/converter"
										component={IMGConverter}
									/>
									<Route
										path="/image-manipulation/compressor"
										component={IMGCompressor}
									/>
								<Route
									path="/filename-replacer"
									component={FilenameReplacer}
								/>
							</Layout>
						</Switch>
					</Suspense>
				</Router>
			</ErrorBoundary>
		</DragEventProvider>
	);
}

export default App;
