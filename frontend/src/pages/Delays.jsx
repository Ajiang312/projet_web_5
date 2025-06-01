import React, { useState, useEffect } from 'react';
import './Delays.css';

function Delays() {
    const [overdueBorrowings, setOverdueBorrowings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchOverdueBorrowings = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    setError('Veuillez vous connecter');
                    setLoading(false);
                    return;
                }

                const response = await fetch('http://localhost:5009/api/borrowings/overdue', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!response.ok) {
                    throw new Error('Erreur lors de la récupération des retards');
                }

                const data = await response.json();
                setOverdueBorrowings(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchOverdueBorrowings();
    }, []);

    const handleReturn = async (borrowingId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5009/api/borrowings/${borrowingId}/return`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                // Mettre à jour la liste des retards
                setOverdueBorrowings(prevBorrowings => 
                    prevBorrowings.filter(b => b.id !== borrowingId)
                );
            } else {
                setError('Erreur lors du retour du livre');
            }
        } catch (err) {
            setError('Erreur de connexion');
        }
    };

    if (loading) return <div>Chargement...</div>;
    if (error) return <div className="error-message">{error}</div>;

    return (
        <div className="delays-container">
            <h2>Livres en retard</h2>
            {overdueBorrowings.length === 0 ? (
                <p className="no-delays">Aucun livre en retard</p>
            ) : (
                <table className="delays-table">
                    <thead>
                        <tr>
                            <th>Livre</th>
                            <th>Emprunteur</th>
                            <th>Date d'emprunt</th>
                            <th>Date de retour prévue</th>
                            <th>Jours de retard</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {overdueBorrowings.map(borrowing => (
                            <tr key={borrowing.id}>
                                <td>{borrowing.book.title}</td>
                                <td>{borrowing.user.first_name} {borrowing.user.last_name}</td>
                                <td>{new Date(borrowing.borrowed_at).toLocaleDateString()}</td>
                                <td>{new Date(borrowing.due_date).toLocaleDateString()}</td>
                                <td>{borrowing.days_overdue}</td>
                                <td>
                                    <button onClick={() => handleReturn(borrowing.id)}>
                                        Marquer comme retourné
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}

export default Delays; 