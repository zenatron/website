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
        const cal = await getCalApi({
          namespace: "call",
          embedJsUrl: "https://z3n.me/embed/embed.js",
        });
        cal("ui", {
          theme: "dark",
          styles: { branding: { brandColor: "#7c8aff" } },
          hideEventTypeDetails: false,
          layout: "month_view",
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
      data-cal-config='{"layout":"month_view","theme":"dark"}'
      className={`text-muted-text transition-colors duration-200 hover:text-accent ${className}`}
      title="Book a Meeting"
    >
      <FaCalendarAlt className="h-4 w-4" aria-hidden />
    </button>
  );
}
