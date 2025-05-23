import * as React from 'react';
import { Route, RouteComponentProps, Switch, useLocation } from 'react-router-dom';
//import { Dashboard1 } from '@app/Dashboard/Dashboard1';
//import { Dashboard2 } from '@app/Dashboard/Dashboard2';
import { Home } from '@app/Home/Home';
import { HowItWorks } from '@app/HowItWorks/HowItWorks';
import { Marbles } from '@app/Marbles/Marbles';
import { Documentation } from '@app/Documentation/Documentation';
import { Support } from '@app/Support/Support';
import { GeneralSettings } from '@app/Settings/General/GeneralSettings';
import { ProfileSettings } from '@app/Settings/Profile/ProfileSettings';
import { NotFound } from '@app/NotFound/NotFound';
import { useDocumentTitle } from '@app/utils/useDocumentTitle';

let routeFocusTimer: number;
export interface IAppRoute {
  label?: string; // Excluding the label will exclude the route from the nav sidebar in AppLayout
  /* eslint-disable @typescript-eslint/no-explicit-any */
  component: React.ComponentType<RouteComponentProps<any>> | React.ComponentType<any>;
  /* eslint-enable @typescript-eslint/no-explicit-any */
  exact?: boolean;
  path: string;
  title: string;
  routes?: undefined;
}

export interface IAppRouteGroup {
  label: string;
  routes: IAppRoute[];
}

export type AppRouteConfig = IAppRoute | IAppRouteGroup;

const routes: AppRouteConfig[] = [

  {
    component: Home,
    exact: true,
    label: 'Home',
    path: '/',
    title: 'RCIoTs Marble Maze | Main Dashboard',
  },
  {
    component: Marbles,
    exact: true,
    label: 'Play Now!',
    path: '/play',
    title: 'RCIoTs Marble Maze | Marbles Maze',
  },
//  {
//    label: 'Dashboards',
//    routes: [
//  {
//    component: Dashboard1,
//    exact: true,
//    label: 'Marbles Maze Dashboard',
//    path: '/dashboard1',
//    title: 'RCIoTs Marble Maze | Main Dashboard',
//  },
//  {
//    component: Dashboard2,
//    exact: true,
//    label: 'Mock Data Dashboard',
//    path: '/dashboard2',
//    title: 'RCIoTs Marble Maze | Main Dashboard',
//  },
//],
//  },
  {
    component: HowItWorks,
    exact: true,
    label: 'How It Works',
    path: '/howitworks',
    title: 'RCIoTs Marble Maze | How It Works',
  },
  {
    component: Documentation,
    exact: true,
    label: 'Documentation',
    path: '/doc',
    title: 'RCIoTs Marble Maze | Documentation Page',
  }
];

// a custom hook for sending focus to the primary content container
// after a view has loaded so that subsequent press of tab key
// sends focus directly to relevant content
// may not be necessary if https://github.com/ReactTraining/react-router/issues/5210 is resolved
const useA11yRouteChange = () => {
  const { pathname } = useLocation();
  React.useEffect(() => {
    routeFocusTimer = window.setTimeout(() => {
      const mainContainer = document.getElementById('primary-app-container');
      if (mainContainer) {
        mainContainer.focus();
      }
    }, 50);
    return () => {
      window.clearTimeout(routeFocusTimer);
    };
  }, [pathname]);
};

const RouteWithTitleUpdates = ({ component: Component, title, ...rest }: IAppRoute) => {
  useA11yRouteChange();
  useDocumentTitle(title);

  function routeWithTitle(routeProps: RouteComponentProps) {
    return <Component {...rest} {...routeProps} />;
  }

  return <Route render={routeWithTitle} {...rest} />;
};

const PageNotFound = ({ title }: { title: string }) => {
  useDocumentTitle(title);
  return <Route component={NotFound} />;
};

const flattenedRoutes: IAppRoute[] = routes.reduce(
  (flattened, route) => [...flattened, ...(route.routes ? route.routes : [route])],
  [] as IAppRoute[],
);

const AppRoutes = (): React.ReactElement => (
  <Switch>
    {flattenedRoutes.map(({ path, exact, component, title }, idx) => (
      <RouteWithTitleUpdates path={path} exact={exact} component={component} key={idx} title={title} />
    ))}
    <PageNotFound title="404 Page Not Found" />
  </Switch>
);

export { AppRoutes, routes };
