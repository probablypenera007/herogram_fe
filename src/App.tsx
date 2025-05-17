// import React, { useState, useEffect } from 'react';
// import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
// import Poll from './components/Poll';
// import PollList from './components/PollList';
// import CreatePoll from './components/CreatePoll';
// import AuthModal from './components/AuthModal';
// import { pollApi } from './utils/pollApi';
// import './App.css';

// interface User {
//   id: number;
//   name: string;
//   email: string;
//   role: 'user' | 'admin';
// }

// const App: React.FC = () => {
//   const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
//   const [user, setUser] = useState<User | null>(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const token = localStorage.getItem('token');
//     if (token) {
//       pollApi.getCurrentUser()
//         .then(user => {
//           setUser(user);
//         })
//         .catch(() => {
//           localStorage.removeItem('token');
//         })
//         .finally(() => {
//           setLoading(false);
//         });
//     } else {
//       setLoading(false);
//     }
//   }, []);

//   const handleAuthSuccess = (token: string, user: User) => {
//     localStorage.setItem('token', token);
//     setUser(user);
//   };

//   const handleLogout = () => {
//     localStorage.removeItem('token');
//     setUser(null);
//   };

//   if (loading) {
//     return <div>Loading...</div>;
//   }

//   return (
//     <Router>
//       <div className="app">
//         <header>
//           <h1>Team Polls</h1>
//           <div className="auth-buttons">
//             {user ? (
//               <>
//                 <span>Welcome, {user.name}</span>
//                 <button onClick={handleLogout}>Logout</button>
//                 {user.role === 'admin' && (
//                   <button onClick={() => window.location.href = '/create'}>Create Poll</button>
//                 )}
//               </>
//             ) : (
//               <button onClick={() => setIsAuthModalOpen(true)}>Login/Register</button>
//             )}
//           </div>
//         </header>

//         <Routes>
//           <Route path="/" element={<PollList />} />
//           <Route path="/poll/:id" element={<Poll />} />
//           <Route
//             path="/create"
//             element={
//               user?.role === 'admin' ? (
//                 <CreatePoll />
//               ) : (
//                 <Navigate to="/" replace />
//               )
//             }
//           />
//         </Routes>

//         <AuthModal
//           isOpen={isAuthModalOpen}
//           onClose={() => setIsAuthModalOpen(false)}
//           onAuthSuccess={handleAuthSuccess}
//         />
//       </div>
//     </Router>
//   );
// };

// export default App;





import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Poll from './components/Poll';
import PollList from './components/PollList';
import CreatePoll from './components/CreatePoll';
import AuthModal from './components/AuthModal';
import { pollApi } from './utils/pollApi';
import './App.css';

interface User {
  id: number;
  name: string;
  email: string;
  role: 'user' | 'admin';
}

const App: React.FC = () => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      pollApi.getCurrentUser()
        .then(user => setUser(user))
        .catch(() => localStorage.removeItem('token'))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const handleAuthSuccess = (token: string, user: User) => {
    localStorage.setItem('token', token);
    setUser(user);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Router>
      <div className="app">
        <header>
          <h1>Team Polls</h1>
          <div className="auth-buttons">
            {user ? (
              <>
                <span>Welcome, {user.name}</span>
                <button onClick={handleLogout}>Logout</button>
                {user.role === 'admin' && (
                  <button onClick={() => window.location.href = '/create'}>Create Poll</button>
                )}
              </>
            ) : (
              <button onClick={() => setIsAuthModalOpen(true)}>Login/Register</button>
            )}
          </div>
        </header>

        {/* 👇 Conditional Routes */}
        {user ? (
          <Routes>
            <Route path="/" element={<PollList />} />
            <Route path="/poll/:id" element={<Poll />} />
            <Route
              path="/create"
              element={
                user.role === 'admin' ? (
                  <CreatePoll />
                ) : (
                  <Navigate to="/" replace />
                )
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        ) : (
          <Routes>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        )}

        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          onAuthSuccess={handleAuthSuccess}
        />
      </div>
    </Router>
  );
};

export default App;