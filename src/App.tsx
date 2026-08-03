import { useEffect, useState } from 'react';
import { Shell, type NavItem } from './components/Shell';
import { AppStoreProvider, useAppStore } from './store/AppStore';
import { RequesterDashboard } from './modules/requester/Dashboard';
import { RequestDetail } from './modules/requester/RequestDetail';
import { SubmitFlow } from './modules/requester/SubmitFlow';
import { PractitionerQueue } from './modules/practitioner/Queue';
import { LeadershipView } from './modules/leadership/Metrics';
import { HowItWorks } from './modules/about/HowItWorks';

type Route =
  | { view: 'dashboard' }
  | { view: 'detail'; requestId: string }
  | { view: 'submit' }
  | { view: 'queue' }
  | { view: 'leadership' }
  | { view: 'about' };

const NAV_BY_ROLE: Record<string, NavItem[]> = {
  requester: [
    { id: 'dashboard', label: 'My requests' },
    { id: 'about', label: 'How it works' },
  ],
  practitioner: [
    { id: 'queue', label: 'My queue' },
    { id: 'about', label: 'How it works' },
  ],
  leadership: [
    { id: 'leadership', label: 'Metrics' },
    { id: 'about', label: 'How it works' },
  ],
};

const HOME_BY_ROLE: Record<string, Route> = {
  requester: { view: 'dashboard' },
  practitioner: { view: 'queue' },
  leadership: { view: 'leadership' },
};

function Router() {
  const { currentUser } = useAppStore();
  const [route, setRoute] = useState<Route>({ view: 'dashboard' });

  // Land on the role's home view when the dev user switches.
  useEffect(() => {
    setRoute(HOME_BY_ROLE[currentUser.role] ?? { view: 'about' });
  }, [currentUser.id, currentUser.role]);

  const navItems = NAV_BY_ROLE[currentUser.role] ?? [];
  const activeNav = route.view === 'detail' || route.view === 'submit' ? 'dashboard' : route.view;

  return (
    <Shell navItems={navItems} activeNav={activeNav} onNavigate={(id) => setRoute({ view: id } as Route)}>
      {route.view === 'dashboard' && (
        <RequesterDashboard
          onOpen={(requestId) => setRoute({ view: 'detail', requestId })}
          onNewRequest={() => setRoute({ view: 'submit' })}
        />
      )}
      {route.view === 'detail' && (
        <RequestDetail requestId={route.requestId} onBack={() => setRoute({ view: 'dashboard' })} />
      )}
      {route.view === 'submit' && (
        <SubmitFlow
          onDone={(id) => setRoute(id ? { view: 'detail', requestId: id } : { view: 'dashboard' })}
          onCancel={() => setRoute({ view: 'dashboard' })}
        />
      )}
      {route.view === 'queue' && <PractitionerQueue />}
      {route.view === 'leadership' && <LeadershipView />}
      {route.view === 'about' && <HowItWorks onCreate={() => setRoute({ view: 'submit' })} />}
    </Shell>
  );
}

export default function App() {
  return (
    <AppStoreProvider>
      <Router />
    </AppStoreProvider>
  );
}
