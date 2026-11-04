import { basePath } from '~/config/env';

const target = `${basePath}/get-started`;

// A static export can't send an HTTP redirect. The script runs before first paint, and
// `replace` keeps `/` out of the history so Back doesn't land here again.
export default function HomePage() {
  return (
    <>
      {/* eslint-disable-next-line @eslint-react/dom-no-dangerously-set-innerhtml -- build-time constant */}
      <script dangerouslySetInnerHTML={{ __html: `location.replace(${JSON.stringify(target)})` }} />
      <noscript>
        <meta content={`0;url=${target}`} httpEquiv="refresh" />
      </noscript>
    </>
  );
}
