// fileName defaults to: {size}x{size}
// format defaults to: png
export const iconPresets = {
	'tauri-app': {
		title: 'Tauri App',
		icons: [
			{
				size: 32,
			},
			{
				size: 128,
			},
			{
				size: 256,
				fileName: '128x128@2x',
			},
			{
				size: 256,
				fileName: '128x128@2x',
			},
			{
				size: 128,
				fileName: 'icon',
				format: 'ico',
			},
			{
				size: 512,
				fileName: 'icon',
			},
			{
				size: 30,
				fileName: 'Square30x30Logo',
			},
			{
				size: 44,
				fileName: 'Square44x44Logo',
			},
			{
				size: 71,
				fileName: 'Square71x71Logo',
			},
			{
				size: 89,
				fileName: 'Square89x89Logo',
			},
			{
				size: 107,
				fileName: 'Square107x107Logo',
			},
			{
				size: 142,
				fileName: 'Square142x142Logo',
			},
			{
				size: 150,
				fileName: 'Square150x150Logo',
			},
			{
				size: 284,
				fileName: 'Square284x284Logo',
			},
			{
				size: 310,
				fileName: 'Square310x310Logo',
			},
			{
				size: 50,
				fileName: 'StoreLogo',
			},
		],
	},
	'android-mobile': {
		title: 'Android Mobile',
		icons: [
			{
				size: 48,
				fileName: 'mdpi',
			},
			{
				size: 72,
				fileName: 'hdpi',
			},
			{
				size: 96,
				fileName: 'xhdpi',
			},
			{
				size: 144,
				fileName: 'xxhdpi',
			},
			{
				size: 192,
				fileName: 'xxxhdpi',
			},
			{
				size: 512,
				fileName: 'play-store-icon',
			},
			{
				size: 192,
				fileName: 'notification-icon',
			},
		],
	},
	'ios-mobile': {
		title: 'iOS Mobile',
		icons: [
			{
				size: 60,
				fileName: 'iphone-icon-60x60',
			},
			{
				size: 120,
				fileName: 'iphone-icon-120x120',
			},
			{
				size: 180,
				fileName: 'iphone-icon-180x180',
			},
			{
				size: 76,
				fileName: 'ipad-icon-76x76',
			},
			{
				size: 152,
				fileName: 'ipad-icon-152x152',
			},
			{
				size: 167,
				fileName: 'ipad-pro-icon-167x167',
			},
			{
				size: 29,
				fileName: 'settings-icon-29x29',
			},
			{
				size: 58,
				fileName: 'settings-icon-58x58',
			},
			{
				size: 87,
				fileName: 'settings-icon-87x87',
			},
			{
				size: 120,
				fileName: 'home-icon-120x120',
			},
			{
				size: 1024,
				fileName: 'app-store-icon',
			},
		],
	},
};

export const iconPresetNames = Object.keys(iconPresets);
