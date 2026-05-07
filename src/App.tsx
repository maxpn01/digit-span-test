import { useCallback, useEffect, useRef, useState } from "react";
import { Brain, CircleHelp } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/utils";

type Speed = "slow" | "fast";

const speedDelay: Record<Speed, number> = {
  slow: 900,
  fast: 450,
};

const digitSpanDescriptionUrl =
  "http://help.cambridgebrainsciences.com/en/articles/624895-what-is-the-digit-span-test";
const githubRepoUrl = "https://github.com/maxpn01/digit-span-test";
const countOptions = Array.from({ length: 10 }, (_, index) => index + 3);
const successMessages = [
  "🥳 you got it!",
  "🙂 correct!",
  "🧠 the brain is braining!",
  "😎 working memory activate",
];
const failureMessages = [
  "🤔 thas a bit wrong ...",
  "☹️ incorrect",
  "🫠 it's ok, go get some rest",
  "🙃 not this time boiiii",
];

function generateDigits(count: number) {
  const digits: string[] = [];

  while (digits.length < count) {
    const digit = String(Math.floor(Math.random() * 9) + 1);

    if (digit !== digits.at(-1)) {
      digits.push(digit);
    }
  }

  return digits;
}

function pickMessage(messages: string[], previousMessage: string) {
  const availableMessages =
    messages.length > 1
      ? messages.filter((message) => message !== previousMessage)
      : messages;

  return availableMessages[
    Math.floor(Math.random() * availableMessages.length)
  ];
}

function App() {
  const [digits, setDigits] = useState("");
  const [digitCount, setDigitCount] = useState(5);
  const [speed, setSpeed] = useState<Speed>("slow");
  const [isRunning, setIsRunning] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [result, setResult] = useState<"success" | "failure" | null>(null);
  const [resultMessage, setResultMessage] = useState("");
  const [sequence, setSequence] = useState<string[]>([]);
  const [step, setStep] = useState(0);
  const timerRef = useRef<number | null>(null);

  const stop = useCallback(() => {
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    setIsRunning(false);
    setHasStarted(false);
    setResult(null);
    setResultMessage("");
    setStep(0);
  }, []);

  const start = useCallback(() => {
    const nextSequence = generateDigits(digitCount);
    setDigits("");
    setSequence(nextSequence);
    setStep(0);
    setHasStarted(true);
    setResult(null);
    setResultMessage("");
    setIsRunning(true);
  }, [digitCount]);

  const toggleTest = useCallback(() => {
    if (isRunning) {
      stop();
      return;
    }

    start();
  }, [isRunning, start, stop]);

  const addDigit = useCallback(
    (digit: string) => {
      if (!hasStarted || isRunning) {
        return;
      }

      const nextDigits = `${digits}${digit}`.slice(0, sequence.length);

      setDigits(nextDigits);

      if (nextDigits.length === sequence.length) {
        const nextResult =
          nextDigits === sequence.join("") ? "success" : "failure";

        setResult(nextResult);
        setResultMessage(
          pickMessage(
            nextResult === "success" ? successMessages : failureMessages,
            resultMessage,
          ),
        );
        setHasStarted(false);
      }
    },
    [digits, hasStarted, isRunning, resultMessage, sequence],
  );

  useEffect(() => {
    if (!isRunning || sequence.length === 0) {
      return undefined;
    }

    timerRef.current = window.setTimeout(() => {
      const nextStep = step + 1;

      if (nextStep >= sequence.length) {
        setDigits("");
        setIsRunning(false);
        timerRef.current = null;
        return;
      }

      setStep(nextStep);
    }, speedDelay[speed]);

    return () => {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
      }
    };
  }, [isRunning, sequence, speed, step]);

  const expectedDigits = sequence.join("");
  const displayedDigits = isRunning
    ? (sequence[step] ?? "")
    : hasStarted || result
      ? digits
      : digits || "0";

  return (
    <main className="app-main bg-background text-foreground flex min-h-screen items-center justify-center px-5">
      <a
        aria-label="Open GitHub repository"
        className="github-link text-muted-foreground hover:text-foreground focus-visible:ring-ring hover:bg-accent absolute top-5 right-5 inline-flex size-10 items-center justify-center rounded-full border transition-colors focus-visible:ring-2 focus-visible:outline-none"
        href={githubRepoUrl}
        rel="noreferrer"
        target="_blank"
      >
        <svg
          aria-hidden="true"
          className="size-5"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M12 .5A11.5 11.5 0 0 0 8.36 22.9c.58.1.79-.25.79-.56v-2.15c-3.22.7-3.9-1.38-3.9-1.38-.53-1.34-1.29-1.7-1.29-1.7-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.2 1.77 1.2 1.04 1.76 2.71 1.25 3.37.96.1-.75.4-1.25.73-1.54-2.57-.3-5.27-1.29-5.27-5.72 0-1.26.45-2.3 1.2-3.1-.12-.3-.52-1.48.11-3.06 0 0 .97-.31 3.18 1.18a10.9 10.9 0 0 1 5.8 0c2.2-1.49 3.17-1.18 3.17-1.18.64 1.58.24 2.76.12 3.06.75.8 1.2 1.84 1.2 3.1 0 4.45-2.7 5.42-5.28 5.7.42.37.79 1.09.79 2.2v3.13c0 .31.2.67.8.56A11.5 11.5 0 0 0 12 .5Z" />
        </svg>
      </a>

      <section className="app-shell w-full max-w-sm">
        <header className="app-header mb-10 flex items-center justify-center gap-3">
          <Brain className="app-brain-icon size-10" strokeWidth={1.8} />
          <h1 className="app-title text-4xl font-semibold tracking-normal text-gray-800">
            Digit Span Test
          </h1>
          <a
            aria-label="Read a description of the Digit Span test"
            className="group text-muted-foreground hover:text-foreground focus-visible:ring-ring relative inline-flex size-8 items-center justify-center rounded-full transition-colors focus-visible:ring-2 focus-visible:outline-none"
            href={digitSpanDescriptionUrl}
            rel="noreferrer"
            target="_blank"
          >
            <CircleHelp className="size-4" strokeWidth={1.9} />
            <span className="bg-background text-foreground pointer-events-none absolute top-full left-1/2 z-10 mt-2 w-48 -translate-x-1/2 rounded-md border px-3 py-2 text-center text-xs opacity-0 shadow-sm transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
              What is the Digit Span test?
            </span>
          </a>
        </header>

        <div className="space-y-7">
          <div className="space-y-3">
            <div
              aria-label="Digit display"
              className="flex h-20 w-full items-center justify-center gap-1 border-b-2 border-black bg-transparent text-center font-sans text-4xl tracking-[0.18em] tabular-nums select-none"
              role="status"
            >
              {result
                ? digits.split("").map((digit, index) => (
                    <span
                      className={cn(
                        result === "success" && "text-green-600",
                        result === "failure" &&
                          digit !== sequence[index] &&
                          "text-red-600",
                      )}
                      key={`${digit}-${index}`}
                    >
                      {digit}
                    </span>
                  ))
                : displayedDigits}
            </div>

            <p
              className={cn(
                "status-message h-10 text-center text-sm font-medium",
                result === "success" && "text-green-600",
                result === "failure" && "text-red-600",
                result === null && "text-muted-foreground",
              )}
            >
              {result === "success" ? (
                resultMessage
              ) : result === "failure" ? (
                <>
                  {resultMessage}
                  <span className="text-muted-foreground block">
                    Correct: {expectedDigits}
                  </span>
                </>
              ) : hasStarted && !isRunning ? (
                `Enter ${sequence.length} digits`
              ) : (
                ""
              )}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {Array.from({ length: 9 }, (_, index) => String(index + 1)).map(
              (digit) => (
                <Button
                  className="h-14 text-xl"
                  disabled={!hasStarted || isRunning}
                  key={digit}
                  onClick={() => addDigit(digit)}
                  type="button"
                  variant="outline"
                >
                  {digit}
                </Button>
              ),
            )}
          </div>

          <div className="control-row grid grid-cols-2 items-end gap-2">
            <div className="grid grid-cols-2 gap-2">
              <label className="block space-y-1">
                <span className="text-muted-foreground text-xs">Count</span>
                <select
                  className="border-input bg-background focus:border-foreground h-10 w-full appearance-none rounded-md border bg-[url('data:image/svg+xml,%3Csvg_xmlns=%22http://www.w3.org/2000/svg%22_width=%2216%22_height=%2216%22_viewBox=%220_0_24_24%22_fill=%22none%22_stroke=%22black%22_stroke-width=%222%22_stroke-linecap=%22round%22_stroke-linejoin=%22round%22%3E%3Cpath_d=%22m6_9_6_6_6-6%22/%3E%3C/svg%3E')] bg-size-[14px_14px] bg-position-[right_0.5rem_center] bg-no-repeat px-2 pr-7 text-base outline-none"
                  onChange={(event) =>
                    setDigitCount(Number(event.target.value))
                  }
                  value={digitCount}
                >
                  {countOptions.map((count) => (
                    <option key={count} value={count}>
                      {count}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block space-y-1">
                <span className="text-muted-foreground text-xs">Speed</span>
                <select
                  className="border-input bg-background focus:border-foreground h-10 w-full appearance-none rounded-md border bg-[url('data:image/svg+xml,%3Csvg_xmlns=%22http://www.w3.org/2000/svg%22_width=%2216%22_height=%2216%22_viewBox=%220_0_24_24%22_fill=%22none%22_stroke=%22black%22_stroke-width=%222%22_stroke-linecap=%22round%22_stroke-linejoin=%22round%22%3E%3Cpath_d=%22m6_9_6_6_6-6%22/%3E%3C/svg%3E')] bg-size-[14px_14px] bg-position-[right_0.5rem_center] bg-no-repeat px-2 pr-7 text-base outline-none"
                  onChange={(event) => setSpeed(event.target.value as Speed)}
                  value={speed}
                >
                  <option value="slow">Slow</option>
                  <option value="fast">Fast</option>
                </select>
              </label>
            </div>

            <Button
              className="start-button h-10 text-base"
              disabled={hasStarted && !isRunning}
              onClick={toggleTest}
              type="button"
            >
              {isRunning ? "Stop" : hasStarted ? "..." : "Start"}
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}

export default App;
