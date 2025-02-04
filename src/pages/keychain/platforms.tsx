import {
	TwitchIcon,
	EllipsisVerticalIcon,
	MailIcon,
	GithubIcon,
	Gamepad2Icon,
	LinkedinIcon,
	WifiIcon,
	RouterIcon,
} from 'lucide-react';

export const platforms = {
	Gmail: {
		value: 'gmail',
		icon: <MailIcon className="text-red-400 w-5" />,
	},
	Github: {
		value: 'github',
		icon: <GithubIcon className="text-gray-300 w-5" />,
	},
	Steam: {
		value: 'steam',
		icon: <Gamepad2Icon className="text-sky-700 w-5" />,
	},
	LinkedIn: {
		value: 'linkedin',
		icon: <LinkedinIcon className="text-blue-400 w-5" />,
	},
	'Wi-fi': {
		value: 'wi-fi',
		icon: <WifiIcon className="text-blue-300 w-5" />,
	},
	Router: {
		value: 'router',
		icon: <RouterIcon className="text-green-400 w-5" />,
	},
	Twitch: {
		value: 'twitch',
		icon: <TwitchIcon className="text-purple-400 w-5" />,
	},
	Other: {
		value: 'Other',
		icon: <EllipsisVerticalIcon className="w-5" />,
	},
};
