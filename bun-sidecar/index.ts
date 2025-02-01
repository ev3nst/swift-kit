const command = process.argv[2];

switch (command) {
	case 'ping':
		// eslint-disable-next-line no-case-declarations
		const message = process.argv[3];
		console.log(`pong, ${message}`);
		break;
	default:
		console.error(`unknown command ${command}`);
		process.exit(1);
}
