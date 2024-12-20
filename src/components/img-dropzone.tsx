import { useState, DragEvent, ChangeEvent, useRef } from 'react';
import { Image } from 'lucide-react';

const IMGDropzone = ({ handleFilesStateChange }) => {
	const dropZoneRef = useRef<HTMLDivElement | null>(null);
	const fileInputRef = useRef<HTMLInputElement | null>(null);
	const [isHovered, setIsHovered] = useState(false);

	const handleDrop = (e: DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		const files = Array.from(e.dataTransfer.files);
		handleFilesStateChange(files);
		setIsHovered(false);
	};

	const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
		e.preventDefault();
	};

	const handleDragEnter = () => {
		if (dropZoneRef.current) {
			setIsHovered(true);
		}
	};

	const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
		const relatedTarget = e.relatedTarget as HTMLElement;
		if (!dropZoneRef.current?.contains(relatedTarget)) {
			setIsHovered(false);
		}
	};

	const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
		const files = Array.from(e.target.files || []);
		handleFilesStateChange(files);
	};

	const handleClick = () => {
		if (fileInputRef.current) {
			fileInputRef.current.click();
		}
	};

	return (
		<div className="border-2 border-dashed w-full h-[150px]">
			<div
				ref={dropZoneRef}
				onDrop={handleDrop}
				onDragOver={handleDragOver}
				onClick={handleClick}
				onDragEnter={handleDragEnter}
				onDragLeave={handleDragLeave}
				className={`w-full h-full text-center cursor-pointer relative ${isHovered ? 'bg-secondary' : ''}`}
			>
				<div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center flex flex-col items-center gap-3">
					<Image className="w-6" />
					<p>Drag & drop images here, or click to select</p>
				</div>
				<input
					ref={fileInputRef}
					type="file"
					accept="image/*"
					multiple
					onChange={handleFileChange}
					className="hidden"
				/>
			</div>
		</div>
	);
};

export { IMGDropzone };
