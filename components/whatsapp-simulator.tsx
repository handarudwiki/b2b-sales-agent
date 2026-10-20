"use client";

import {
  useEffect,
  useLayoutEffect,
  useOptimistic,
  useRef,
  useState,
  useTransition,
  type FormEvent,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import type { IconType } from "react-icons";
import { BsCheck2All, BsClock } from "react-icons/bs";
import {
  IoArrowBack,
  IoBatteryFull,
  IoCall,
  IoCellular,
  IoEllipsisVertical,
  IoLockClosed,
  IoVideocam,
  IoWifi,
} from "react-icons/io5";
import {
  MdAttachFile,
  MdCameraAlt,
  MdMic,
  MdOutlineEmojiEmotions,
  MdSend,
} from "react-icons/md";
import {
  PiBooks,
  PiKeyboard,
  PiLeaf,
  PiLightbulb,
  PiRecord,
  PiRobot,
  PiSparkle,
  PiUsersThree,
  PiWarning,
  PiX,
} from "react-icons/pi";
import { sendMessage } from "@/app/actions";
import { cn } from "./cn";
import { useTopLoaderWhile } from "./top-loader";

export type ChatMessage = {
  id: string;
  sender: "PROSPECT" | "AI" | "HUMAN";
  body: string;
  time: string;
  day: string;
  grounded: boolean;
  fallback: boolean;
};

type Props = {
  className?: string;
  conversationId: string;
  businessName: string;
  messages: ChatMessage[];
  clock: string;
  animateIntro: boolean;
  suggestions: string[];
};

function typingDelay(length: number) {
  return Math.min(2600, 900 + length * 9);
}

function nowTime() {
  return new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
}

export function WhatsAppSimulator({
  className,
  conversationId,
  businessName,
  messages,
  clock,
  animateIntro,
  suggestions,
}: Props) {
  const [showInfo, setShowInfo] = useState(true);
  const [typingFx, setTypingFx] = useState(true);
  const [recording, setRecording] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [draft, setDraft] = useState("");
  const [seen, setSeen] = useState(() => new Set(animateIntro ? [] : messages.map((m) => m.id)));
  const [initialIds] = useState(() => new Set(animateIntro ? [] : messages.map((m) => m.id)));
  const [pending, startTransition] = useTransition();
  const [optimistic, addOptimistic] = useOptimistic(messages, (state: ChatMessage[], msg: ChatMessage) => [
    ...state,
    msg,
  ]);

  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const didInitialScroll = useRef(false);
  const infoBeforeRecording = useRef(true);

  useTopLoaderWhile(pending && !recording);

  const heldIds = new Set(
    typingFx ? messages.filter((m) => m.sender !== "PROSPECT" && !seen.has(m.id)).map((m) => m.id) : [],
  );
  const visible = optimistic.filter((m) => !heldIds.has(m.id));
  const typing = heldIds.size > 0;
  const nextHeld = typingFx ? messages.find((m) => heldIds.has(m.id)) : undefined;
  const nextHeldId = nextHeld?.id;
  const nextHeldLength = nextHeld?.body.length ?? 0;

  useEffect(() => {
    if (!nextHeldId) return;
    const timer = window.setTimeout(() => {
      setSeen((prev) => new Set(prev).add(nextHeldId));
    }, typingDelay(nextHeldLength));
    return () => window.clearTimeout(timer);
  }, [nextHeldId, nextHeldLength]);

  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: didInitialScroll.current ? "smooth" : "auto" });
    didInitialScroll.current = true;
  }, [visible.length, typing, showInfo]);

  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [recording]);

  useEffect(() => {
    if (!recording) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKey(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      setRecording(false);
      setShowInfo(infoBeforeRecording.current);
    }
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", onKey);
    };
  }, [recording]);

  useEffect(() => {
    if (!recording || !controlsVisible) return;
    const timer = window.setTimeout(() => setControlsVisible(false), 2200);
    return () => window.clearTimeout(timer);
  }, [recording, controlsVisible]);

  function markAllSeen() {
    setSeen(new Set(messages.map((m) => m.id)));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const body = draft.trim();
    if (!body) return;
    const formData = new FormData(event.currentTarget);
    formData.set("body", body);
    setDraft("");
    markAllSeen();
    startTransition(async () => {
      addOptimistic({
        id: `tmp-${Date.now()}`,
        sender: "PROSPECT",
        body,
        time: nowTime(),
        day: "Hari ini",
        grounded: false,
        fallback: false,
      });
      await sendMessage(formData);
    });
    inputRef.current?.focus();
  }

  function applySuggestion(text: string) {
    setDraft(text);
    inputRef.current?.focus();
  }

  function startRecording() {
    infoBeforeRecording.current = showInfo;
    setControlsVisible(true);
    setShowInfo(false);
    setRecording(true);
  }

  function stopRecording() {
    setRecording(false);
    setShowInfo(infoBeforeRecording.current);
  }

  const view = (
    <div
      onMouseMove={recording ? () => setControlsVisible(true) : undefined}
      className={cn(
        className,
        recording
          ? "fixed inset-0 z-[80] flex items-center justify-center overflow-hidden bg-canvas bg-[radial-gradient(900px_520px_at_50%_0%,rgb(212_246_90/0.38),transparent_70%),radial-gradient(700px_500px_at_100%_100%,rgb(0_168_132/0.14),transparent_70%)]"
          : "space-y-4",
      )}
    >
      {!recording && (
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1 rounded-full border border-line bg-surface p-1 shadow-[0_1px_1px_rgb(15_17_16/0.04)]">
            <ToggleChip active={showInfo} onClick={() => setShowInfo((v) => !v)} icon={PiSparkle}>
              Info AI
            </ToggleChip>
            <ToggleChip
              active={typingFx}
              onClick={() => {
                markAllSeen();
                setTypingFx((v) => !v);
              }}
              icon={PiKeyboard}
            >
              Efek mengetik
            </ToggleChip>
          </div>
          <button
            type="button"
            onClick={startRecording}
            className="inline-flex h-9 items-center gap-2 rounded-full bg-ink px-4 text-[12.5px] font-medium text-white shadow-[0_6px_16px_-8px_rgb(15_17_16/0.7)] transition hover:bg-[#262a27]"
          >
            <PiRecord className="size-4 text-rose-400" />
            Mode rekam
          </button>
        </div>
      )}

      {recording && (
        <div
          className={cn(
            "absolute right-5 top-5 z-10 flex items-center gap-1 rounded-full border border-line bg-surface/90 p-1 shadow-pop backdrop-blur transition-opacity duration-500",
            controlsVisible ? "opacity-100" : "pointer-events-none opacity-0",
          )}
        >
          <ToggleChip active={showInfo} onClick={() => setShowInfo((v) => !v)} icon={PiSparkle}>
            Info AI
          </ToggleChip>
          <ToggleChip
            active={typingFx}
            onClick={() => {
              markAllSeen();
              setTypingFx((v) => !v);
            }}
            icon={PiKeyboard}
          >
            Efek mengetik
          </ToggleChip>
          <button
            type="button"
            onClick={stopRecording}
            className="inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-[12px] font-medium text-ink-2 transition hover:bg-surface-2 hover:text-ink"
          >
            <PiX className="size-3.5" />
            Keluar
            <kbd className="rounded-md border border-line bg-surface-2 px-1.5 font-sans text-[10px] text-muted">Esc</kbd>
          </button>
        </div>
      )}

      <div className="flex justify-center">
        <div
          className={cn(
            "relative rounded-[56px] bg-[#111214] p-[10px] shadow-[0_0_0_1.5px_#2c2d31,inset_0_0_0_1px_#3a3b40,0_40px_80px_-30px_rgb(15_17_16/0.55),0_18px_36px_-18px_rgb(15_17_16/0.35)]",
            recording ? "h-[min(900px,calc(100dvh-48px))]" : "h-[min(820px,calc(100dvh-220px))] min-h-140",
          )}
          style={{ aspectRatio: "9 / 19.5" }}
        >
          <span className="absolute -left-[3px] top-[17%] h-9 w-[3px] rounded-l-sm bg-[#2a2b2f]" />
          <span className="absolute -left-[3px] top-[24%] h-16 w-[3px] rounded-l-sm bg-[#2a2b2f]" />
          <span className="absolute -right-[3px] top-[21%] h-20 w-[3px] rounded-r-sm bg-[#2a2b2f]" />

          <div className="relative flex h-full flex-col overflow-hidden rounded-[46px] bg-wa-bg font-wa antialiased">
            <StatusBar initialClock={clock} />

            <header className="flex shrink-0 items-center bg-wa-header px-1.5 pb-2.5 pt-1 text-white">
              <IoArrowBack className="mx-1 size-6 shrink-0" />
              <span className="grid size-[38px] shrink-0 place-items-center rounded-full bg-gradient-to-br from-emerald-300 to-lime-200 text-[#0b4a37]">
                <PiLeaf className="size-5" />
              </span>
              <div className="ml-2.5 min-w-0 flex-1">
                <p className="truncate text-[16.5px] font-medium leading-tight">{businessName}</p>
                <p className="truncate text-[12.5px] leading-tight text-white/80">{typing ? "mengetik…" : "online"}</p>
              </div>
              <IoVideocam className="mx-2.5 size-[22px] shrink-0" />
              <IoCall className="mx-2 size-[19px] shrink-0" />
              <IoEllipsisVertical className="ml-1.5 mr-1 size-5 shrink-0" />
            </header>

            <div className="wa-wallpaper relative flex min-h-0 flex-1 flex-col">
              <div ref={scrollRef} className="scrollbar-none min-h-0 flex-1 overflow-y-auto px-[4.5%] pb-2 pt-2">
                <div className="mx-auto mb-1 mt-1 max-w-[90%] rounded-lg bg-wa-notice px-3 py-1.5 text-center text-[12px] leading-[16px] text-[#54656f] shadow-[0_1px_0.5px_rgb(11_20_26/0.13)]">
                  <IoLockClosed className="mb-0.5 mr-1 inline size-3" />
                  Pesan dan panggilan terenkripsi secara end-to-end. Tidak seorang pun di luar chat ini, termasuk
                  WhatsApp, yang dapat membaca atau mendengarkannya.
                </div>

                {visible.map((m, i) => {
                  const prev = visible[i - 1];
                  const out = m.sender === "PROSPECT";
                  const newDay = !prev || prev.day !== m.day;
                  const tail = newDay || !prev || (prev.sender === "PROSPECT") !== out;
                  const isTemp = m.id.startsWith("tmp-");
                  const read = out && visible.slice(i + 1).some((n) => n.sender !== "PROSPECT");
                  return (
                    <div key={m.id}>
                      {newDay && (
                        <div className="my-2.5 flex justify-center">
                          <span className="rounded-lg bg-white px-3 py-[5px] text-[12px] font-medium text-[#54656f] shadow-[0_1px_0.5px_rgb(11_20_26/0.13)]">
                            {m.day}
                          </span>
                        </div>
                      )}
                      <Bubble
                        out={out}
                        tail={tail}
                        animate={!initialIds.has(m.id)}
                        time={m.time}
                        status={out ? (isTemp ? "pending" : read ? "read" : "delivered") : undefined}
                        annotation={!out && showInfo ? <Annotation message={m} /> : null}
                      >
                        {m.body}
                      </Bubble>
                    </div>
                  );
                })}

                {typing && <TypingBubble />}
              </div>

              <form onSubmit={handleSubmit} className="flex shrink-0 items-end gap-1.5 px-1.5 pb-1 pt-1">
                <input type="hidden" name="conversationId" value={conversationId} />
                <div className="flex min-h-[46px] min-w-0 flex-1 items-center rounded-[24px] bg-white pl-1 pr-1.5 shadow-[0_1px_0.5px_rgb(11_20_26/0.13)]">
                  <span aria-hidden className="grid size-10 shrink-0 place-items-center text-wa-icon">
                    <MdOutlineEmojiEmotions className="size-6" />
                  </span>
                  <input
                    ref={inputRef}
                    name="body"
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    autoComplete="off"
                    placeholder="Ketik pesan"
                    aria-label="Ketik pesan"
                    className="min-w-0 flex-1 bg-transparent py-2.5 text-[16px] text-wa-text caret-wa-green outline-none placeholder:text-[#8696a0]"
                  />
                  <span aria-hidden className="grid size-9 shrink-0 place-items-center text-wa-icon">
                    <MdAttachFile className="size-[22px] -rotate-45" />
                  </span>
                  {!draft && (
                    <span aria-hidden className="grid size-9 shrink-0 place-items-center text-wa-icon">
                      <MdCameraAlt className="size-[22px]" />
                    </span>
                  )}
                </div>
                <button
                  type={draft.trim() ? "submit" : "button"}
                  onClick={draft.trim() ? undefined : () => inputRef.current?.focus()}
                  aria-label={draft.trim() ? "Kirim" : "Pesan suara"}
                  className="grid size-[46px] shrink-0 place-items-center rounded-full bg-wa-green text-white shadow-[0_1px_1px_rgb(11_20_26/0.2)] transition-transform active:scale-95"
                >
                  {draft.trim() ? <MdSend className="size-[22px] translate-x-px" /> : <MdMic className="size-6" />}
                </button>
              </form>
              <div className="flex h-5 shrink-0 items-center justify-center">
                <span className="h-[4px] w-[34%] rounded-full bg-black/75" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {!recording && suggestions.length > 0 && (
        <div className="rounded-3xl border border-line bg-surface p-3">
          <p className="mb-2 flex items-center gap-1.5 px-1 text-[11.5px] font-medium text-muted">
            <PiLightbulb className="size-3.5" />
            Coba tanyakan
          </p>
          <div className="flex flex-wrap gap-1.5">
            {suggestions.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => applySuggestion(s)}
                className="rounded-full border border-line bg-surface-2 px-3 py-1.5 text-[12.5px] text-ink-2 transition-colors hover:border-ink hover:bg-ink hover:text-white"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {recording && (
        <span
          className={cn(
            "absolute bottom-4 right-5 rounded-full bg-surface/80 px-3 py-1 text-[11px] font-medium text-muted backdrop-blur transition-opacity duration-500",
            controlsVisible ? "opacity-100" : "opacity-60",
          )}
        >
          Simulasi WhatsApp · Prospera
        </span>
      )}
    </div>
  );

  return recording ? createPortal(view, document.body) : view;
}

function StatusBar({ initialClock }: { initialClock: string }) {
  const [clock, setClock] = useState(initialClock);

  useEffect(() => {
    const timer = window.setInterval(() => setClock(nowTime()), 20000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className="relative flex h-[30px] shrink-0 items-end justify-between bg-wa-header px-7 pb-1 text-[12.5px] font-medium text-white">
      <span className="tabular-nums">{clock}</span>
      <span aria-hidden className="absolute left-1/2 top-[8px] size-[13px] -translate-x-1/2 rounded-full bg-black ring-2 ring-black/40" />
      <span className="flex items-center gap-1">
        <IoCellular className="size-3.5" />
        <IoWifi className="size-3.5" />
        <IoBatteryFull className="size-[19px]" />
      </span>
    </div>
  );
}

function Bubble({
  out,
  tail,
  animate,
  time,
  status,
  annotation,
  children,
}: {
  out: boolean;
  tail: boolean;
  animate: boolean;
  time: string;
  status?: "pending" | "delivered" | "read";
  annotation?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className={cn("flex flex-col", out ? "items-end" : "items-start", tail ? "mt-2.5" : "mt-[3px]")}>
      <div
        className={cn(
          "relative max-w-[82%] rounded-[9px] px-[9px] pb-[7px] pt-[6px] text-[14.5px] leading-[19.5px] text-wa-text shadow-[0_1px_0.5px_rgb(11_20_26/0.13)]",
          out ? "bg-wa-out" : "bg-wa-in",
          tail && (out ? "rounded-tr-none" : "rounded-tl-none"),
          animate && (out ? "origin-bottom-right animate-pop-in" : "origin-bottom-left animate-pop-in"),
        )}
      >
        {tail && (
          <svg
            aria-hidden
            viewBox="0 0 8 13"
            className={cn("absolute top-0 h-[13px] w-2", out ? "-right-2 text-wa-out" : "-left-2 text-wa-in")}
          >
            <path
              fill="currentColor"
              d={out ? "M0 0h6.6c1.2 0 1.9 1.3 1.2 2.3L0 12.6z" : "M8 0H1.4C.2 0-.5 1.3.2 2.3L8 12.6z"}
            />
          </svg>
        )}
        <span className="whitespace-pre-wrap break-words">{children}</span>
        <span aria-hidden className={cn("inline-block align-bottom", out ? "w-[66px]" : "w-[42px]")} />
        <span className="absolute bottom-[5px] right-[8px] flex items-center gap-[3px] text-[11px] leading-none text-wa-meta">
          {time}
          {status === "pending" && <BsClock className="size-[11px]" />}
          {status === "delivered" && <BsCheck2All className="size-4" />}
          {status === "read" && <BsCheck2All className="size-4 text-wa-tick" />}
        </span>
      </div>
      {annotation}
    </div>
  );
}

function Annotation({ message }: { message: ChatMessage }) {
  const config: { icon: IconType; label: string; className: string } = message.fallback
    ? { icon: PiWarning, label: "Fallback · diteruskan ke sales", className: "text-amber-700" }
    : message.grounded
      ? { icon: PiBooks, label: "Dijawab dari basis pengetahuan", className: "text-emerald-700" }
      : message.sender === "HUMAN"
        ? { icon: PiUsersThree, label: "Balasan tim sales", className: "text-violet-700" }
        : { icon: PiRobot, label: "Asisten AI", className: "text-sky-700" };
  const Icon = config.icon;
  return (
    <span
      className={cn(
        "mt-1 inline-flex animate-fade-in items-center gap-1 rounded-full bg-white/90 px-2 py-[3px] text-[10.5px] font-medium shadow-[0_1px_0.5px_rgb(11_20_26/0.13)]",
        config.className,
      )}
    >
      <Icon className="size-3" />
      {config.label}
    </span>
  );
}

function TypingBubble() {
  return (
    <div className="mt-2.5 flex">
      <div className="relative animate-pop-in rounded-[9px] rounded-tl-none bg-wa-in px-3.5 py-3 shadow-[0_1px_0.5px_rgb(11_20_26/0.13)]">
        <svg aria-hidden viewBox="0 0 8 13" className="absolute -left-2 top-0 h-[13px] w-2 text-wa-in">
          <path fill="currentColor" d="M8 0H1.4C.2 0-.5 1.3.2 2.3L8 12.6z" />
        </svg>
        <span className="flex items-center gap-1" aria-label="mengetik">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="size-[7px] animate-typing rounded-full bg-[#8696a0]"
              style={{ animationDelay: `${i * 160}ms` }}
            />
          ))}
        </span>
      </div>
    </div>
  );
}

function ToggleChip({
  active,
  onClick,
  icon: Icon,
  children,
}: {
  active: boolean;
  onClick: () => void;
  icon: IconType;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-[12px] font-medium transition-colors",
        active ? "bg-lime text-ink" : "text-ink-2 hover:bg-surface-2 hover:text-ink",
      )}
    >
      <Icon className="size-3.5" />
      {children}
    </button>
  );
}
