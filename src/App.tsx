import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import NewsHome from './pages/NewsHome';
import ArticlePage from './pages/ArticlePage';

/** Scroll to top on every route change */
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

const IBM_PLEX_SANS_CSS = `
@font-face {
  font-family: 'IBM Plex Sans';
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src: url(https://fonts.gstatic.com/s/ibmplexsans/v23/zYXGKVElMYYaJe8bpLHnCwDKr932-G7dytD-Dmu1swZSAXcomDVmadSD6llzAA.ttf) format('truetype');
}
@font-face {
  font-family: 'IBM Plex Sans';
  font-style: normal;
  font-weight: 500;
  font-display: swap;
  src: url(https://fonts.gstatic.com/s/ibmplexsans/v23/zYXGKVElMYYaJe8bpLHnCwDKr932-G7dytD-Dmu1swZSAXcomDVmadSD2FlzAA.ttf) format('truetype');
}
@font-face {
  font-family: 'IBM Plex Sans';
  font-style: normal;
  font-weight: 600;
  font-display: swap;
  src: url(https://fonts.gstatic.com/s/ibmplexsans/v23/zYXGKVElMYYaJe8bpLHnCwDKr932-G7dytD-Dmu1swZSAXcomDVmadSDNF5zAA.ttf) format('truetype');
}
@font-face {
  font-family: 'IBM Plex Sans';
  font-style: normal;
  font-weight: 700;
  font-display: swap;
  src: url(https://fonts.gstatic.com/s/ibmplexsans/v23/zYXGKVElMYYaJe8bpLHnCwDKr932-G7dytD-Dmu1swZSAXcomDVmadSDDV5zAA.ttf) format('truetype');
}
* { font-family: 'IBM Plex Sans', -apple-system, BlinkMacSystemFont, sans-serif !important; }
`;

function FontLoader() {
  return <style>{IBM_PLEX_SANS_CSS}</style>;
}

export default function App() {
  return (
    <div style={{ fontFamily: "'IBM Plex Sans', sans-serif" }} className="font-sans min-h-screen flex flex-col bg-white">
      <FontLoader />
      <BrowserRouter>
        <ScrollToTop />
        <main className="flex-1">
          <Routes>
            <Route path="/news" element={<NewsHome />} />
            <Route path="/news/:slug" element={<ArticlePage />} />
            <Route path="*" element={<Navigate to="/news" replace />} />
          </Routes>
        </main>
      </BrowserRouter>
    </div>
  );
}
