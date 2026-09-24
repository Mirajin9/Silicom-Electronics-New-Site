import { createRoot, hydrateRoot } from 'react-dom/client';
import { loadPage } from './routes';
import './fonts.css';
import './styles.css';
import './pages.css';
import './inline-model.css';
import './brand/brand.css';
import './legacy/store.css';
import { url } from './base';

const root = document.getElementById('root')!;
const route = root.dataset.route || 'index';

// Older links pointed at application anchors (#app-…) on other pages; send them home.
if (location.hash.startsWith('#app-') && route !== 'applications') {
  location.replace(url(`/applications.html${location.hash}`));
}

loadPage(route).then((page) => {
  // Built pages arrive pre-rendered and are hydrated; the dev server renders on the client.
  if (root.firstElementChild) hydrateRoot(root, page);
  else createRoot(root).render(page);
});
