import { getCalApi } from "@calcom/embed-react";
import { useEffect } from "react";
import { FaCalendarAlt } from "react-icons/fa";
import { T } from "@/components/ui/TerminalWindow";

interface CalendarPopupProps {
  className?: string;
}

export default function CalendarPopup({ className = "" }: CalendarPopupProps) {
  useEffect(() => {
    (async function () {
      try {
        const cal = await getCalApi({
          namespace: "call",
          embedJsUrl: "https://z3n.me/embed/embed.js",
        });
        cal("ui", { hideEventTypeDetails: false, layout: "month_view" });
      } catch (error) {
        console.error("Cal.com embed failed to load:", error);
      }
    })();
  }, []);

  return (
    <button
      type="button"
      data-cal-namespace="call"
      data-cal-link="phil/call"
      data-cal-origin="https://z3n.me"
      data-cal-config='{"layout":"month_view"}'
      className={`transition-colors duration-150 ${className}`}
      style={{ color: T.comment }}
      onMouseEnter={(e) => {
        e.currentTarget.style.color = T.purple;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.color = T.comment;
      }}
      title="Book a Meeting"
    >
      <FaCalendarAlt
        className="h-3.5 w-3.5"
        style={{ pointerEvents: "none" }}
        aria-hidden
      />
    </button>
  );
}
