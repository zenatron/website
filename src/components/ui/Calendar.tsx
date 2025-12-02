import { getCalApi } from "@calcom/embed-react";
import { useEffect } from "react";
import { FaCalendarAlt } from "react-icons/fa";

interface CalendarPopupProps {
  className?: string;
}

export default function CalendarPopup({ className = "" }: CalendarPopupProps) {
  useEffect(() => {
    (async function () {
      try {
        await getCalApi({
          namespace: "call",
          embedJsUrl: "https://z3n.me/embed/embed.js",
        });
      } catch (error) {
        console.error("Failed to initialize Cal.com API:", error);
      }
    })();
  }, []);

  return (
    <button
      data-cal-namespace="call"
      data-cal-link="phil/call"
      data-cal-origin="https://z3n.me"
      data-cal-config='{"layout":"month_view"}'
      className={`flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-secondary-text transition-colors duration-200 hover:border-white/20 hover:bg-white/10 hover:text-accent ${className}`}
      title="Book a Meeting"
    >
      <FaCalendarAlt className="h-4 w-4" aria-hidden />
    </button>
  );
}
