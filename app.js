const express = require('express');
const mysql = require('mysql2');
const multer = require('multer');
const app = express();

//Set up multer for files uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/images'); //Directory to save uploaded files
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});

const upload = multer({storage:storage});

// Create MySQL connection
const connection = mysql.createConnection({
    host: 'sql.freedb.tech',
    user: 'freedb_yemovie',
    password: 'R984gA@V6U9&qm#',
    database: 'freedb_yemovie'
});
connection.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        return;
    }
    console.log('Connected to MySQL database');
});
// Set up view engine
app.set('view engine', 'ejs');
// enable static files
app.use(express.static('public'));
//enable form processing
app.use(express.urlencoded({
    extended: false
}));

// Define routes

// Route to render the homepage
app.get('/', (req, res) => {
    const sql = 'SELECT * FROM movie';
    connection.query(sql, (error, results) => {
        if (error) {
            console.error('Database query error: ', error.message);
            return res.status(500).send('Error retrieving movies');
        }
        res.render('index', { movie: results });
    });
});

app.get('/movie/:id', (req, res) => {
    const movie_id = req.params.id;
    const sql = 'SELECT * FROM movie WHERE movie_id = ?';

    connection.query(sql, [movie_id], (error, results) => {
        if (error) {
            console.error('Database query error:', error.message);
            return res.status(500).send('Error retrieving movie');
        }
        if (results.length > 0) {
            res.render('movie', { movie: results[0] });
        } else {
            res.status(404).send('Movie not found');
        }
    });
});

app.get('/addMovie', (req,res) => {
    res.render('addMovie');
});

app.post('/addMovie', upload.single('image'), (req, res) => {
    const { title, genre, release_date, description, director, cast } = req.body;
    let image;
    if (req.file) {
        image = req.file.filename;  // Save only the filename
    } else {
        image = null;
    }
    const sql = 'INSERT INTO movie (title, genre, release_date, description, director, cast, image) VALUES (?, ?, ?, ?, ?, ?, ?)';
    connection.query(sql, [title, genre, release_date, description, director, cast, image], (error, results) => {
        if (error) {
            console.error("Error adding movie:", error);
            res.status(500).send('Error adding movie');
        } else {
            res.redirect('/');
        }
    });
});

app.get('/editMovie/:id', (req,res)=> {
    const movie_id = req.params.id;
    const sql = 'SELECT * FROM movie WHERE movie_id = ?';
    //Fetch data from MySQL based on the product ID
    connection.query(sql, [movie_id], (error,results)=> {
        if(error){
            console.error('Database query error:', error.message);
            return res.status(500).send('Error retrieving movie details by ID');
        }
        //Check if any product with the given ID was found
        if (results.length > 0){
            //Render HTML page with the product data
            res.render('editMovie',{movie: results[0]});
        } else {
            //If no product with the given ID was found, render a 404 page or handle it accordingly
            res.status(404).send('Movie not found');
        }
    });
});

app.post('/editMovie/:id', upload.single('image'), (req,res) => {
    const movie_id = req.params.id;
    //Extract product data from the request body
    const {title, genre, release_date, description, director, cast} = req.body;
    let image = req.body.currentImage; //retrieve current image filename
    if (req.file) { //if new image is uploaded
        image = req.file.filename; // set image to be new image filename
    }
    const sql = 'UPDATE movie SET title = ?, genre = ?, release_date =?, description =?, director =?, cast =?, image =? WHERE movie_id = ?';
    //Insert the new product into the database
    connection.query(sql, [title, genre, release_date, description, director, cast, image, movie_id], (error, results) => {
        if(error) {
            //Handle any error that occurs during the database operation
            console.error("Error updating Movie:", error);
            res.status(500).send('Error updating Movie details');
        } else {
            //Send a success response
            res.redirect('/');
        }
    });
});

app.get('/deleteMovie/:id', (req,res)=> {
    const movie_id = req.params.id;
    const sql = 'DELETE FROM movie WHERE movie_id = ?';
    connection.query(sql, [movie_id], (error,results)=> {
        if(error){
            //Handle any error that occurs during the database operation
            console.error('Error deleting movie:', error);
            return res.status(500).send('Error deleting movie');
        } else {
            //Send a success response
            res.redirect('/');
        }
    });
});

app.get('/about', (req, res) => {
    res.render('aboutUs');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));