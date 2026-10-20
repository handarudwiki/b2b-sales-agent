"use client";

import "@mdxeditor/editor/style.css";
import {
  BlockTypeSelect,
  BoldItalicUnderlineToggles,
  CreateLink,
  InsertThematicBreak,
  ListsToggle,
  MDXEditor,
  Separator,
  UndoRedo,
  headingsPlugin,
  linkDialogPlugin,
  linkPlugin,
  listsPlugin,
  markdownShortcutPlugin,
  quotePlugin,
  thematicBreakPlugin,
  toolbarPlugin,
  type IconKey,
} from "@mdxeditor/editor";
import type { IconType } from "react-icons";
import {
  PiArrowClockwise,
  PiArrowCounterClockwise,
  PiArrowSquareOut,
  PiCaretDown,
  PiCheck,
  PiCopy,
  PiDotsThree,
  PiDotsThreeVertical,
  PiGear,
  PiLink,
  PiLinkBreak,
  PiListBullets,
  PiListNumbers,
  PiMinus,
  PiPencilSimple,
  PiTextB,
  PiTextItalic,
  PiTrash,
  PiX,
} from "react-icons/pi";

const ICONS: Partial<Record<IconKey, IconType>> = {
  undo: PiArrowCounterClockwise,
  redo: PiArrowClockwise,
  format_bold: PiTextB,
  format_italic: PiTextItalic,
  format_list_bulleted: PiListBullets,
  format_list_numbered: PiListNumbers,
  link: PiLink,
  link_off: PiLinkBreak,
  horizontal_rule: PiMinus,
  arrow_drop_down: PiCaretDown,
  open_in_new: PiArrowSquareOut,
  edit: PiPencilSimple,
  content_copy: PiCopy,
  close: PiX,
  check: PiCheck,
  delete_big: PiTrash,
  delete_small: PiTrash,
  more_horiz: PiDotsThree,
  more_vert: PiDotsThreeVertical,
  settings: PiGear,
};

const LABELS: Record<string, string> = {
  "toolbar.undo": "Urungkan {{shortcut}}",
  "toolbar.redo": "Ulangi {{shortcut}}",
  "toolbar.blockTypes.heading": "Judul {{level}}",
  "toolbar.blockTypes.paragraph": "Paragraf",
  "toolbar.blockTypes.quote": "Kutipan",
  "toolbar.blockTypeSelect.placeholder": "Jenis blok",
  "toolbar.blockTypeSelect.selectBlockTypeTooltip": "Pilih jenis blok",
  "toolbar.bold": "Tebal",
  "toolbar.removeBold": "Hapus tebal",
  "toolbar.italic": "Miring",
  "toolbar.removeItalic": "Hapus miring",
  "toolbar.bulletedList": "Daftar poin",
  "toolbar.numberedList": "Daftar bernomor",
  "toolbar.link": "Sisipkan tautan",
  "toolbar.thematicBreak": "Garis pemisah",
  "createLink.url": "URL",
  "createLink.urlPlaceholder": "Tempel URL",
  "createLink.text": "Teks tautan",
  "createLink.textTooltip": "Teks yang ditampilkan",
  "createLink.title": "Judul tautan",
  "createLink.titleTooltip": "Muncul saat kursor diarahkan",
  "createLink.saveTooltip": "Simpan URL",
  "createLink.cancelTooltip": "Batal",
  "dialogControls.cancel": "Batal",
  "dialogControls.save": "Simpan",
  "dialog.close": "Tutup",
  "linkPreview.edit": "Ubah URL",
  "linkPreview.remove": "Hapus tautan",
  "linkPreview.copyToClipboard": "Salin",
  "linkPreview.copied": "Tersalin!",
};

function translate(key: string, defaultValue: string, interpolations?: Record<string, unknown>) {
  let text = LABELS[key] ?? defaultValue;
  for (const [name, value] of Object.entries(interpolations ?? {})) {
    text = text.replaceAll(`{{${name}}}`, String(value));
  }
  return text;
}

export default function MarkdownEditor({
  markdown,
  onChange,
}: {
  markdown: string;
  onChange: (markdown: string) => void;
}) {
  return (
    <MDXEditor
      markdown={markdown}
      onChange={(value) => onChange(value)}
      className="mdx-shell"
      contentEditableClassName="md-prose"
      translation={translate}
      iconComponentFor={(name) => {
        const Icon = ICONS[name] ?? PiDotsThree;
        return <Icon className="size-[18px]" />;
      }}
      plugins={[
        headingsPlugin({ allowedHeadingLevels: [1, 2, 3] }),
        listsPlugin(),
        quotePlugin(),
        thematicBreakPlugin(),
        linkPlugin(),
        linkDialogPlugin(),
        markdownShortcutPlugin(),
        toolbarPlugin({
          toolbarClassName: "mdx-toolbar",
          toolbarContents: () => (
            <>
              <UndoRedo />
              <Separator />
              <BlockTypeSelect />
              <Separator />
              <BoldItalicUnderlineToggles options={["Bold", "Italic"]} />
              <Separator />
              <ListsToggle options={["bullet", "number"]} />
              <CreateLink />
              <InsertThematicBreak />
            </>
          ),
        }),
      ]}
    />
  );
}
