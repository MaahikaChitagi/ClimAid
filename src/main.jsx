// import { createRoot } from 'react-dom/client';
// import { BrowserRouter, Routes, Route } from 'react-router-dom';
// import './index.css';
// import 'maplibre-gl/dist/maplibre-gl.css';
// import App from './App.jsx';
// import Dashboard from './Dashboard.jsx';
// import ReportIssue from './ReportIssue.jsx'; // create this file next
// import Explore from './Explore.jsx'
// import OfferHelp from './OfferHelp.jsx'
// import NotificationInbox from './NotificationInbox.jsx';
// import Settings from './Settings.jsx';
// import { UserProvider } from './UserContext.jsx';
// createRoot(document.getElementById('root')).render(
//   <BrowserRouter>
//     <Routes>
//       <Route path="/" element={<App />} />
//       <Route path="/dashboard" element={<Dashboard />} />
//       <Route path="/reportissues" element={<ReportIssue />} />
//       <Route path="/explore" element={<Explore />} />
//       <Route path="/dashboard/offer-help/:id" element={<OfferHelp />} />
//       <Route path="/notifications" element={<NotificationInbox />} />
//       <Route path="/settings" element={<Settings />} />


      
//     </Routes>
//   </BrowserRouter>
// );




import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';
import 'maplibre-gl/dist/maplibre-gl.css';
import './Connections.css';

import App from './App.jsx';
import Dashboard from './Dashboard.jsx';
import ReportIssue from './ReportIssue.jsx';
import Explore from './Explore.jsx';
import OfferHelp from './OfferHelp.jsx';
import NotificationInbox from './NotificationInbox.jsx';
import Settings from './Settings.jsx';
import Connections from './Connections.jsx'
import { UserProvider } from './UserContext.jsx'; // ✅ import the context
import Chat from './Chat.jsx'

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <UserProvider> {/* ✅ wrap the whole app with this */}
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/reportissues" element={<ReportIssue />} />
        <Route path="/explore" element={<Explore />} />
        <Route path="/dashboard/offer-help/:id" element={<OfferHelp />} />
        <Route path="/notifications" element={<NotificationInbox />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/connections" element={<Connections />} />
        <Route path="/chat/:chatId" element={<Chat />} />

      </Routes>
    </UserProvider>
  </BrowserRouter>
);
