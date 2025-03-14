import { useEffect, useRef } from 'react';
import { Editor, EditorContent, useEditor } from '@tiptap/react';
import { Color } from '@tiptap/extension-color';
import ListItem from '@tiptap/extension-list-item';
import TextStyle from '@tiptap/extension-text-style';
import Table from '@tiptap/extension-table';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import TableRow from '@tiptap/extension-table-row';
import Image from '@tiptap/extension-image';
import StarterKit from '@tiptap/starter-kit';
import { Sketch } from '@uiw/react-color';

import {
	BoldIcon,
	CodeIcon,
	Columns2Icon,
	Grid2x2XIcon,
	ItalicIcon,
	ListIcon,
	ListOrderedIcon,
	PaletteIcon,
	PilcrowIcon,
	QuoteIcon,
	RedoIcon,
	Rows2Icon,
	StrikethroughIcon,
	TableColumnsSplitIcon,
	TableIcon,
	TableRowsSplitIcon,
	TerminalIcon,
	UndoIcon,
} from 'lucide-react';

import { Button } from '@/components/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/popover';

function MenuBar({ editor }: { editor: Editor }) {
	const timeoutRef = useRef<any>(null);
	const handleColorChange = color => {
		if (timeoutRef.current) {
			clearTimeout(timeoutRef.current);
		}

		timeoutRef.current = setTimeout(() => {
			editor.chain().setColor(color.hex).run();
		}, 400);
	};

	if (!editor) {
		return null;
	}

	return (
		<div className="flex flex-wrap button-group mb-2">
			<Button
				variant="ghost"
				size="sm"
				onClick={() => editor.chain().focus().toggleBold().run()}
				disabled={!editor.can().chain().focus().toggleBold().run()}
				className={editor.isActive('bold') ? 'is-active' : ''}
			>
				<BoldIcon className="w-4" />
			</Button>
			<Button
				variant="ghost"
				size="sm"
				onClick={() => editor.chain().focus().toggleItalic().run()}
				disabled={!editor.can().chain().focus().toggleItalic().run()}
				className={editor.isActive('italic') ? 'is-active' : ''}
			>
				<ItalicIcon className="w-4" />
			</Button>
			<Button
				variant="ghost"
				size="sm"
				onClick={() => editor.chain().focus().toggleStrike().run()}
				disabled={!editor.can().chain().focus().toggleStrike().run()}
				className={editor.isActive('strike') ? 'is-active' : ''}
			>
				<StrikethroughIcon className="w-4" />
			</Button>
			<Button
				variant="ghost"
				size="sm"
				onClick={() => editor.chain().focus().toggleCode().run()}
				disabled={!editor.can().chain().focus().toggleCode().run()}
				className={editor.isActive('code') ? 'is-active' : ''}
			>
				<TerminalIcon className="w-4" />
			</Button>
			<Button
				variant="ghost"
				size="sm"
				onClick={() => editor.chain().focus().setParagraph().run()}
				className={editor.isActive('paragraph') ? 'is-active' : ''}
			>
				<PilcrowIcon className="w-4" />
			</Button>
			<Button
				variant="ghost"
				size="sm"
				onClick={() =>
					editor.chain().focus().toggleHeading({ level: 1 }).run()
				}
				className={
					editor.isActive('heading', { level: 1 })
						? 'is-active align-text-bottom'
						: 'align-text-bottom'
				}
			>
				H1
			</Button>
			<Button
				variant="ghost"
				size="sm"
				onClick={() =>
					editor.chain().focus().toggleHeading({ level: 2 }).run()
				}
				className={
					editor.isActive('heading', { level: 2 })
						? 'is-active align-text-bottom'
						: 'align-text-bottom'
				}
			>
				H2
			</Button>
			<Button
				variant="ghost"
				size="sm"
				onClick={() =>
					editor.chain().focus().toggleHeading({ level: 3 }).run()
				}
				className={
					editor.isActive('heading', { level: 3 })
						? 'is-active align-text-bottom'
						: 'align-text-bottom'
				}
			>
				H3
			</Button>
			<Button
				variant="ghost"
				size="sm"
				onClick={() => editor.chain().focus().toggleBulletList().run()}
				className={editor.isActive('bulletList') ? 'is-active' : ''}
			>
				<ListIcon className="w-4" />
			</Button>
			<Button
				variant="ghost"
				size="sm"
				onClick={() => editor.chain().focus().toggleOrderedList().run()}
				className={editor.isActive('orderedList') ? 'is-active' : ''}
			>
				<ListOrderedIcon className="w-4" />
			</Button>
			<Button
				variant="ghost"
				size="sm"
				onClick={() => editor.chain().focus().toggleCodeBlock().run()}
				className={editor.isActive('codeBlock') ? 'is-active' : ''}
			>
				<CodeIcon className="w-4" />
			</Button>
			<Button
				variant="ghost"
				size="sm"
				onClick={() => editor.chain().focus().toggleBlockquote().run()}
				className={editor.isActive('blockquote') ? 'is-active' : ''}
			>
				<QuoteIcon className="w-4" />
			</Button>
			<Button
				variant="ghost"
				size="sm"
				onClick={() =>
					editor
						.chain()
						.focus()
						.insertTable({
							rows: 3,
							cols: 3,
							withHeaderRow: true,
						})
						.run()
				}
			>
				<TableIcon className="w-4" />
			</Button>
			<Button
				variant="ghost"
				size="sm"
				onClick={() => editor.chain().focus().deleteTable().run()}
				disabled={!editor.can().deleteTable()}
			>
				<Grid2x2XIcon className="w-4" />
			</Button>
			<Button
				variant="ghost"
				size="sm"
				onClick={() => editor.chain().focus().addColumnAfter().run()}
				disabled={!editor.can().addColumnAfter()}
			>
				<Columns2Icon className="w-4" />
			</Button>
			<Button
				variant="ghost"
				size="sm"
				onClick={() => editor.chain().focus().deleteColumn().run()}
				disabled={!editor.can().deleteColumn()}
			>
				<TableColumnsSplitIcon className="w-4" />
			</Button>
			<Button
				variant="ghost"
				size="sm"
				onClick={() => editor.chain().focus().addRowAfter().run()}
				disabled={!editor.can().addRowAfter()}
			>
				<Rows2Icon className="w-4" />
			</Button>
			<Button
				variant="ghost"
				size="sm"
				onClick={() => editor.chain().focus().deleteRow().run()}
				disabled={!editor.can().deleteRow()}
			>
				<TableRowsSplitIcon className="w-4" />
			</Button>

			<Popover>
				<PopoverTrigger asChild>
					<Button
						variant="ghost"
						size="sm"
						className={
							editor.isActive('textStyle', {
								color: '#958DF1',
							})
								? 'is-active'
								: ''
						}
					>
						<PaletteIcon className="w-4" />
					</Button>
				</PopoverTrigger>
				<PopoverContent className="w-auto max-w-full border-0 bg-none">
					<Sketch onChange={color => handleColorChange(color)} />
				</PopoverContent>
			</Popover>
			<Button
				variant="ghost"
				size="sm"
				onClick={() => editor.chain().undo().run()}
				disabled={!editor.can().chain().undo().run()}
			>
				<UndoIcon className="w-4" />
			</Button>
			<Button
				variant="ghost"
				size="sm"
				onClick={() => editor.chain().redo().run()}
				disabled={!editor.can().chain().redo().run()}
			>
				<RedoIcon className="w-4" />
			</Button>
		</div>
	);
}

const extensions = [
	Color.configure({ types: [TextStyle.name, ListItem.name] }),
	TextStyle.configure({ types: [ListItem.name] } as any),

	Table.configure({
		resizable: true,
	}),
	TableRow,
	TableHeader,
	TableCell,
	Image.configure({
		inline: true,
	}),
	StarterKit.configure({
		bulletList: {
			keepMarks: true,
			keepAttributes: false, // TODO : Making this as `false` becase marks are not preserved when I try to preserve attrs, awaiting a bit of help
		},
		orderedList: {
			keepMarks: true,
			keepAttributes: false, // TODO : Making this as `false` becase marks are not preserved when I try to preserve attrs, awaiting a bit of help
		},
	}),
];

export default function Tiptap({ value, onChange }) {
	const editor = useEditor({
		extensions,
		content: value,
		onUpdate: ({ editor }) => {
			onChange(editor.getHTML());
		},
	});

	useEffect(() => {
		if (editor && editor.getHTML() !== value) {
			editor.commands.setContent(value);
		}
	}, [value, editor]);

	if (!editor) return;

	return (
		<div>
			<MenuBar editor={editor} />
			<EditorContent editor={editor} />
		</div>
	);
}
