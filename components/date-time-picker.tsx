"use client";

import * as Popover from "@radix-ui/react-popover";
import { useEffect, useRef, useState } from "react";
import { DayPicker } from "react-day-picker";
import { id as idLocale } from "react-day-picker/locale";
import {
  PiCalendarBlank,
  PiCaretDown,
  PiCaretLeft,
  PiCaretRight,
  PiClock,
} from "react-icons/pi";
import { cn } from "./cn";
import { buttonClass, inputClass } from "./ui";

type Time = { h: number; m: number };

const SLOTS: Time[] = Array.from({ length: 96 }, (_, i) => ({ h: Math.floor(i / 4), m: (i % 4) * 15 }));

const pad = (n: number) => String(n).padStart(2, "0");
const slotKey = (t: Time) => `${pad(t.h)}:${pad(t.m)}`;

function toInputValue(date: Date, time: Time) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${slotKey(time)}`;
}

export function DateTimePicker({
  name,
  id,
  required,
  placeholder = "Pilih tanggal & jam",
}: {
  name: string;
  id?: string;
  required?: boolean;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState<Date | undefined>();
  const [time, setTime] = useState<Time | undefined>();
  const [month, setMonth] = useState<Date>(() => new Date());
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const value = date && time ? toInputValue(date, time) : "";
  const dateLabel = date?.toLocaleDateString("id-ID", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  useEffect(() => {
    const form = inputRef.current?.form;
    if (!form) return;
    function onReset() {
      setDate(undefined);
      setTime(undefined);
    }
    form.addEventListener("reset", onReset);
    return () => form.removeEventListener("reset", onReset);
  }, []);

  useEffect(() => {
    if (!open) return;
    const frame = requestAnimationFrame(() => {
      const target =
        listRef.current?.querySelector<HTMLElement>('[data-active="true"]') ??
        listRef.current?.querySelector<HTMLElement>('[data-slot="09:00"]');
      target?.scrollIntoView({ block: "center" });
    });
    return () => cancelAnimationFrame(frame);
  }, [open]);

  function pickDate(next: Date | undefined) {
    setDate(next);
    if (next && time) setOpen(false);
  }

  function pickTime(next: Time) {
    setTime(next);
    if (date) setOpen(false);
  }

  function pickToday() {
    const today = new Date();
    setDate(today);
    setMonth(today);
  }

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <div className="relative">
        <input
          ref={inputRef}
          name={name}
          value={value}
          required={required}
          onChange={() => {}}
          onInvalid={() => setOpen(true)}
          tabIndex={-1}
          aria-hidden
          className="pointer-events-none absolute inset-0 size-full opacity-0"
        />
        <Popover.Trigger asChild>
          <button
            id={id}
            type="button"
            className={cn(inputClass, "flex items-center gap-2.5 text-left data-[state=open]:border-ink/60 data-[state=open]:ring-4 data-[state=open]:ring-lime/45")}
          >
            <PiCalendarBlank className="size-[18px] shrink-0 text-muted" />
            <span className={cn("min-w-0 flex-1 truncate", !date && "text-muted/80")}>
              {date ? (
                <>
                  <span className="capitalize">{dateLabel}</span>
                  {time ? (
                    <span className="ml-1.5 font-semibold tabular-nums">· {pad(time.h)}.{pad(time.m)}</span>
                  ) : (
                    <span className="ml-1.5 text-muted">· pilih jam</span>
                  )}
                </>
              ) : (
                placeholder
              )}
            </span>
            <PiCaretDown className={cn("size-4 shrink-0 text-muted transition-transform", open && "rotate-180")} />
          </button>
        </Popover.Trigger>
      </div>

      <Popover.Portal>
        <Popover.Content
          align="start"
          sideOffset={8}
          collisionPadding={16}
          className="z-[90] animate-pop-in rounded-[26px] border border-line bg-surface p-3 shadow-pop outline-none"
        >
          <div className="flex flex-col gap-3 sm:flex-row">
            <DayPicker
              mode="single"
              selected={date}
              onSelect={pickDate}
              month={month}
              onMonthChange={setMonth}
              locale={idLocale}
              weekStartsOn={1}
              showOutsideDays
              fixedWeeks
              navLayout="after"
              components={{
                Chevron: ({ orientation, className }) =>
                  orientation === "left" ? (
                    <PiCaretLeft className={cn("size-4", className)} />
                  ) : (
                    <PiCaretRight className={cn("size-4", className)} />
                  ),
              }}
              classNames={{
                root: "relative w-fit p-1",
                months: "flex flex-col",
                month: "space-y-2",
                month_caption: "flex h-9 items-center px-2",
                caption_label: "text-[14px] font-semibold capitalize tracking-[-0.01em] text-ink",
                nav: "absolute right-1 top-1 flex items-center gap-1",
                button_previous:
                  "grid size-8 place-items-center rounded-full text-ink-2 transition-colors hover:bg-surface-2 hover:text-ink disabled:opacity-40",
                button_next:
                  "grid size-8 place-items-center rounded-full text-ink-2 transition-colors hover:bg-surface-2 hover:text-ink disabled:opacity-40",
                month_grid: "border-collapse",
                weekdays: "flex",
                weekday: "w-10 pb-1 text-center text-[11px] font-medium uppercase tracking-wide text-muted",
                week: "flex",
                day: "group size-10 p-0.5 text-center",
                day_button:
                  "grid size-full place-items-center rounded-full text-[13px] text-ink tabular-nums outline-none transition-colors hover:bg-surface-2 focus-visible:ring-4 focus-visible:ring-lime/60",
                today: "[&>button]:font-semibold [&>button]:ring-1 [&>button]:ring-inset [&>button]:ring-ink/30",
                selected:
                  "[&>button]:bg-ink [&>button]:font-semibold [&>button]:text-white [&>button]:ring-0 [&>button]:hover:bg-ink",
                outside: "[&>button]:text-muted/60",
                disabled: "[&>button]:opacity-40",
              }}
            />

            <div className="flex flex-col border-line sm:w-28 sm:border-l sm:pl-3">
              <p className="mb-2 flex items-center gap-1.5 px-1 pt-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">
                <PiClock className="size-3.5" />
                Jam
              </p>
              <div
                ref={listRef}
                className="scrollbar-thin grid max-h-40 grid-cols-4 gap-1 overflow-y-auto pr-1 sm:block sm:max-h-[292px] sm:space-y-1"
              >
                {SLOTS.map((slot) => {
                  const active = time?.h === slot.h && time?.m === slot.m;
                  return (
                    <button
                      key={slotKey(slot)}
                      type="button"
                      data-slot={slotKey(slot)}
                      data-active={active}
                      onClick={() => pickTime(slot)}
                      className={cn(
                        "w-full rounded-xl py-2 text-[13px] tabular-nums transition-colors",
                        active ? "bg-ink font-semibold text-white" : "text-ink-2 hover:bg-surface-2 hover:text-ink",
                      )}
                    >
                      {pad(slot.h)}.{pad(slot.m)}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between gap-2 border-t border-line pt-3">
            <button type="button" onClick={pickToday} className={buttonClass("ghost", "sm")}>
              Hari ini
            </button>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => {
                  setDate(undefined);
                  setTime(undefined);
                }}
                className={buttonClass("ghost", "sm")}
              >
                Hapus
              </button>
              <Popover.Close className={buttonClass("primary", "sm")}>Selesai</Popover.Close>
            </div>
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
