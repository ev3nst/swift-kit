import { BellIcon } from 'lucide-react';

import { Popover, PopoverContent, PopoverTrigger } from '@/components/popover';
import { Button } from '@/components/button';
import { Separator } from '@/components/separator';

// This is sample data
const data = [
	{
		name: 'William Smith',
		email: 'williamsmith@example.com',
		subject: 'Meeting Tomorrow',
		date: '09:34 AM',
		teaser: 'Hi team, just a reminder about our meeting tomorrow at 10 AM.\nPlease come prepared with your project updates.',
	},
	{
		name: 'Alice Smith',
		email: 'alicesmith@example.com',
		subject: 'Re: Project Update',
		date: 'Yesterday',
		teaser: "Thanks for the update. The progress looks great so far.\nLet's schedule a call to discuss the next steps.",
	},
	{
		name: 'Bob Johnson',
		email: 'bobjohnson@example.com',
		subject: 'Weekend Plans',
		date: '2 days ago',
		teaser: "Hey everyone! I'm thinking of organizing a team outing this weekend.\nWould you be interested in a hiking trip or a beach day?",
	},
	{
		name: 'Emily Davis',
		email: 'emilydavis@example.com',
		subject: 'Re: Question about Budget',
		date: '2 days ago',
		teaser: "I've reviewed the budget numbers you sent over.\nCan we set up a quick call to discuss some potential adjustments?",
	},
	{
		name: 'Michael Wilson',
		email: 'michaelwilson@example.com',
		subject: 'Important Announcement',
		date: '1 week ago',
		teaser: "Please join us for an all-hands meeting this Friday at 3 PM.\nWe have some exciting news to share about the company's future.",
	},
	{
		name: 'Sarah Brown',
		email: 'sarahbrown@example.com',
		subject: 'Re: Feedback on Proposal',
		date: '1 week ago',
		teaser: "Thank you for sending over the proposal. I've reviewed it and have some thoughts.\nCould we schedule a meeting to discuss my feedback in detail?",
	},
	{
		name: 'David Lee',
		email: 'davidlee@example.com',
		subject: 'New Project Idea',
		date: '1 week ago',
		teaser: "I've been brainstorming and came up with an interesting project concept.\nDo you have time this week to discuss its potential impact and feasibility?",
	},
	{
		name: 'Olivia Wilson',
		email: 'oliviawilson@example.com',
		subject: 'Vacation Plans',
		date: '1 week ago',
		teaser: "Just a heads up that I'll be taking a two-week vacation next month.\nI'll make sure all my projects are up to date before I leave.",
	},
	{
		name: 'James Martin',
		email: 'jamesmartin@example.com',
		subject: 'Re: Conference Registration',
		date: '1 week ago',
		teaser: "I've completed the registration for the upcoming tech conference.\nLet me know if you need any additional information from my end.",
	},
	{
		name: 'Sophia White',
		email: 'sophiawhite@example.com',
		subject: 'Team Dinner',
		date: '1 week ago',
		teaser: "To celebrate our recent project success, I'd like to organize a team dinner.\nAre you available next Friday evening? Please let me know your preferences.",
	},
];

export function Notifications() {
	return (
		<Popover>
			<PopoverTrigger asChild>
				<Button variant="ghost" className="group/toggle h-8 w-8 px-0">
					<BellIcon />
					<span className="sr-only">Notifications</span>
				</Button>
			</PopoverTrigger>
			<PopoverContent
				align="start"
				className="z-40 w-[340px] rounded-[12px] bg-white p-6 dark:bg-zinc-950 px-0 pt-2.5 pb-0"
			>
				<NotificationsSummary />
			</PopoverContent>
		</Popover>
	);
}

function NotificationsSummary() {
	return (
		<div className="flex flex-col">
			<div className="flex justify-between items-center px-5 mb-2">
				<div className="font-semibold leading-none tracking-tight">
					Notifications
				</div>
				<Button variant="ghost" size="sm">
					Mark all as read
				</Button>
			</div>
			<Separator />
			<div className="flex flex-1 flex-col max-h-[450px] overflow-auto">
				{data.map(item => (
					<a
						href="#"
						key={item.email}
						className="flex flex-col items-start gap-2 whitespace-nowrap border-b p-4 text-sm leading-tight last:border-b-0 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
					>
						<div className="flex w-full items-center gap-2">
							<span>{item.name}</span>{' '}
							<span className="ml-auto text-xs">{item.date}</span>
						</div>
						<span className="font-medium">{item.subject}</span>
						<span className="line-clamp-2 w-[260px] whitespace-break-spaces text-xs">
							{item.teaser}
						</span>
					</a>
				))}
			</div>
			<Separator />
			<div className="w-full text-center px-4 py-2 text-sm ">
				<a className="text-primary" href="#">
					View all
				</a>
			</div>
		</div>
	);
}
