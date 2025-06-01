import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css'; // Nous créerons ce fichier CSS ensuite

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError(null);

        try {
            const response = await fetch('http://localhost:5009/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (response.ok) {
                // Stocker le token JWT (par exemple dans localStorage)
                localStorage.setItem('token', data.access_token);
                // Rediriger l'utilisateur (par exemple vers la page d'accueil ou un dashboard)
                navigate('/');
                // Optionnel: Stocker les infos utilisateur aussi si nécessaire
                 localStorage.setItem('user', JSON.stringify(data.user));
                 window.location.reload(); // Recharger pour mettre à jour l'état de l'utilisateur dans le header/Home

            } else {
                setError(data.msg || 'Erreur de connexion');
            }
        } catch (err) {
            setError('Erreur de connexion au serveur.');
        }
    };

    return (
        <div className="login-container">
            <h2>Se connecter</h2>
            {error && <div className="error-message">{error}</div>}
            <form onSubmit={handleLogin}>
                <div className="form-group">
                    <label htmlFor="email">Email :</label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="password">Mot de passe :</label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <button type="submit">Connexion</button>
            </form>
        </div>
    );
}

export default Login; 