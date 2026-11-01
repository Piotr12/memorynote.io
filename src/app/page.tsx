// The site has one page. The root redirects to it with the static-export
// idiom: a meta refresh, hoisted into <head>.

export default function Home() {
  return (
    <>
      <meta httpEquiv="refresh" content="0; url=/design-preview/" />
    </>
  );
}
