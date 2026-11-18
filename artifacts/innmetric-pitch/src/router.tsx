import { Route, Router, Switch } from 'wouter';

import App from './ProgrammeApp';
import { IreckonuPitch } from './partners/Ireckonu';
import { TorusLegacyPitch } from './partners/TorusLegacy';
import { APP_BASE, PARTNER_ROUTES } from './partners/routes';

/**
 * Canonical URLs end in a slash (/collab/, /collab/partners/ireckonu/). The host redirects where it can;
 * this keeps the address bar canonical when it cannot (local dev, a host without the redirect).
 */
function canonicalizePath() {
  const { pathname, search, hash } = window.location;
  const known = [APP_BASE, ...PARTNER_ROUTES.map((route) => `${APP_BASE}${route.path.replace(/\/$/, '')}`)];
  if (known.includes(pathname)) {
    window.history.replaceState(window.history.state, '', `${pathname}/${search}${hash}`);
  }
}

canonicalizePath();

export function DemoRouter() {
  return (
    <Router base={APP_BASE}>
      <Switch>
        <Route path="/partners/ireckonu" component={IreckonuPitch} />
        <Route path="/partners/torus-legacy" component={TorusLegacyPitch} />
        <Route component={App} />
      </Switch>
    </Router>
  );
}
