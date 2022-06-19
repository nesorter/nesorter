import React from 'react';
import { ThemeProvider } from 'styled-components'
import ReactDOM from 'react-dom/client';
import {
  BrowserRouter as Router,
  Route,
  Routes
} from "react-router-dom";
import reportWebVitals from './reportWebVitals';

import ClassifyPage from './pages/ClassifyPage';
import PlaylistsPage from './pages/PlaylistsPage';
import StatusPage from './pages/StatusPage';

import theme from './theme';
import { PageWrapper } from './components/PageWrapper';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

const App = (): JSX.Element => (
  <ThemeProvider theme={theme}>
    <Router>
      <PageWrapper>
        <Routes>
          <Route path="/" element={<StatusPage />} />
          <Route path="/playlists" element={<PlaylistsPage />} />
          <Route path="/classify" element={<ClassifyPage />} />
        </Routes>
      </PageWrapper>
    </Router>
  </ThemeProvider>
);

root.render(<App />);

// https://npm.io/package/icecast-metadata-player

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals(console.log);
