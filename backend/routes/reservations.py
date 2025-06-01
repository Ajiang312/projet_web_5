from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime
from models import db, Book, Copy, User, Borrowing, Reservation
from sqlalchemy import func

reservations_bp = Blueprint('reservations', __name__)

@reservations_bp.route('/', methods=['GET'])
@jwt_required()
def get_user_reservations():
    current_user_id = get_jwt_identity()
    reservations = Reservation.query.filter_by(user_id=current_user_id).all()
    
    return jsonify([{
        'id': r.id,
        'book': {
            'id': r.book.id,
            'title': r.book.title,
            'author': r.book.author
        },
        'position': r.position,
        'notified': r.notified,
        'created_at': r.created_at.isoformat()
    } for r in reservations]), 200

@reservations_bp.route('/<int:book_id>', methods=['POST'])
@jwt_required()
def create_reservation(book_id):
    current_user_id = get_jwt_identity()
    book = Book.query.get_or_404(book_id)
    
    # Check if there are any available copies
    available_copies = Copy.query.filter_by(book_id=book_id, is_available=True).first()
    if available_copies:
        return jsonify({'error': 'Book is available for borrowing'}), 400
    
    # Check if user already has a reservation for this book
    existing_reservation = Reservation.query.filter_by(
        book_id=book_id,
        user_id=current_user_id
    ).first()
    
    if existing_reservation:
        return jsonify({'error': 'You already have a reservation for this book'}), 400
    
    # Get the next position in the queue
    last_position = db.session.query(func.max(Reservation.position)).filter_by(book_id=book_id).scalar() or 0
    
    reservation = Reservation(
        book_id=book_id,
        user_id=current_user_id,
        position=last_position + 1
    )
    
    db.session.add(reservation)
    db.session.commit()
    
    return jsonify({
        'id': reservation.id,
        'book': {
            'id': book.id,
            'title': book.title,
            'author': book.author
        },
        'position': reservation.position,
        'notified': reservation.notified,
        'created_at': reservation.created_at.isoformat()
    }), 201

@reservations_bp.route('/<int:reservation_id>', methods=['DELETE'])
@jwt_required()
def cancel_reservation(reservation_id):
    current_user_id = get_jwt_identity()
    reservation = Reservation.query.get_or_404(reservation_id)
    
    if reservation.user_id != int(current_user_id):
        return jsonify({'error': 'Unauthorized'}), 403
    
    # Update positions of subsequent reservations
    subsequent_reservations = Reservation.query.filter(
        Reservation.book_id == reservation.book_id,
        Reservation.position > reservation.position
    ).all()
    
    for r in subsequent_reservations:
        r.position -= 1
    
    db.session.delete(reservation)
    db.session.commit()
    
    return jsonify({'message': 'Reservation cancelled successfully'}), 200

@reservations_bp.route('/book/<int:book_id>', methods=['GET'])
@jwt_required()
def get_book_reservations(book_id):
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    if not user.is_admin:
        return jsonify({'error': 'Unauthorized'}), 403
    
    reservations = Reservation.query.filter_by(book_id=book_id).order_by(Reservation.position).all()
    
    return jsonify([{
        'id': r.id,
        'user': {
            'id': r.user.id,
            'email': r.user.email,
            'first_name': r.user.first_name,
            'last_name': r.user.last_name
        },
        'position': r.position,
        'notified': r.notified,
        'created_at': r.created_at.isoformat()
    } for r in reservations]), 200 