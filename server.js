var express = require('express');
var app = express();

var pgp = require('pg-promise')();
var db = pgp('postgres://fijhidaiiibojh:0c6abb30a97fdf1bb0969ae26665733c091b082097dc156b7073f9122e993b63@ec2-54-83-203-198.compute-1.amazonaws.com:5432/dfnhef9p502n3m?ssl=true')

var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.set('view engine', 'ejs');

app.get('/', function (request, response) {
    response.render('pages/index');
});

app.get('/about', function (request, response) {
    var name = 'Tinakarn Janthong';
    response.render('pages/about', {fullname: name});
});

app.get('/products', function (request, response) 
{
    var id = request.param('id');
    var sql = 'select * from products';
    if(id)
    {
        sql += ' where id =' + id;
    }
    db.any(sql)
        .then(function (data) 
        {
            console.log('DATA' + data);
            response.render('pages/products', { products: data });
        })
        .catch(function (data) 
        {
            console.log('/products ERROR' + error);
        })
});

app.get('/products/:pid', function(request, response)
{
    var pid = request.params.pid;
    var sql = 'select * from products where id =' + pid;

    db.any(sql)
        .then(function (data)
        {
            response.render('pages/product_edit', { product: data[0] });
        })
        .catch(function (error) 
        {
            console.log('/products/:pid ERROR' + error);
        })
});

//Update data
app.post('/products/update', function(request, response)
{
    var id = request.body.id;
    var title = request.body.title;
    var price = request.body.price;
    //var sql = 'update products set title = "' + title + '", price = "' + price + '" where id = ' + id;
    var sql = `update products set title = '${title}', price = ${price} where id = ${id}`;
    
    db.query(sql)
        .then(function(data)
        {
            console.log("Update"); 
            response.redirect('/products');
        })
        .catch(function(data)
        {
            console.log('/products/update ERROR' + error);
        })
});

app.get('/users', function (request, response) 
{
    db.any('select * from users')
        .then(function (data) 
        {
            console.log('DATA' + data);
            response.render('pages/users', { users: data });
        })
        .catch(function (data) 
        {
            console.log('ERROR' + error);
        })
});

app.get('/users/:id', function (request, response) 
{
    //*ตรงนี้ต่างกัน
    var id = request.params.id;
    var sql = 'select * from users';
    if(id)
    {
        sql += ' where id =' + id;
    }
    db.any(sql)
        .then(function (data) 
        {
            console.log('DATA' + data);
            response.render('pages/users', { users: data });
        })
        .catch(function (data) 
        {
            console.log('ERROR' + error);
        })
});

var port = process.env.PORT || 8080;
app.listen(port, function()
    {
        console.log('App is running on http://localhost:' + port);
    });