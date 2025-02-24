import { useEffect, useState, ComponentType } from 'react';

import { MediaGridItem } from '@/components/media-grid-item';
import { PaginationControls } from '@/components/pagination-controls';

import { ModelStore } from '@/lib/store/generic';

import { MediaDetail } from './detail';
import { Filter } from './partials/filter';

function createMediaComponent<T>(
	mediaStore: () => ModelStore<T>,
	MediaModel: any,
): ComponentType {
	return function MediaComponent() {
		const { data, pagination, total, setData, setTotal, setPagination } =
			mediaStore();

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
				);
				setData(result.data);
				setTotal(result.total);
			};

			fetchData();
			// eslint-disable-next-line react-hooks/exhaustive-deps
		}, [pagination.page, pagination.perPage]);

		return (
			<>
				<Filter />
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
