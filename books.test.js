process.env.NODE_ENV = 'test';

const request = require('supertest');
const app = require('./app');
const db = require('./db');

let testBook1;
let testBook2;

beforeEach(async () => {
    testBook1 = {
        isbn: '0691161518',
        amazon_url: 'http://a.co/eobPtX2',
        author: 'Matthew Lane',
        language: 'english',
        pages: 264,
        publisher: 'Princeton University Press',
        title: 'Power-Up: Unlocking the Hidden Mathematics in Video Games',
        year: 2017,
    };

    testBook2 = {
        isbn: '0439452222',
        amazon_url: 'http://a.co/eobPtX2',
        author: 'Craig Lowe',
        language: 'english',
        pages: 321,
        publisher: 'Scholastic',
        title: 'Buses and Children',
        year: 2020,
    };

    await db.query(
        `INSERT INTO books (isbn, amazon_url, author, language, pages, publisher, title, year)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
            testBook1.isbn,
            testBook1.amazon_url,
            testBook1.author,
            testBook1.language,
            testBook1.pages,
            testBook1.publisher,
            testBook1.title,
            testBook1.year,
        ]
    );

    await db.query(
        `INSERT INTO books (isbn, amazon_url, author, language, pages, publisher, title, year)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
            testBook2.isbn,
            testBook2.amazon_url,
            testBook2.author,
            testBook2.language,
            testBook2.pages,
            testBook2.publisher,
            testBook2.title,
            testBook2.year,
        ]
    );
});

afterEach(async () => {
    await db.query(`DELETE FROM books`);
});

afterAll(async () => {
    await db.end();
});

describe('GET /books', () => {
    test('Get obj with key of books and value of array of books', async () => {
        const res = await request(app).get('/books');

        expect(res.statusCode).toEqual(200);
        expect(res.body).toEqual({
            books: expect.any(Array),
        });
        expect(res.body.books).toHaveLength(2);
        expect(res.body.books[0]).toEqual(testBook2);
        expect(res.body.books[1]).toEqual(testBook1);
    });
});

describe('GET /:id', () => {
    test('Get book with :id', async () => {
        const res1 = await request(app).get(`/books/${testBook1.isbn}`);

        expect(res1.statusCode).toEqual(200);
        expect(res1.body).toEqual({
            book: testBook1,
        });

        const res2 = await request(app).get(`/books/${testBook2.isbn}`);

        expect(res2.statusCode).toEqual(200);
        expect(res2.body).toEqual({
            book: testBook2,
        });
    });
});

describe('POST /books', () => {
    test('Create a new book', async () => {
        const res = await request(app).post('/books').send({
            isbn: '4324534523',
            amazon_url: 'http://a.co/eobPtX2',
            author: 'Laury Lane',
            language: 'english',
            pages: 114,
            publisher: 'Chicken Dances',
            title: 'The Art of Chickens',
            year: 2019,
        });

        expect(res.statusCode).toEqual(201);
        expect(res.body).toEqual({
            book: expect.any(Object),
        });
        expect(res.body).toEqual({
            book: expect.objectContaining({
                isbn: '4324534523',
                language: 'english',
                title: 'The Art of Chickens',
            }),
        });
    });

    test('Error when given incorrect/missing data format', async () => {
        const res = await request(app).post('/books').send({
            language: 'english',
        });

        expect(res.statusCode).toEqual(400);
    });
});

describe('PUT /:isbn', () => {
    test('Updating book', async () => {
        const res = await request(app).put(`/books/${testBook1.isbn}`).send({
            amazon_url: testBook2.amazon_url,
            author: testBook2.author,
            language: testBook2.language,
            pages: testBook2.pages,
            publisher: testBook2.publisher,
            title: testBook2.title,
            year: testBook2.year,
            isbn: testBook2.isbn,
        });
        console.log(res.body);
        expect(res.statusCode).toEqual(200);
    });

    test('Error when given incorrect/missing data format', async () => {
        const res = await request(app).put(`/books/${testBook1.isbn}`).send({
            language: 'english',
        });

        expect(res.statusCode).toEqual(400);
    });
});

describe('DELETE /:isbn', () => {
    test('Delete a book', async () => {
        const res = await request(app).delete(`/books/${testBook1.isbn}`);

        expect(res.statusCode).toEqual(200);
        expect(res.body).toEqual({ message: 'Book deleted' });
    });
});
