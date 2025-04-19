import { getCalApi } from "@calcom/embed-react";
import { useEffect } from "react";
import { FaCalendarAlt } from "react-icons/fa";

export default function CalendarPopup() {
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
      className="text-muted-text hover:text-accent transition-transform duration-200 hover:scale-110 inline-block text-2xl"
    >
      <FaCalendarAlt style={{ pointerEvents: "none" }} />
    </button>
  );
}
