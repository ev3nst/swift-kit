const PageHeader = ({ title, description }) => (
	<div className="grid gap-2 text-center">
		<h1 className="text-3xl font-bold mb-0">{title}</h1>
		<p className="text-balance text-muted-foreground">{description}</p>
	</div>
);
export { PageHeader };
