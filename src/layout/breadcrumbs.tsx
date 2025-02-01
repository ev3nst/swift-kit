import React from 'react';
import { Link, useLocation } from 'wouter';

import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from '@/components/breadcrumb';

export const Breadcrumbs = () => {
	const [wouterLocation] = useLocation();
	const pathSegments = wouterLocation.split('/').filter(Boolean);
	const formatText = text =>
		text.replace(/-/g, ' ').replace(/\b\w/g, char => char.toUpperCase());

	return (
		<Breadcrumb>
			<BreadcrumbList>
				{pathSegments.map((segment, index) => {
					const href = `/${pathSegments
						.slice(0, index + 1)
						.join('/')}`;
					const isLast = index === pathSegments.length - 1;

					return (
						<React.Fragment key={`breadcrumb-${href}`}>
							<BreadcrumbItem
								className={isLast ? '' : 'hidden lg:block'}
							>
								{isLast ? (
									<BreadcrumbPage>
										{formatText(segment)}
									</BreadcrumbPage>
								) : (
									<BreadcrumbLink asChild>
										<Link to={href}>
											{formatText(segment)}
										</Link>
									</BreadcrumbLink>
								)}
							</BreadcrumbItem>
							{!isLast && (
								<BreadcrumbSeparator className="hidden lg:block" />
							)}
						</React.Fragment>
					);
				})}

				{location.pathname === '/' && (
					<BreadcrumbPage>Media</BreadcrumbPage>
				)}
			</BreadcrumbList>
		</Breadcrumb>
	);
};
