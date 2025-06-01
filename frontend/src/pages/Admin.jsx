import React, { useState, useEffect } from 'react';
import './Admin.css';

function Admin() {
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);

    useEffect(() => {
        const fetchBooks = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    setError('Veuillez vous connecter');
                    setLoading(false);
                    return;
                }

                const response = await fetch('http://localhost:5009/api/books/', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!response.ok) {
                    throw new Error('Erreur lors de la récupération des livres');
                }

                const data = await response.json();
                setBooks(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchBooks();
    }, []);

    const handleUpdateStock = async (bookId, action) => {
        try {
            const token = localStorage.getItem('token');
            
            if (!token) {
                setError('Veuillez vous connecter en tant qu\'administrateur');
                return;
            }

            let response;
            let url;
            let method;
            let body = null;

            if (action === 'add') {
                url = `http://localhost:5009/api/books/${bookId}/copies`;
                method = 'POST';
                body = JSON.stringify({ num_copies: 1 });
            } else if (action === 'remove') {
                // 1. Appeler l'API pour obtenir les IDs des exemplaires disponibles
                const bookDetailsResponse = await fetch(`http://localhost:5009/api/books/${bookId}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                const bookDetails = await bookDetailsResponse.json();

                if (!bookDetailsResponse.ok || !bookDetails.available_copy_ids || bookDetails.available_copy_ids.length === 0) {
                    setError('Aucun exemplaire disponible à supprimer.');
                    return;
                }

                // 2. Obtenir l'ID du premier exemplaire disponible
                const copyIdToDelete = bookDetails.available_copy_ids[0];

                // 3. Appeler DELETE pour supprimer cet exemplaire
                url = `http://localhost:5009/api/books/${bookId}/copies/${copyIdToDelete}`;
                method = 'DELETE';
                // Pas de body pour une requête DELETE
            }

            // Assure-toi que l'action est 'add' ou 'remove' avant de fetch
            if (!url || !method) {
                 setError('Action invalide.');
                 return;
            }

            response = await fetch(url, {
                method: method,
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: body // Sera null pour DELETE
            });

            const data = await response.json();

            if (response.ok) {
                setSuccessMessage('Stock mis à jour avec succès');
                // Pour mettre à jour l'affichage, il faudrait idéalement refetch la liste des livres
                // ou mettre à jour l'état local si l'API de modification renvoie les nouvelles quantités.
                // window.location.reload(); // Recharger la page pour l'instant
                 
                // Mettre à jour l'état local des livres avec les nouvelles quantités si l'API le renvoie
                 // Note: L'API DELETE renvoie juste un message de succès, pas les nouvelles quantités.
                 // Il est préférable de refetch la liste des livres ou de modifier l'état local autrement.
                 // Pour l'instant, on va simplifier en refetchant la liste.
                 
                 // Refetch la liste complète des livres pour mettre à jour l'affichage après ajout/suppression
                 const fetchBooks = async () => {
                     try {
                         const token = localStorage.getItem('token');
                         const response = await fetch('http://localhost:5009/api/books/', {
                             headers: {
                                 'Authorization': `Bearer ${token}`
                             }
                         });
                         if (response.ok) {
                             const data = await response.json();
                             setBooks(data);
                         }
                     } catch (err) {
                         console.error('Erreur lors du rafraîchissement des livres:', err);
                     }
                 };
                 fetchBooks();

                setSuccessMessage('Stock mis à jour avec succès'); // Peut-être plus spécifique (Exemplaire ajouté/supprimé)
                setTimeout(() => setSuccessMessage(null), 3000);

            } else {
                setError(data.error || 'Erreur lors de la mise à jour du stock');
            }
        } catch (err) {
            setError('Erreur de connexion');
        }
    };

    if (loading) return <div>Chargement...</div>;
    // Ajout de la condition pour afficher le message d'erreur si un problème survient lors du chargement initial
    if (error && !books.length && !loading) return <div className="error-message">{error}</div>;
    

    return (
        <div className="admin-container">
            <h2>Gestion du stock</h2>
            {successMessage && (
                <div className="success-message">{successMessage}</div>
            )}
            {/* Afficher l'erreur de l'update si elle existe */}
            {error && error !== 'Veuillez vous connecter' && <div className="error-message">{error}</div>}

            <table className="admin-table">
                <thead>
                    <tr>
                        <th>Livre</th>
                        <th>Auteur</th>
                        <th>Stock actuel</th>
                        <th>Exemplaires disponibles</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {books.map(book => (
                        <tr key={book.id}>
                            <td>{book.title}</td>
                            <td>{book.author}</td>
                            <td>{book.total_copies}</td>
                            <td>{book.available_copies}</td>
                            <td>
                                <div className="stock-actions">
                                    <button
                                        onClick={() => handleUpdateStock(book.id, 'add')}
                                        className="add-stock"
                                    >
                                        +1
                                    </button>
                                    <button
                                        onClick={() => handleUpdateStock(book.id, 'remove')}
                                        className="remove-stock"
                                        disabled={book.available_copies <= 0} // Désactivé s'il n'y a pas d'exemplaires disponibles
                                    >
                                        -1
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default Admin; 