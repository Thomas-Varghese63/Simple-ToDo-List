import { useState, useEffect } from "react" // Import useEffect
import TodoApp from "./to-do.jsx"
import AuthForm from "./auth-form.jsx"

export default function App() {
  const [user, setUser] = useState(null)
  const [isLogin, setIsLogin] = useState(true)
  const [loadingAuth, setLoadingAuth] = useState(true); // New loading state

  useEffect(() => {
    const checkAuthStatus = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/auth/me', {
                credentials: 'include',
            });

            if (response.ok) {
                const userData = await response.json();
                setUser(userData);
            } else {
                setUser(null);
            }
        } catch (error) {
            console.error("Failed to check auth status:", error);
            setUser(null);
        } finally {
            setLoadingAuth(false);
        }
    };

    checkAuthStatus();
}, []);

  const handleAuth = (userData) => {
    setUser(userData)
  }

  const handleLogout = async () => {
    try {
        const response = await fetch('http://localhost:5000/api/auth/logout', {
            method: 'POST',
            credentials: 'include',
        });

        if (response.ok) {
            setUser(null);
            // Force reload the page to clear any cached state
            window.location.reload();
        } else {
            console.error('Logout failed');
        }
    } catch (error) {
        console.error('Logout error:', error);
    }
};

  if (loadingAuth) {
    return <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', fontSize: '24px'}}>Loading...</div>;
  }

  if (!user) {
    return (
      <AuthForm
        isLogin={isLogin}
        onToggle={() => setIsLogin(!isLogin)}
        onSubmit={handleAuth}
      />
    )
  }

  return <TodoApp user={user} onLogout={handleLogout} />;
}
