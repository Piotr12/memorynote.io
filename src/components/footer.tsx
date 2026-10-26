import { footerLine } from "@/lib/build-info";
import { messages } from "@/i18n/messages";

// The footer of every page. The second line comes from build-time
// environment variables; without values it is omitted entirely, never an
// empty placeholder.
export function Footer() {
  const secondLine = footerLine(
    process.env.NEXT_PUBLIC_BUILD_BRANCH,
    process.env.NEXT_PUBLIC_BUILD_COMMIT,
  );
  return (
    <footer>
      <div className="line1">{messages.footer.built}</div>
      {secondLine !== null ? <div className="line2">{secondLine}</div> : null}
    </footer>
  );
}
