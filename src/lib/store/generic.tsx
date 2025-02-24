import { create } from 'zustand';

export interface Pagination {
	page: number;
	perPage: number;
	sortBy: string;
	sortOrder: 'asc' | 'desc';
}

export interface Filters {
	search: string;
	genre: string;
	year: string;
	rating?: number;
	[key: string]: any;
}

export interface ModelStore<T> {
	data: T[];
	total: number;
	filters: Filters;
	pagination: Pagination;
	setData: (data: T[]) => void;
	setTotal: (total: number) => void;
	setFilters: (filters: Filters) => void;
	setPagination: (pagination: Pagination) => void;
}

export function genericModelStore<T>() {
	return create<ModelStore<T>>(set => ({
		data: [],
		total: 0,
		filters: {
			search: '',
			genre: '',
			person: '',
			year: '',
			rating: undefined,
		},
		pagination: {
			page: 1,
			perPage: 10,
			sortBy: 'id',
			sortOrder: 'desc',
		},
		setData: data => set({ data }),
		setTotal: total => set({ total }),
		setFilters: filters => set({ filters }),
		setPagination: pagination => set({ pagination }),
	}));
}
