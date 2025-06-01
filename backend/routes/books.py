from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, Book, Copy, User, Borrowing, Reservation
from sqlalchemy import func
from flask_cors import CORS

books_bp = Blueprint('books', __name__)

CORS(books_bp, origins='*')

@books_bp.route('/', methods=['GET'])
def get_books():
    books = Book.query.all()
    return jsonify([{
        'id': book.id,
        'title': book.title,
        'author': book.author,
        'published_at': book.published_at.isoformat() if book.published_at else None,
        'description': book.description,
        'available_copies': len([copy for copy in book.copies if copy.is_available]),
        'total_copies': len(book.copies)
    } for book in books]), 200

@books_bp.route('/<int:book_id>', methods=['GET'])
def get_book(book_id):
    book = Book.query.get_or_404(book_id)
    return jsonify({
        'id': book.id,
        'title': book.title,
        'author': book.author,
        'published_at': book.published_at.isoformat() if book.published_at else None,
        'description': book.description,
        'available_copies': len([copy for copy in book.copies if copy.is_available]),
        'total_copies': len(book.copies),
        'available_copy_ids': [copy.id for copy in book.copies if copy.is_available]
    }), 200

@books_bp.route('/', methods=['POST'])
@jwt_required()
def create_book():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    if not user.is_admin:
        return jsonify({'error': 'Unauthorized'}), 403
    
    data = request.get_json()
    book = Book(
        title=data['title'],
        author=data['author'],
        published_at=data.get('published_at'),
        description=data.get('description')
    )
    
    db.session.add(book)
    db.session.commit()
    
    # Create initial copies if specified
    num_copies = data.get('num_copies', 1)
    for _ in range(num_copies):
        copy = Copy(book=book)
        db.session.add(copy)
    
    db.session.commit()
    
    return jsonify({
        'id': book.id,
        'title': book.title,
        'author': book.author,
        'published_at': book.published_at.isoformat() if book.published_at else None,
        'description': book.description,
        'available_copies': num_copies,
        'total_copies': num_copies
    }), 201

@books_bp.route('/<int:book_id>/copies', methods=['POST'])
@jwt_required()
def add_copies(book_id):
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    if not user.is_admin:
        return jsonify({'error': 'Unauthorized'}), 403
    
    book = Book.query.get_or_404(book_id)
    data = request.get_json()
    num_copies = data.get('num_copies', 1)
    
    for _ in range(num_copies):
        copy = Copy(book=book)
        db.session.add(copy)
    
    db.session.commit()
    
    return jsonify({
        'message': f'Added {num_copies} copies to book {book.title}',
        'total_copies': len(book.copies),
        'available_copies': len([copy for copy in book.copies if copy.is_available])
    }), 200

@books_bp.route('/<int:book_id>/copies/<int:copy_id>', methods=['DELETE'])
@jwt_required()
def remove_copy(book_id, copy_id):
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    if not user.is_admin:
        return jsonify({'error': 'Unauthorized'}), 403
    
    copy = Copy.query.filter_by(id=copy_id, book_id=book_id).first_or_404()
    
    if not copy.is_available:
        return jsonify({'error': 'Cannot remove a copy that is currently borrowed'}), 400
    
    db.session.delete(copy)
    db.session.commit()
    
    return jsonify({'message': 'Copy removed successfully'}), 200
