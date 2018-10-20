var express = require('express');
var app = express();

var pgp = require('pg-promise')();
var db = pgp('postgres://fijhidaiiibojh:0c6abb30a97fdf1bb0969ae26665733c091b082097dc156b7073f9122e993b63@ec2-54-83-203-198.compute-1.amazonaws.com:5432/dfnhef9p502n3m?ssl=true')

var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.set('view engine', 'ejs');

app.get('/', function (request, response) {
    response.render('pages/index');
});

app.get('/about', function (request, response) {
    var name = 'Tinakarn Janthong';
    response.render('pages/about', { fullname: name });
});

app.get('/products', function (request, response) {
    var id = request.param('id');
    var sql = 'select * from products order by id ASC';
    if (id) {
        sql += ` where id = ${id}`;
    }
    db.any(sql)
        .then(function (data) {
            console.log('DATA' + data);
            response.render('pages/products', { products: data });
        })
        .catch(function (data) {
            console.log('/products ERROR' + error);
        })
});

app.get('/products/:pid', function (request, response) {
    var pid = request.params.pid;
    if (pid == 'insert') {
        response.render('pages/insert_product');
    }
    else {
        var sql = 'select * from products where id =' + pid;

        db.any(sql)
            .then(function (data) {
                response.render('pages/product_edit', { product: data[0] });
            })
            .catch(function (error) {
                console.log('/products/:pid ERROR' + error);
            })
    }
});

app.post('/product/insert', function (request, response) {
    var title = request.body.title;
    var price = request.body.price;
    var tags = request.body.tags;
    var date = new Date();
    var day = date.toLocaleDateString();
    var time = date.toLocaleTimeString();
    var sql = `insert into products (title,price,created_at,tags) values('${title}','${price}','${day} ${time}','{${tags}}')`;
    console.log(sql);
    db.query(sql)
        .then(function (data) {
            response.redirect('/products');
        })
        .catch(function (data) {
            console.log('/products/insert ERROR' + error);
        })
});

app.post('/product/update', function (request, response) {
    var id = request.body.id;
    var title = request.body.title;
    var price = request.body.price;
    //var sql = 'update products set title = "' + title + '", price = "' + price + '" where id = ' + id;
    var sql = `update products set title = '${title}', price = ${price} where id = ${id}`;

    db.query(sql)
        .then(function (data) {
            response.redirect('/products');
        })
        .catch(function (data) {
            console.log('/products/update ERROR' + error);
        })
});

app.post('/product/delete', function (request, response) {
    var id = request.body.id;
    var sql = `delete from products where id = ${id}`;

    db.query(sql)
        .then(function (data) {
            console.log("Delete");
            response.redirect('/products');
        })
        .catch(function (data) {
            console.log('/products/delete ERROR' + error);
        })
});

app.get('/users', function (request, response) {
    db.any('select * from users order by id ASC')
        .then(function (data) {
            console.log('DATA' + data);
            response.render('pages/users', { users: data });
        })
        .catch(function (data) {
            console.log('ERROR' + error);
        })
});

app.get('/users/:id', function (request, response) {
    var id = request.params.id;
    if (id == 'insert') {
        response.render('pages/insert_user');
    }
    else {
        var sql = `select email, user_id, purchase_id, purchases.created_at, name, address, purchase_items.state
    from purchase_items, products, purchases, users
    where products.id = purchase_items.product_id
    and purchases.id = purchase_items.purchase_id
    and purchases.user_id = users.id
    and user_id = ${id}`;
        db.any(sql)
            .then(function (data) {
                console.log('DATA' + JSON.stringify(data));
                response.render('pages/user_report', { user: data });
            })
            .catch(function (data) {
                response.render('pages/index');
                console.log('ERROR' + error);
            })
    }
});

app.get('/receipt/:uid/:pid', function (request, response) {
    var user_id = request.params.uid;
    var purchase_id = request.params.pid;
    var total = 0;
    var sql = `select title, products.price, quantity, user_id, purchase_id, purchases.created_at, name, address, purchases.state, zipcode, purchase_items.state as status, email
    from purchase_items, products, purchases, users
    where products.id = purchase_items.product_id
    and purchases.id = purchase_items.purchase_id
    and purchases.user_id = users.id
    and user_id = ${user_id}
    and purchase_id = ${purchase_id}`;
    db.any(sql)
        .then(function (data) {
            console.log('DATA' + data);
            response.render('pages/receipt', { user: data, total: total });
        })
        .catch(function (data) {
            console.log('ERROR' + error);
        })
});

app.post('/user/insert', function (request, response) {
    var email = request.body.email;
    var pwd = request.body.pwd;
    var sex = request.body.sex;
    var date = new Date();
    var day = date.toLocaleDateString();
    var time = date.toLocaleTimeString();
    var sql = `insert into users (email,password,details,created_at) values('${email}','${pwd}','"sex"=>"{${sex}}"','${day} ${time}')`;
    console.log(sql);
    db.query(sql)
        .then(function (data) {
            response.redirect('/users');
        })
        .catch(function (data) {
            console.log('/products/insert ERROR' + error);
        })
});

app.get('/report', function (request, response) {
    var sql = `select user_id, email, count(user_id) as count
    from purchases, users
    where purchases.user_id = users.id
    GROUP BY user_id, email
    order by user_id`;
    var user_x = [];
    var user_y = [];
    db.any(sql)
        .then(function (data) {
            data.forEach(function (user) {
                var words = user.email.split('@');
                user_x.push(words[0]);
                user_y.push(user.count);
            });
            console.log(user_x);
            console.log(user_y);
            console.log('DATA' + data);
            response.render('pages/report', { users: data, user_x: user_x, user_y: user_y });
        })
        .catch(function (data) {
            console.log('/report ERROR' + error);
        })
});

var port = process.env.PORT || 8080;
app.listen(port, function () {
    console.log('App is running on http://localhost:' + port);
});