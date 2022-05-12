import React from 'react';
import ReactDOM from 'react-dom/client';
import {
  BrowserRouter as Router,
  Route,
  Routes
} from "react-router-dom";
import reportWebVitals from './reportWebVitals';
import ClassifyPage from './pages/ClassifyPage';
import { PageWrapper } from './components/PageWrapper';
import SchedulerPage from './pages/SchedulerPage';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

const App = (): JSX.Element => (
  <Router>
    <PageWrapper>
      <Routes>
        <Route path="/" element={<ClassifyPage />} />
        <Route path="/scheduler" element={<SchedulerPage />} />
      </Routes>
    </PageWrapper>
  </Router>
);

root.render(<App />);

// https://npm.io/package/icecast-metadata-player

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals(console.log);
