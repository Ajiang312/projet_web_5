import React, { useState } from "react";
import './BookList.css'

const BookList = ({ books, isAdmin = false }) => {
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    const handleBorrow = async (bookId) => {
        try {
            // 1. Récupérer les détails du livre pour obtenir les IDs des exemplaires disponibles
            const bookDetailsResponse = await fetch(`http://localhost:5009/api/books/${bookId}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            const bookDetails = await bookDetailsResponse.json();

            if (!bookDetailsResponse.ok || !bookDetails.available_copy_ids || bookDetails.available_copy_ids.length === 0) {
                setError(bookDetails.error || 'Aucun exemplaire disponible pour l\'emprunt.');
                return;
            }

            // 2. Obtenir l'ID du premier exemplaire disponible
            const copyIdToBorrow = bookDetails.available_copy_ids[0];

            // 3. Appeler l'endpoint d'emprunt avec l'ID de l'exemplaire
            const borrowResponse = await fetch(`http://localhost:5009/api/borrowings/${copyIdToBorrow}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            const borrowData = await borrowResponse.json();

            if (borrowResponse.ok) {
                setSuccess('Livre emprunté avec succès !');
                // Rafraîchir la liste des livres pour mettre à jour la disponibilité
                window.location.reload();
            } else {
                setError(borrowData.error || 'Erreur lors de l\'emprunt');
            }
        } catch (err) {
            setError('Erreur de connexion');
        }
    };

    const handleReserve = async (bookId) => {
        try {
            const response = await fetch(`http://localhost:5009/api/reservations/${bookId}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            const data = await response.json();
            if (response.ok) {
                setSuccess('Livre réservé avec succès !');
                // Rafraîchir la liste des livres
                window.location.reload();
            } else {
                setError(data.error || 'Erreur lors de la réservation');
            }
        } catch (err) {
            setError('Erreur de connexion');
        }
    };

    const handleUpdateStock = async (bookId, action) => {
        try {
            const response = await fetch(`http://localhost:5009/api/books/${bookId}/copies`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    num_copies: action === 'add' ? 1 : -1
                })
            });
            const data = await response.json();
            if (response.ok) {
                setSuccess('Stock mis à jour avec succès !');
                // Rafraîchir la liste des livres
                window.location.reload();
            } else {
                setError(data.error || 'Erreur lors de la mise à jour du stock');
            }
        } catch (err) {
            setError('Erreur de connexion');
        }
    };

    return (
        <div className="book-list">
            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}
            <table>
                <thead>
                    <tr>
                        <th>Titre</th>
                        <th>Auteur</th>
                        <th>Disponibles</th>
                        <th>Total</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {books.map(book => (
                        <tr key={book.id}>
                            <td>{book.title}</td>
                            <td>{book.author}</td>
                            <td>{book.available_copies}</td>
                            <td>{book.total_copies}</td>
                            <td>
                                {isAdmin ? (
                                    <div className="admin-actions">
                                        <button onClick={() => handleUpdateStock(book.id, 'add')}>+</button>
                                        <button onClick={() => handleUpdateStock(book.id, 'remove')}>-</button>
                                    </div>
                                ) : (
                                    <div className="user-actions">
                                        {book.available_copies > 0 ? (
                                            <button onClick={() => handleBorrow(book.id)}>Emprunter</button>
                                        ) : (
                                            <button onClick={() => handleReserve(book.id)}>Réserver</button>
                                        )}
                                    </div>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default BookList;