import BookList from '../components/BookList/BookList';
import { useState, useEffect } from 'react';


function Books() {
    const [books, setBooks] = useState([])
    const [loading, setLoading] = useState(null)

    useEffect(() => {
        fetch('http://localhost:5009/api/books/')
        .then(res => res.json())
        .then(data => setBooks(data))
        .finally(() => setLoading(false))
    }, []);

  return (
    <>
      <div>
        <BookList books={books}/>
      </div>
    </>
  )
}

export default Books
