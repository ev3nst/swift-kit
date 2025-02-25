import { useEffect, useState, ComponentType } from 'react';

import { PaginationControls } from '@/components/pagination-controls';

import { ModelStore } from '@/lib/store/generic';

import { MediaGridItem } from './partials/media-grid-item';
import { Filter } from './partials/filter';
import { MovieDetail } from './movie-detail';
import { AnimeDetail } from './anime-detail';
import { GameDetail } from './game-detail';

function createMediaComponent<T>(
	mediaType: string,
	mediaStore: () => ModelStore<T>,
	MediaModel: any,
): ComponentType {
	let MediaDetail;
	switch (mediaType) {
		case 'movie':
			MediaDetail = MovieDetail;
			break;
		case 'anime':
			MediaDetail = AnimeDetail;
			break;
		case 'game':
			MediaDetail = GameDetail;
			break;
		default:
			throw new Error('Media type not supported.');
			break;
	}

	return function MediaComponent() {
		const {
			data,
			pagination,
			total,
			filters,
			setData,
			setTotal,
			setPagination,
		} = mediaStore();

		const [isOpen, setIsOpen] = useState(false);
		const [currentMedia, setCurrentMedia] = useState<T | null>(null);

		const handlePageChange = (page: number) => {
			setPagination({ ...pagination, page });
		};

		const handlePerPageChange = (perPage: number) => {
			setPagination({ ...pagination, perPage, page: 1 });
		};

		useEffect(() => {
			const fetchData = async () => {
				const result = await (MediaModel as any).paginate(
					pagination.page,
					pagination.perPage,
					filters.search,
				);
				setData(result.data);
				setTotal(result.total);
			};

			fetchData();
			// eslint-disable-next-line react-hooks/exhaustive-deps
		}, [pagination.page, pagination.perPage, filters.search]);

		return (
			<>
				<Filter mediaStore={mediaStore} />
				<div className="flex flex-col mt-5">
					<div className="flex gap-3 flex-wrap">
						{data.map(media => (
							<MediaGridItem
								key={(media as any).id}
								media={media}
								onClick={() => {
									setCurrentMedia(media);
									setIsOpen(true);
								}}
							/>
						))}
					</div>

					<div className="sticky bottom-0 bg-background py-4">
						<PaginationControls
							currentPage={pagination.page}
							totalItems={total || 0}
							perPage={pagination.perPage}
							onPageChange={handlePageChange}
							onPerPageChange={handlePerPageChange}
						/>
					</div>

					{currentMedia && (
						<MediaDetail
							isOpen={isOpen}
							setIsOpen={setIsOpen}
							currentMedia={currentMedia}
						/>
					)}
				</div>
			</>
		);
	};
}

export default createMediaComponent;
