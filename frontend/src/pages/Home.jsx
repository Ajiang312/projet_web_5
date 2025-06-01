import { useState, useEffect } from 'react'
import reactLogo from '../assets/react.svg'
import viteLogo from '/vite.svg'
import '../App.css'
import { Link } from 'react-router-dom'
import './Home.css'

function Home() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setLoading(false);
          return;
        }

        const response = await fetch('http://localhost:5009/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        }
      } catch (err) {
        console.error('Erreur lors de la récupération des données utilisateur:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  if (loading) return <div>Chargement...</div>;

  return (
    <div className="home-container">
      <h1>Bibliothèque ESME</h1>
      
      <nav className="main-nav">
        <ul>
          <li><Link to="/books">Catalogue</Link></li>
          {user && (
            <>
              <li><Link to="/history">Mes emprunts et réservations</Link></li>
              {user.is_admin && (
                <>
                  <li><Link to="/delays">Gestion des retards</Link></li>
                  <li><Link to="/admin">Gestion du stock</Link></li>
                </>
              )}
            </>
          )}
        </ul>
      </nav>

      {!user ? (
        <div className="welcome-message">
          <p>Bienvenue sur le portail de la bibliothèque ESME.</p>
          <p>Veuillez vous connecter pour accéder à toutes les fonctionnalités.</p>
          <nav className="auth-nav">
            <ul>
              <li><Link to="/login">Se connecter</Link></li>
              <li><Link to="/register">S'inscrire</Link></li>
            </ul>
          </nav>
        </div>
      ) : (
        <div className="welcome-message">
          <p>Bienvenue, {user.first_name} {user.last_name} !</p>
          <p>Que souhaitez-vous faire aujourd'hui ?</p>
        </div>
      )}
    </div>
  )
}

export default Home
