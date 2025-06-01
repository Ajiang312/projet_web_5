import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom'; // Uncomment if you need redirection after registration
import './Register.css'; // Nous créerons ce fichier CSS ensuite

function Register() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    // const navigate = useNavigate(); // Uncomment if you need redirection after registration

    const handleRegister = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        try {
            const response = await fetch('http://localhost:5009/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password, first_name: firstName, last_name: lastName }),
            });

            const data = await response.json();

            if (response.ok) {
                setSuccess('Inscription réussie ! Vous pouvez maintenant vous connecter.');
                // navigate('/login'); // Uncomment if you want to redirect to login after success
            } else {
                setError(data.msg || 'Erreur d\'inscription');
            }
        } catch (err) {
            setError('Erreur de connexion au serveur.');
        }
    };

    return (
        <div className="register-container">
            <h2>S'inscrire</h2>
            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}
            <form onSubmit={handleRegister}>
                 <div className="form-group">
                    <label htmlFor="firstName">Prénom :</label>
                    <input
                        type="text"
                        id="firstName"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        required
                    />
                </div>
                 <div className="form-group">
                    <label htmlFor="lastName">Nom :</label>
                    <input
                        type="text"
                        id="lastName"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        required
                    />
                </div>
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
                <button type="submit">Inscription</button>
            </form>
        </div>
    );
}

export default Register; 