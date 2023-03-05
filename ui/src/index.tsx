import React, { useState } from 'react';
import { ThemeProvider } from 'styled-components'
import ReactDOM from 'react-dom/client';
import {
  BrowserRouter as Router,
  Route,
  Routes
} from "react-router-dom";
import reportWebVitals from './reportWebVitals';

import PlaylistsPage from './pages/PlaylistsPage';
import StatusPage from './pages/StatusPage';
import SchedulerPage from './pages/SchedulerPage';

import theme from './theme';
import { PageWrapper } from './components/PageWrapper';
import UploadPage from './pages/UploadPage';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

const App = (): JSX.Element => {
  const [token, setToken] = useState(localStorage.getItem('nesorter-admin-token'));

  if (!token) {
    const newToken = prompt('Введи admin token, ибо его нет');
    localStorage.setItem('nesorter-admin-token', newToken as string);
    setToken(newToken);
    // eslint-disable-next-line no-restricted-globals
    location.reload();
  }

  if (!token) {
    return <></>;
  }

  return (
    <ThemeProvider theme={theme}>
      <Router>
        <PageWrapper>
          <Routes>
            <Route path="/" element={<StatusPage/>}/>
            <Route path="/playlists" element={<PlaylistsPage/>}/>
            <Route path="/classify" element={<span>not implemented</span>}/>
            <Route path="/scheduler" element={<SchedulerPage/>}/>
            <Route path="/upload" element={<UploadPage />}/>
          </Routes>
        </PageWrapper>
      </Router>
    </ThemeProvider>
  );
};

root.render(<App />);

// https://npm.io/package/icecast-metadata-player

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals(console.log);
