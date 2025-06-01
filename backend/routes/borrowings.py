from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime, timedelta
from models import db, Book, Copy, User, Borrowing, Reservation

borrowings_bp = Blueprint('borrowings', __name__)

@borrowings_bp.route('/', methods=['GET'])
@jwt_required()
def get_user_borrowings():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    borrowings = Borrowing.query.filter_by(user_id=current_user_id).all()
    return jsonify([{
        'id': b.id,
        'book': {
            'id': b.copy.book.id,
            'title': b.copy.book.title,
            'author': b.copy.book.author
        },
        'borrowed_at': b.borrowed_at.isoformat(),
        'due_date': b.due_date.isoformat(),
        'returned_at': b.returned_at.isoformat() if b.returned_at else None,
        'is_overdue': b.returned_at is None and datetime.utcnow() > b.due_date,
        'days_overdue': (datetime.utcnow() - b.due_date).days if b.returned_at is None and datetime.utcnow() > b.due_date else 0,
        'penalty': max(0, (datetime.utcnow() - b.due_date).days * 0.5) if b.returned_at is None and datetime.utcnow() > b.due_date else 0
    } for b in borrowings]), 200

@borrowings_bp.route('/<int:copy_id>', methods=['POST'])
@jwt_required()
def borrow_book(copy_id):
    current_user_id = get_jwt_identity()
    copy = Copy.query.get_or_404(copy_id)
    
    if not copy.is_available:
        return jsonify({'error': 'This copy is not available'}), 400
    
    # Check if user has any overdue books
    overdue_borrowings = Borrowing.query.filter_by(
        user_id=current_user_id,
        returned_at=None
    ).filter(Borrowing.due_date < datetime.utcnow()).first()
    
    if overdue_borrowings:
        return jsonify({'error': 'You have overdue books that need to be returned first'}), 400
    
    borrowing = Borrowing(copy=copy, user_id=current_user_id)
    copy.is_available = False
    
    db.session.add(borrowing)
    db.session.commit()
    
    return jsonify({
        'id': borrowing.id,
        'book': {
            'id': copy.book.id,
            'title': copy.book.title,
            'author': copy.book.author
        },
        'borrowed_at': borrowing.borrowed_at.isoformat(),
        'due_date': borrowing.due_date.isoformat()
    }), 201

@borrowings_bp.route('/<int:borrowing_id>/return', methods=['PUT'])
@jwt_required()
def return_book(borrowing_id):
    current_user_id = get_jwt_identity()
    borrowing = Borrowing.query.get_or_404(borrowing_id)

    if borrowing.user_id != int(current_user_id):
        return jsonify({'error': 'Unauthorized'}), 403

    if borrowing.returned_at:
        return jsonify({'error': 'Book already returned'}), 400

    # Marquer le livre comme retourné
    borrowing.returned_at = datetime.utcnow()
    borrowing.copy.is_available = True

    response = {
        'message': 'Book returned successfully',
        'returned_at': borrowing.returned_at.isoformat()
    }

    next_reservation = Reservation.query.filter_by(
        book_id=borrowing.copy.book_id,
        notified=False
    ).order_by(Reservation.position).first()

    if next_reservation:
        try:
            print("Auto-borrow triggered for user:", next_reservation.user_id)
            print("Borrowing copy ID:", borrowing.copy.id)

            already_borrowed = Borrowing.query.filter_by(
                copy_id=borrowing.copy.id,
                user_id=next_reservation.user_id,
                returned_at=None
            ).first()

            if already_borrowed:
                print("User already has this copy")
            else:
                new_borrowing = Borrowing(
                    copy_id=borrowing.copy.id,
                    user_id=next_reservation.user_id,
                    borrowed_at=datetime.utcnow(),
                    due_date=datetime.utcnow() + timedelta(days=14)
                )
                db.session.add(new_borrowing)
                db.session.delete(next_reservation)
                borrowing.copy.is_available = False
                
                response['next_reservation'] = {
                    'user': {
                        'id': next_reservation.user.id,
                        'email': next_reservation.user.email,
                        'first_name': next_reservation.user.first_name,
                        'last_name': next_reservation.user.last_name
                    },
                    'auto_borrowed': True
                }

        except Exception as e:
            import traceback
            traceback.print_exc()
            db.session.rollback()
            return jsonify({
                'error': 'Failed to auto-assign reserved copy',
                'details': str(e)
            }), 500

    db.session.commit()
    return jsonify(response), 200



@borrowings_bp.route('/overdue', methods=['GET'])
@jwt_required()
def get_overdue_borrowings():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    if not user.is_admin:
        return jsonify({'error': 'Unauthorized'}), 403
    
    overdue_borrowings = Borrowing.query.filter(
        Borrowing.returned_at.is_(None),
        Borrowing.due_date < datetime.utcnow()
    ).all()
    
    return jsonify([{
        'id': b.id,
        'user': {
            'id': b.user.id,
            'email': b.user.email,
            'first_name': b.user.first_name,
            'last_name': b.user.last_name
        },
        'book': {
            'id': b.copy.book.id,
            'title': b.copy.book.title,
            'author': b.copy.book.author
        },
        'borrowed_at': b.borrowed_at.isoformat(),
        'due_date': b.due_date.isoformat(),
        'days_overdue': (datetime.utcnow() - b.due_date).days,
        'penalty': (datetime.utcnow() - b.due_date).days * 0.5  # 0.5€ par jour de retard
    } for b in overdue_borrowings]), 200

@borrowings_bp.route('/penalties', methods=['GET'])
@jwt_required()
def get_user_penalties():
    current_user_id = get_jwt_identity()
    
    # Get all overdue borrowings for the user
    overdue_borrowings = Borrowing.query.filter(
        Borrowing.user_id == current_user_id,
        Borrowing.returned_at.is_(None),
        Borrowing.due_date < datetime.utcnow()
    ).all()
    
    total_penalty = sum((datetime.utcnow() - b.due_date).days * 0.5 for b in overdue_borrowings)
    
    return jsonify({
        'total_penalty': total_penalty,
        'overdue_books': [{
            'id': b.id,
            'book': {
                'id': b.copy.book.id,
                'title': b.copy.book.title,
                'author': b.copy.book.author
            },
            'days_overdue': (datetime.utcnow() - b.due_date).days,
            'penalty': (datetime.utcnow() - b.due_date).days * 0.5
        } for b in overdue_borrowings]
    }), 200 