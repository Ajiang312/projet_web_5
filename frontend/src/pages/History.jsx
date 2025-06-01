import React, { useState, useEffect } from 'react';
import './History.css';

function History() {
    const [borrowings, setBorrowings] = useState([]);
    const [reservations, setReservations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    setError('Veuillez vous connecter');
                    setLoading(false);
                    return;
                }

                // Fetch borrowings
                const borrowingsResponse = await fetch('http://localhost:5009/api/borrowings/', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                const borrowingsData = await borrowingsResponse.json();
                setBorrowings(borrowingsData);

                // Fetch reservations
                const reservationsResponse = await fetch('http://localhost:5009/api/reservations/', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                const reservationsData = await reservationsResponse.json();
                setReservations(reservationsData);
            } catch (err) {
                setError('Erreur lors du chargement des données');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
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
                // Rafraîchir la liste des emprunts
                const updatedBorrowings = borrowings.filter(b => b.id !== borrowingId);
                setBorrowings(updatedBorrowings);
            } else {
                setError('Erreur lors du retour du livre');
            }
        } catch (err) {
            setError('Erreur de connexion');
        }
    };

    const handleCancelReservation = async (reservationId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5009/api/reservations/${reservationId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.ok) {
                // Rafraîchir la liste des réservations
                const updatedReservations = reservations.filter(r => r.id !== reservationId);
                setReservations(updatedReservations);
            } else {
                setError('Erreur lors de l\'annulation de la réservation');
            }
        } catch (err) {
            setError('Erreur de connexion');
        }
    };

    if (loading) return <div>Chargement...</div>;
    if (error) return <div className="error-message">{error}</div>;

    return (
        <div className="history-container">
            <h2>Mes emprunts</h2>
            <table className="borrowings-table">
                <thead>
                    <tr>
                        <th>Livre</th>
                        <th>Date d'emprunt</th>
                        <th>Date de retour prévue</th>
                        <th>Statut</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {borrowings.map(borrowing => (
                        <tr key={borrowing.id} className={borrowing.is_overdue ? 'overdue' : ''}>
                            <td>{borrowing.book.title}</td>
                            <td>{new Date(borrowing.borrowed_at).toLocaleDateString()}</td>
                            <td>{new Date(borrowing.due_date).toLocaleDateString()}</td>
                            <td>
                                {borrowing.returned_at ? (
                                    'Retourné'
                                ) : borrowing.is_overdue ? (
                                    `En retard (${borrowing.days_overdue} jours)`
                                ) : (
                                    'En cours'
                                )}
                            </td>
                            <td>
                                {!borrowing.returned_at && (
                                    <button onClick={() => handleReturn(borrowing.id)}>
                                        Retourner
                                    </button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <h2>Mes réservations</h2>
            <table className="reservations-table">
                <thead>
                    <tr>
                        <th>Livre</th>
                        <th>Position</th>
                        <th>Date de réservation</th>
                        <th>Statut</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {reservations.map(reservation => (
                        <tr key={reservation.id}>
                            <td>{reservation.book.title}</td>
                            <td>{reservation.position}</td>
                            <td>{new Date(reservation.created_at).toLocaleDateString()}</td>
                            <td>{reservation.notified ? 'Notifié' : 'En attente'}</td>
                            <td>
                                <button onClick={() => handleCancelReservation(reservation.id)}>
                                    Annuler
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default History; 