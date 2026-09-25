import type { ReactElement } from 'react';
import { categoryByRoute } from './content/categories';
import { ADLER_ROUTE } from './content/adler';

/** Every public URL keeps its original .html name; category pages (instruments-*.html,
 *  components-*.html) are new. Pages load on demand, so each route only downloads its own content. */
export async function loadPage(route: string): Promise<ReactElement> {
  switch (route) {
    case 'index': {
      const { default: Home } = await import('./pages/Home');
      return <Home />;
    }
    case 'instruments':
    case 'components': {
      const { default: Division } = await import('./pages/Division');
      return <Division id={route} />;
    }
    case 'applications': {
      const { default: Applications } = await import('./pages/Applications');
      return <Applications />;
    }
    case 'brands': {
      const { default: Brands } = await import('./pages/Brands');
      return <Brands />;
    }
    case 'about': {
      const { default: About } = await import('./pages/About');
      return <About />;
    }
    case 'contact': {
      const { default: Contact } = await import('./pages/Contact');
      return <Contact />;
    }
    case 'store': {
      const { default: Store } = await import('./pages/Store');
      return <Store />;
    }
  }
  if (route === ADLER_ROUTE || route === 'brand-adler') {
    const { default: Adler } = await import('./pages/Adler');
    return <Adler />;
  }
  if (categoryByRoute(route)) {
    const { default: Category } = await import('./pages/Category');
    return <Category route={route} />;
  }
  if (route.startsWith('brand-')) {
    const { default: Brand } = await import('./pages/Brand');
    return <Brand slug={route.slice('brand-'.length)} />;
  }
  throw new Error(`Unknown route: ${route}`);
}
