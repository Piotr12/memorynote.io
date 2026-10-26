import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/button";
import { Card } from "@/components/card";
import { Field } from "@/components/field";
import { Text } from "@/components/text";
import { messages } from "@/i18n/messages";
import {
  breakpoints,
  colorTokens,
  displaySpecimen,
  radiusCards,
  radiusControls,
  spacingSteps,
  typeScale,
} from "@/lib/tokens";

const sectionIds = [
  "color",
  "type",
  "space",
  "breakpoints",
  "components",
] as const;

const sectionIndex = {
  color: "a",
  type: "b",
  space: "c",
  breakpoints: "d",
  components: "e",
} as const;

export default function DesignPreviewPage() {
  return (
    <>
      <header>
        <div className="wrap bar">
          <span className="word">
            <span className="mark" aria-hidden />
            {messages.siteName}
          </span>
          <span className="crumb">{messages.crumb}</span>
        </div>
      </header>

      <div className="wrap layout">
        <aside>
          <ThemeToggle />
          <nav className="nav" aria-label="Sections">
            {sectionIds.map((id) => (
              <a key={id} href={`#${id}`}>
                {messages.nav[id === "type" ? "type" : id]}
              </a>
            ))}
          </nav>
        </aside>

        <main>
          <section id="color">
            <h2>
              <span className="idx">{sectionIndex.color}</span>
              {messages.section.color}
            </h2>
            <p className="section-lede">{messages.lede.color}</p>
            <div className="chips">
              {colorTokens.map((token) => (
                <span className="chip" key={token.name}>
                  <span
                    className="sq"
                    style={{ backgroundColor: token.light }}
                  />
                  <span className="n">{token.name}</span>
                  <span className="h">{token.light}</span>
                </span>
              ))}
            </div>
            <table className="tokens">
              <thead>
                <tr>
                  <th>{messages.tokenTable.token}</th>
                  <th>{messages.tokenTable.light}</th>
                  <th>{messages.tokenTable.dark}</th>
                  <th>{messages.tokenTable.contrast}</th>
                </tr>
              </thead>
              <tbody>
                {colorTokens.map((token) => (
                  <tr key={token.name}>
                    <td>{token.name}</td>
                    <td className="cell">
                      <span
                        className="dot"
                        style={{ backgroundColor: token.light }}
                      />
                      {token.light}
                    </td>
                    <td className="cell">
                      <span
                        className="dot"
                        style={{ backgroundColor: token.dark }}
                      />
                      {token.dark}
                    </td>
                    <td className="aa">{token.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <section id="type">
            <h2>
              <span className="idx">{sectionIndex.type}</span>
              {messages.section.type}
            </h2>
            <p className="section-lede">{messages.lede.type}</p>
            <div className="spec-strip">
              <div className={displaySpecimen.className}>
                {displaySpecimen.sample}
              </div>
              <div className="cap">
                Inter {displaySpecimen.meta} — display, the boldest role on the
                page
              </div>
            </div>
            <table className="scale">
              <thead>
                <tr>
                  <th>{messages.scale.role}</th>
                  <th>{messages.scale.sample}</th>
                </tr>
              </thead>
              <tbody>
                {typeScale.map((role) => (
                  <tr key={role.role}>
                    <td className="m">{role.meta}</td>
                    <td className={role.className}>{role.sample}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <section id="space">
            <h2>
              <span className="idx">{sectionIndex.space}</span>
              {messages.section.space}
            </h2>
            <p className="section-lede">{messages.lede.space}</p>
            <div className="duo">
              <div>
                <div className="sub-h">{messages.spacing}</div>
                {spacingSteps.map((step) => (
                  <div className="space-row" key={step}>
                    <div className="meta">{step}</div>
                    <div className="space-bar" style={{ width: `${step}px` }} />
                  </div>
                ))}
              </div>
              <div>
                <div className="sub-h">{messages.cornerRadius}</div>
                <div className="radius-row">
                  <div className="radius-item">
                    <div
                      className="radius-box"
                      style={{ borderRadius: `${radiusControls}px` }}
                    />
                    <div className="meta">
                      {radiusControls} px
                      <br />
                      {messages.radiusControlsLabel}
                    </div>
                  </div>
                  <div className="radius-item">
                    <div
                      className="radius-box"
                      style={{ borderRadius: `${radiusCards}px` }}
                    />
                    <div className="meta">
                      {radiusCards} px
                      <br />
                      {messages.radiusCardsLabel}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section id="breakpoints">
            <h2>
              <span className="idx">{sectionIndex.breakpoints}</span>
              {messages.section.breakpoints}
            </h2>
            <p className="section-lede">{messages.lede.breakpoints}</p>
            <table className="bp">
              <thead>
                <tr>
                  <th>{messages.breakpointTable.px}</th>
                  <th className="use-col">{messages.breakpointTable.appliesTo}</th>
                </tr>
              </thead>
              <tbody>
                {breakpoints.map((bp) => (
                  <tr key={bp.px}>
                    <td className="px">{bp.px}</td>
                    <td className="use-col">{bp.use}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <section id="components">
            <h2>
              <span className="idx">{sectionIndex.components}</span>
              {messages.section.components}
            </h2>
            <p className="section-lede">{messages.lede.components}</p>
            <div className="stage">
              <div className="stage-grid">
                <div>
                  <h3>
                    {messages.components.button}{" "}
                    <span className="tag">{messages.components.buttonTag}</span>
                  </h3>
                  <div className="gap">
                    <Button variant="primary">
                      {messages.components.saveNote}
                    </Button>
                    <Button>{messages.components.preview}</Button>
                    <Button disabled>{messages.components.delete}</Button>
                  </div>
                </div>
                <div>
                  <h3>
                    {messages.components.input}{" "}
                    <span className="tag">{messages.components.inputTag}</span>
                  </h3>
                  <Field
                    id="note-title"
                    label={messages.components.noteTitle}
                    placeholder={messages.components.notePlaceholder}
                    hint={messages.components.noteHint}
                  />
                </div>
                <div>
                  <h3>
                    {messages.components.card}{" "}
                    <span className="tag">{messages.components.cardTag}</span>
                  </h3>
                  <Card
                    title={messages.components.cardTitle}
                    meta={messages.components.cardMeta}
                    body={messages.components.cardBody}
                    foot={
                      <>
                        <a className="link" href="#components">
                          {messages.components.cardLink}
                        </a>
                        <span className="date">
                          {messages.components.cardDate}
                        </span>
                      </>
                    }
                  />
                </div>
                <div>
                  <h3>
                    {messages.components.text}{" "}
                    <span className="tag">{messages.components.textTag}</span>
                  </h3>
                  <Text role="body">
                    {messages.components.textBody}{" "}
                    <a className="link" href="#components">
                      {messages.components.textLink}
                    </a>{" "}
                    {messages.components.textBodyTail}
                  </Text>
                  <Text role="caption" style={{ marginTop: 8 }}>
                    {messages.components.textCaption}
                  </Text>
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
    </>
  );
}
