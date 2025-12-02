import {
  forwardRef,
  useMemo,
  useRef,
  useEffect,
  RefObject,
  CSSProperties,
} from "react";

const hasWindow = typeof window !== "undefined";

const prefersReducedMotion = () =>
  hasWindow
    ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
    : false;

const hasFinePointer = () =>
  hasWindow ? window.matchMedia("(pointer: fine)").matches : false;

interface VariableProximityProps {
  label: string;
  fromFontVariationSettings: string;
  toFontVariationSettings: string;
  containerRef: RefObject<HTMLElement | null>;
  radius?: number;
  falloff?: "linear" | "exponential" | "gaussian";
  className?: string;
  onClick?: () => void;
  style?: CSSProperties;
}

const VariableProximity = forwardRef<HTMLSpanElement, VariableProximityProps>(
  (props, ref) => {
    const {
      label,
      fromFontVariationSettings = "'wght' 400",
      toFontVariationSettings = "'wght' 700",
      containerRef,
      radius = 50,
      falloff = "linear",
      className = "",
      onClick,
      style,
    } = props;

    const letterRefs = useRef<(HTMLSpanElement | null)[]>([]);
    const interpolatedSettingsRef = useRef<string[]>([]);
    const frameRef = useRef<number | null>(null);
    const latestPointer = useRef<{ x: number; y: number } | null>(null);
    const prefersReduced = prefersReducedMotion();
    const pointerIsFine = hasFinePointer();

    const parsedSettings = useMemo(() => {
      const parseSettings = (settingsStr: string) =>
        new Map(
          settingsStr
            .split(",")
            .map((s) => s.trim())
            .map((s) => {
              const [name, value] = s.split(" ");
              return [name.replace(/['"]/g, ""), parseFloat(value)];
            })
        );

      const fromSettings = parseSettings(fromFontVariationSettings);
      const toSettings = parseSettings(toFontVariationSettings);

      return Array.from(fromSettings.entries()).map(([axis, fromValue]) => ({
        axis,
        fromValue,
        toValue: toSettings.get(axis) ?? fromValue,
      }));
    }, [fromFontVariationSettings, toFontVariationSettings]);

    const updateLetters = (clientX: number, clientY: number) => {
      if (!containerRef?.current) return;
      const containerRect = containerRef.current.getBoundingClientRect();
      const localX = clientX - containerRect.left;
      const localY = clientY - containerRect.top;

      const calculateFalloff = (distance: number) => {
        const norm = Math.min(Math.max(1 - distance / radius, 0), 1);
        switch (falloff) {
          case "exponential":
            return norm ** 2;
          case "gaussian":
            return Math.exp(-((distance / (radius / 2)) ** 2) / 2);
          case "linear":
        }
        return norm;
      };

      letterRefs.current.forEach((letterRef, index) => {
        if (!letterRef) return;

        const rect = letterRef.getBoundingClientRect();
        const letterCenterX = rect.left + rect.width / 2 - containerRect.left;
        const letterCenterY = rect.top + rect.height / 2 - containerRect.top;

        const distance = Math.sqrt(
          (localX - letterCenterX) ** 2 + (localY - letterCenterY) ** 2
        );

        if (distance >= radius) {
          letterRef.style.fontVariationSettings = fromFontVariationSettings;
          return;
        }

        const falloffValue = calculateFalloff(distance);
        const newSettings = parsedSettings
          .map(({ axis, fromValue, toValue }) => {
            const interpolatedValue =
              fromValue + (toValue - fromValue) * falloffValue;
            return `'${axis}' ${interpolatedValue}`;
          })
          .join(", ");

        interpolatedSettingsRef.current[index] = newSettings;
        letterRef.style.fontVariationSettings = newSettings;
      });
    };

    const resetLetters = () => {
      letterRefs.current.forEach((letterRef) => {
        if (!letterRef) return;
        letterRef.style.fontVariationSettings = fromFontVariationSettings;
      });
    };

    useEffect(() => {
      if (!containerRef?.current) return;
      if (prefersReduced || !pointerIsFine) return;

      const container = containerRef.current;

      const scheduleUpdate = (event: PointerEvent | MouseEvent) => {
        latestPointer.current = { x: event.clientX, y: event.clientY };

        if (frameRef.current) cancelAnimationFrame(frameRef.current);
        frameRef.current = requestAnimationFrame(() => {
          if (!latestPointer.current) return;
          updateLetters(latestPointer.current.x, latestPointer.current.y);
        });
      };

      const handlePointerMove = (event: PointerEvent) => {
        scheduleUpdate(event);
      };

      const handlePointerLeave = () => {
        latestPointer.current = null;
        resetLetters();
      };

      container.addEventListener("pointermove", handlePointerMove);
      container.addEventListener("pointerleave", handlePointerLeave);

      return () => {
        container.removeEventListener("pointermove", handlePointerMove);
        container.removeEventListener("pointerleave", handlePointerLeave);
        if (frameRef.current) cancelAnimationFrame(frameRef.current);
      };
    }, [containerRef, prefersReduced, pointerIsFine, updateLetters]);

    useEffect(() => () => resetLetters(), [fromFontVariationSettings]);

    const words = label.split(" ");
    let letterIndex = 0;

    return (
      <span
        ref={ref}
        onClick={onClick}
        style={{
          display: "inline",
          fontFamily: "var(--font-roboto-flex), Roboto Flex, sans-serif",
          fontVariationSettings: fromFontVariationSettings,
          ...style,
        }}
        className={className}
      >
        {words.map((word: string, wordIndex: number) => (
          <span key={wordIndex} className="inline-block whitespace-nowrap">
            {word.split("").map((letter: string) => {
              const currentLetterIndex = letterIndex++;
              return (
                <span
                  key={currentLetterIndex}
                  ref={(el: HTMLSpanElement | null) => {
                    letterRefs.current[currentLetterIndex] = el;
                  }}
                  style={{
                    display: "inline-block",
                    fontVariationSettings:
                      interpolatedSettingsRef.current[currentLetterIndex],
                  }}
                  aria-hidden="true"
                >
                  {letter}
                </span>
              );
            })}
            {wordIndex < words.length - 1 && (
              <span className="inline-block">&nbsp;</span>
            )}
          </span>
        ))}
        <span className="sr-only">{label}</span>
      </span>
    );
  }
);

VariableProximity.displayName = "VariableProximity";
export default VariableProximity;
