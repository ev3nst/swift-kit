import { lazy, Suspense } from 'react';
import { Router, Route, Switch } from 'wouter';

import { ErrorBoundary } from '@/components/error-boundary';
import { Loading } from '@/components/loading';

import Layout from './layout';
import YTDownloader from './pages/yt-downloader';

const NoIntroOutro = lazy(() => import('@/pages/no-intro-outro'));
const IMGConverter = lazy(() => import('@/pages/img-converter'));
const IMGCompressor = lazy(() => import('@/pages/img-compressor'));
const FilenameReplacer = lazy(() => import('@/pages/filename-replacer'));

import { setTheme } from '@/lib/utils';

import './index.css';

setTheme();

function App() {
	return (
		<ErrorBoundary>
			<Router>
				<Suspense fallback={<Loading />}>
					<Switch>
						<Layout>
							<Route path="/(yt-downloader|)" component={YTDownloader} />
							<Route path="/no-intro-outro" component={NoIntroOutro} />
							<Route
								path="/image-converter"
								component={IMGConverter}
							/>
							<Route path="/image-compressor" component={IMGCompressor} />
							<Route
								path="/filename-replacer"
								component={FilenameReplacer}
							/>
						</Layout>
					</Switch>
				</Suspense>
			</Router>
		</ErrorBoundary>
	);
}

export default App;
