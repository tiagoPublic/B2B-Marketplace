const express = require('express');
var morgan = require('morgan');
const mysql = require("mysql");
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');
const session = require('express-session');
const countries = require('countries-and-timezones').getAllCountries();

// criar uma app express
const app = express()

// registar o template engine (view engine)
app.set('view engine', 'ejs')

//Middleware
app.use(express.static('views'))
app.use(morgan('dev'))

// Configuração do body-parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Configuração do express-session
app.use(session({
    secret: '$anjos9487$martins9274$lanca9479$sousa8548$',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

// Configuração do stripe
require('dotenv').config()
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);


//mysql
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Fc.porto.20',
    database: 'marketplace_b2b'
})

//connect to database
connection.connect(function(error){
    if(error){
        throw error
    } else{
        console.log("Connected to database")
    }
})

app.get('/api/countries', (req, res) => {
    const countryList = Object.values(countries).map(country => ({
        code: country.id,
        name: country.name
    }));
    res.json(countryList);
});

// routes
//************ Index routes *********
app.get('/', async (req, res) => {
    try {
        // Primeira Query
        const query1 = 'SELECT * FROM departments';
        const results1 = await executeQuery(query1);

        // Segunda Query
        const query2 = 'SELECT * FROM companies ORDER BY RAND() LIMIT 9';
        const results2 = await executeQuery(query2);

        // Terceira Query
        const query3 = 'SELECT COUNT(*) AS total_products FROM products';
        const results3 = await executeQuery(query3);

        // Quarta query
        const query4 = 'SELECT p.*, c.company_name AS company_name FROM products p JOIN companies c ON p.company_id = c.id ORDER BY RAND() LIMIT 20';
        const products = await executeQuery(query4);

        // Quinta query
        const query5 = 'SELECT p.* FROM products p JOIN sub_departments sd ON p.sub_department_id = sd.id JOIN departments d ON sd.department_id = d.id WHERE d.id = 2 ORDER BY RAND() LIMIT 5';
        const results5 = await executeQuery(query5);

        // Sexta query
        const query6 = 'SELECT p.* FROM products p JOIN sub_departments sd ON p.sub_department_id = sd.id JOIN departments d ON sd.department_id = d.id WHERE d.id = 3 ORDER BY RAND() LIMIT 5';
        const results6 = await executeQuery(query6);

        // Setima query
        const query7 = 'SELECT p.* FROM products p JOIN sub_departments sd ON p.sub_department_id = sd.id JOIN departments d ON sd.department_id = d.id WHERE d.id = 6 ORDER BY RAND() LIMIT 5';
        const results7 = await executeQuery(query7);

        // Dividir os produtos em dois grupos de 4 produtos cada (Quarta query)
        const productsGroup1 = products.slice(0, 6);
        const productsGroup2 = products.slice(6, 12);
        const productsGroup3 = products.slice(12, 20);

        // Formatar os preços com duas casas decimais
        products.forEach(product => {
            product.formatted_price = product.price.toFixed(2);
            if (product.is_promotion) {
                product.formatted_promotion_price = product.promotion_price.toFixed(2);
            }
        });

        // Oitava query -> Vai buscar 1 produto random para a promoção
        const query8 = 'SELECT p.*, c.company_name AS company_name FROM products p JOIN companies c ON p.company_id = c.id WHERE p.is_promotion = 1 ORDER BY RAND() LIMIT 1';
        const results8 = await executeQuery(query8);
        const productBig = results8[0];

        // Formatar os preços com duas casas decimais
        productBig.formatted_price = productBig.price.toFixed(2);
        productBig.formatted_promotion_price = productBig.promotion_price.toFixed(2);   

        // Nona query -> vai buscar os departamentos e sub-departamentos para o menu lateral
        const query9 = 'SELECT d.id AS department_id, d.name_depart AS department_name, d.icon_depart AS icon_depart, sd.id AS sub_department_id, sd.name_sub_depart AS sub_department_name FROM departments d LEFT JOIN sub_departments sd ON d.id = sd.department_id';
        const results9 = await executeQuery(query9);

        // Agrupar os resultados por departamento
        const departments = results9.reduce((acc, row) => {
            const { department_id, department_name, icon_depart, sub_department_id, sub_department_name } = row;
            if (!acc[department_id]) {
                acc[department_id] = {
                    id: department_id,
                    name: department_name,
                    icon: icon_depart,
                    subDepartments: []
                };
            }
            if (sub_department_id) {
                acc[department_id].subDepartments.push({
                    id: sub_department_id,
                    name: sub_department_name
                });
            }
            return acc;
        }, {});

        const departmentList = Object.values(departments);

        // Decima Query -> vai buscar os sub-departamentos para o nav superior
        const query10 = 'SELECT * FROM sub_departments ORDER BY RAND() LIMIT 9';
        const results10 = await executeQuery(query10);

        // Cart Query -> Vai buscar os itens do carrinho do cliente
        if (req.session.user) {
            const userId = req.session.user.id;
    
            const cartQuery = 'SELECT c.product_id, c.quantity, p.product_name, p.price, p.main_img, p.min_order FROM carts c JOIN products p ON c.product_id = p.id WHERE c.company_id = ?';
            const cartItems = await executeQuery(cartQuery, [userId]);
    
            res.render('index', { isAuthenticated:true, results1, results2, totalProducts: results3[0].total_products, productsGroup1, productsGroup2, productsGroup3, results5, results6, results7, productBig, departments: departmentList, results10, cartItems });
        } else {
            res.render('index', { isAuthenticated:false, results1, results2, totalProducts: results3[0].total_products, productsGroup1, productsGroup2, productsGroup3, results5, results6, results7, productBig, departments: departmentList, results10 });
        }
        
    } catch (error) {
        console.error(error);
        res.status(500).send('Erro ao processar as queries.');
    }

});

function executeQuery(query) {
    return new Promise((resolve, reject) => {
        connection.query(query, (error, results, fields) => {
            if (error) {
                reject(error);
            } else {
                resolve(results);
            }
        });
    });
}

app.get('/search', async (req, res) => {
    const searchTerm = req.query.term;

    const query = 'SELECT * FROM products WHERE product_name LIKE ? OR product_reference LIKE ?';
    const termLike = `%${searchTerm}%`;
    const results = await executeQuery(query, [termLike, termLike]);

    res.json({ success: true, products: results });
});


//************ page-category routes *********
app.get('/page-category/:id', async (req, res) => {
    try {

        // Id do produto selecionado
        const departmentId = req.params.id;
        const results0 = departmentId;

        // Primeira Query -> Vai buscar todos os deartamentos para a navbar superior
        const query1 = 'SELECT * FROM departments';
        const results1 = await executeQuery(query1);
 
        // Segunda Query -> Vai buscar empresas para a navbar superior
        const query2 = 'SELECT company_name, id FROM companies ORDER BY RAND() LIMIT 9';
        const results2 = await executeQuery(query2);
 
        // Terceira Query -> Conta o numero de produtos para o menu lateral
        const query3 = 'SELECT COUNT(*) AS total_products FROM products';
        const results3 = await executeQuery(query3);

        // Quarta query -> Vai buscar produtos para os banners
        const query4 = 'SELECT p.* FROM products p JOIN sub_departments sd ON p.sub_department_id = sd.id JOIN departments d ON sd.department_id = d.id WHERE d.id = 2 ORDER BY RAND() LIMIT 5';
        const results4 = await executeQuery(query4);

        // Quinta query -> Vai buscar produtos para os banners
        const query5 = 'SELECT p.* FROM products p JOIN sub_departments sd ON p.sub_department_id = sd.id JOIN departments d ON sd.department_id = d.id WHERE d.id = 3 ORDER BY RAND() LIMIT 5';
        const results5 = await executeQuery(query5);

        // Sexta query -> Vai buscar produtos para os banners
        const query6 = 'SELECT p.* FROM products p JOIN sub_departments sd ON p.sub_department_id = sd.id JOIN departments d ON sd.department_id = d.id WHERE d.id = 6 ORDER BY RAND() LIMIT 5';
        const results6 = await executeQuery(query6);

        // Setima Query -> Vai buscar os sub-departamentos para a secção de produtos e respetivas quantidades
        const query7 = 'SELECT sd.id AS sub_departamento_id, sd.name_sub_depart AS sub_departamento_nome, COUNT(p.id) AS total_produtos FROM sub_departments sd LEFT JOIN products p ON sd.id = p.sub_department_id JOIN departments d ON sd.department_id = d.id WHERE d.id = ? GROUP BY sd.id, sd.name_sub_depart';
        const results7 = await executeQuery(query7, [departmentId]);

        // Oitava Query -> Vai buscar as empresas para a secção de brands e respetivas quantidades
        const query8 = 'SELECT c.company_name, COUNT(p.id) AS total_produtos FROM products p JOIN sub_departments sd ON p.sub_department_id = sd.id JOIN departments d ON sd.department_id = d.id JOIN companies c ON p.company_id = c.id WHERE d.id = ? GROUP BY c.company_name';
        const results8 = await executeQuery(query8, [departmentId]);

        // Nona Query -> Conta o numero de produtos que estão neste intervalo de preço
        const query9 = 'SELECT COUNT(p.id) AS total_produtos FROM products p JOIN sub_departments sd ON p.sub_department_id = sd.id JOIN departments d ON sd.department_id = d.id WHERE d.id = ? AND p.price BETWEEN 0 AND 49';
        const results9 = await executeQuery(query9, [departmentId]);

        // Decima Query -> Conta o numero de produtos que estão neste intervalo de preço
        const query10 = 'SELECT COUNT(p.id) AS total_produtos FROM products p JOIN sub_departments sd ON p.sub_department_id = sd.id JOIN departments d ON sd.department_id = d.id WHERE d.id = ? AND p.price BETWEEN 50 AND 99';
        const results10 = await executeQuery(query10, [departmentId]);

        // Decima Primeira Query -> Conta o numero de produtos que estão neste intervalo de preço
        const query11 = 'SELECT COUNT(p.id) AS total_produtos FROM products p JOIN sub_departments sd ON p.sub_department_id = sd.id JOIN departments d ON sd.department_id = d.id WHERE d.id = ? AND p.price BETWEEN 100 AND 149';
        const results11 = await executeQuery(query11, [departmentId]);

        // Decima Segunda Query -> Conta o numero de produtos que estão neste intervalo de preço
        const query12 = 'SELECT COUNT(p.id) AS total_produtos FROM products p JOIN sub_departments sd ON p.sub_department_id = sd.id JOIN departments d ON sd.department_id = d.id WHERE d.id = ? AND p.price >= 150';
        const results12 = await executeQuery(query12, [departmentId]);

        // Decima Terceira Query -> Vai buscar os produtos que pertencem aquele departamento 12 de cada vez
        const query13 = 'SELECT p.*, c.company_name AS company_name FROM products p JOIN companies c ON p.company_id = c.id JOIN sub_departments sd ON p.sub_department_id = sd.id JOIN departments d ON sd.department_id = d.id WHERE d.id = ? LIMIT 12';
        const products = await executeQuery(query13, [departmentId]);

        // Decima Quarta Query -> Conta o numero de produtos existentes que pertencem aquele departamento
        const countQuery = 'SELECT d.id AS department_id, COUNT(*) AS total FROM products p JOIN sub_departments sd ON p.sub_department_id = sd.id JOIN departments d ON sd.department_id = d.id WHERE d.id = ?';
        const [{ department_id, total }] = await executeQuery(countQuery, [departmentId]);

        // Formatar os preços com duas casas decimais
        products.forEach(product => {
            product.formatted_price = product.price.toFixed(2);
            if (product.is_promotion) {
                product.formatted_promotion_price = product.promotion_price.toFixed(2);
            }
        });

        // Decima Quinta Query ->
        const query15 = 'SELECT name_depart AS name_depart, description_depart AS description_depart FROM departments WHERE id = ?';
        const results15 = await executeQuery(query15, [departmentId]);
        const departmentDetails = results15[0]

        // Decima Sexta query -> vai buscar os departamentos e sub-departamentos para o menu lateral
        const query16 = 'SELECT d.id AS department_id, d.name_depart AS department_name, d.icon_depart AS icon_depart, sd.id AS sub_department_id, sd.name_sub_depart AS sub_department_name FROM departments d LEFT JOIN sub_departments sd ON d.id = sd.department_id';
        const results16 = await executeQuery(query16);

        // Agrupar os resultados por departamento
        const departments = results16.reduce((acc, row) => {
            const { department_id, department_name, icon_depart, sub_department_id, sub_department_name } = row;
            if (!acc[department_id]) {
                acc[department_id] = {
                    id: department_id,
                    name: department_name,
                    icon: icon_depart,
                    subDepartments: []
                };
            }
            if (sub_department_id) {
                acc[department_id].subDepartments.push({
                    id: sub_department_id,
                    name: sub_department_name
                });
            }
            return acc;
        }, {});

        const departmentList = Object.values(departments);

        // Decima Setima Query -> vai buscar os sub-departamentos para o nav superior
        const query17 = 'SELECT * FROM sub_departments ORDER BY RAND() LIMIT 9';
        const results17 = await executeQuery(query17);

        // Cart Query -> Vai buscar os itens do carrinho do cliente
        if (req.session.user) {
            const userId = req.session.user.id;
            
            const cartQuery = 'SELECT c.product_id, c.quantity, p.product_name, p.price, p.main_img, p.min_order FROM carts c JOIN products p ON c.product_id = p.id WHERE c.company_id = ?';
            const cartItems = await executeQuery(cartQuery, [userId]);
            
            res.render('page-category', { isAuthenticated:true, results0, results1, results2, totalProducts: results3[0].total_products, results4, results5, results6, results7, results8, results9, results10, results11, results12, products, totalProducts2: total, DepartmentId: department_id, departmentDetails, departments: departmentList, results17, cartItems });
        } else {
            res.render('page-category', { isAuthenticated:false, results0, results1, results2, totalProducts: results3[0].total_products, results4, results5, results6, results7, results8, results9, results10, results11, results12, products, totalProducts2: total, DepartmentId: department_id, departmentDetails, departments: departmentList, results17 });
        }
        
    } catch (error) {
        console.error(error);
        res.status(500).send('Erro ao processar as queries.');
    }
});

app.get('/load-more-products/:department_id', async (req, res) => {
    try {

        const DepartmentId = req.params.department_id;

        const offset = parseInt(req.query.offset) || 0; // Pegar o offset da query string

        // Query para contar o numero de produtos que pertencem aquele departamento
        const countQuery = 'SELECT COUNT(*) AS total FROM products p JOIN sub_departments sd ON p.sub_department_id = sd.id JOIN departments d ON sd.department_id = d.id WHERE d.id = ?';
        const [{ total }] = await executeQuery(countQuery, [DepartmentId]);

        // Query para carregar mais produtos com base no offset
        const query = 'SELECT p.*, c.company_name FROM products p JOIN companies c ON p.company_id = c.id JOIN sub_departments sd ON p.sub_department_id = sd.id JOIN departments d ON sd.department_id = d.id WHERE d.id = ? LIMIT ?, 12';
        const products = await executeQuery(query, [DepartmentId, offset]);

        // Formatar os preços com duas casas decimais
        products.forEach(product => {
            product.formatted_price = product.price.toFixed(2);
            if (product.is_promotion) {
                product.formatted_promotion_price = product.promotion_price.toFixed(2);
            }
        });

        res.json({ products, total });

    } catch (error) {
        console.error(error);
        res.status(500).send('Erro ao carregar mais produtos.');
    }
});

// rota dos filtros
app.post('/filter-products/:departmentId', async (req, res) => {
    const { subDepartments, brands, prices, order } = req.body;
    const { departmentId } = req.params;

    let query = `
    SELECT p.*, c.company_name
    FROM products p
    JOIN companies c ON p.company_id = c.id
    JOIN sub_departments sd ON p.sub_department_id = sd.id
    WHERE sd.department_id = ?
`;
    let queryParams = [departmentId];

    if (subDepartments && subDepartments.length > 0) {
        query += ' AND p.sub_department_id IN (?)';
        queryParams.push(subDepartments);
    }

    if (brands && brands.length > 0) {
        query += ' AND c.company_name IN (?)';
        queryParams.push(brands);
    }

    if (prices && prices.length > 0) {
        const priceConditions = prices.map(price => {
            const [min, max] = price.split('-');
            if (max === 'max') {
                return 'p.price >= ?';
            }
            return 'p.price BETWEEN ? AND ?';
        }).join(' OR ');

        query += ` AND (${priceConditions})`;
        prices.forEach(price => {
            const [min, max] = price.split('-');
            queryParams.push(min);
            if (max !== 'max') {
                queryParams.push(max);
            }
        });
    }

    if (order === 'high-low') {
        query += ' ORDER BY p.price DESC';
    } else if (order === 'low-high') {
        query += ' ORDER BY p.price ASC';
    } else {
        query += ' ORDER BY p.id';
    }


    try {
        const products = await executeQuery(query, queryParams);
        // Formatando os preços
        products.forEach(product => {
            product.formatted_price = product.price.toFixed(2);
            if (product.is_promotion) {
                product.formatted_promotion_price = product.promotion_price.toFixed(2);
            }
        });

        if (req.session.user) {
            res.json({ products, isAuthenticated:true });
        } else{
            res.json({ products, isAuthenticated:false });
        }
        
    } catch (error) {
        console.error('Erro ao carregar produtos filtrados:', error);
        res.status(500).send('Erro ao carregar produtos filtrados');
    }
});


function executeQuery(query, params = []) {
    return new Promise((resolve, reject) => {
        connection.query(query, params, (error, results, fields) => {
            if (error) {
                reject(error);
            } else {
                resolve(results);
            }
        });
    });
}

//************ page-sub_category routes *********
app.get('/page-sub_category/:id', async (req, res) => {
    try {

        // Id do produto selecionado
        const subDepartmentId = req.params.id;
        const results0 = subDepartmentId;

        // Primeira Query -> Vai buscar todos os deartamentos para a navbar superior
        const query1 = 'SELECT * FROM departments';
        const results1 = await executeQuery(query1);

        // Segunda Query -> Vai buscar empresas para a navbar superior
        const query2 = 'SELECT company_name, id FROM companies ORDER BY RAND() LIMIT 9';
        const results2 = await executeQuery(query2);

        // Terceira Query -> Conta o numero de produtos para o menu lateral
        const query3 = 'SELECT COUNT(*) AS total_products FROM products';
        const results3 = await executeQuery(query3);

        // Quarta query -> Vai buscar produtos para os banners
        const query4 = 'SELECT p.* FROM products p JOIN sub_departments sd ON p.sub_department_id = sd.id JOIN departments d ON sd.department_id = d.id WHERE d.id = 2 ORDER BY RAND() LIMIT 5';
        const results4 = await executeQuery(query4);

        // Quinta query -> Vai buscar produtos para os banners
        const query5 = 'SELECT p.* FROM products p JOIN sub_departments sd ON p.sub_department_id = sd.id JOIN departments d ON sd.department_id = d.id WHERE d.id = 3 ORDER BY RAND() LIMIT 5';
        const results5 = await executeQuery(query5);

        // Sexta query -> Vai buscar produtos para os banners
        const query6 = 'SELECT p.* FROM products p JOIN sub_departments sd ON p.sub_department_id = sd.id JOIN departments d ON sd.department_id = d.id WHERE d.id = 6 ORDER BY RAND() LIMIT 5';
        const results6 = await executeQuery(query6);

       // Oitava Query -> Vai buscar as empresas para a secção de brands e respetivas quantidades
       const query8 = 'SELECT c.company_name, COUNT(p.id) AS total_produtos FROM products p JOIN companies c ON p.company_id = c.id WHERE p.sub_department_id = ? GROUP BY c.company_name';
       const results8 = await executeQuery(query8, [subDepartmentId]);

       // Nona Query -> Conta o numero de produtos que estão neste intervalo de preço
       const query9 = 'SELECT COUNT(p.id) AS total_produtos FROM products p JOIN sub_departments sd ON p.sub_department_id = sd.id WHERE p.sub_department_id = ? AND p.price BETWEEN 0 AND 49';
       const results9 = await executeQuery(query9, [subDepartmentId]);

       // Decima Query -> Conta o numero de produtos que estão neste intervalo de preço
       const query10 = 'SELECT COUNT(p.id) AS total_produtos FROM products p JOIN sub_departments sd ON p.sub_department_id = sd.id WHERE p.sub_department_id = ? AND p.price BETWEEN 50 AND 99';
       const results10 = await executeQuery(query10, [subDepartmentId]);

       // Decima Primeira Query -> Conta o numero de produtos que estão neste intervalo de preço
       const query11 = 'SELECT COUNT(p.id) AS total_produtos FROM products p JOIN sub_departments sd ON p.sub_department_id = sd.id WHERE p.sub_department_id = ? AND p.price BETWEEN 100 AND 149';
       const results11 = await executeQuery(query11, [subDepartmentId]);

       // Decima Segunda Query -> Conta o numero de produtos que estão neste intervalo de preço
       const query12 = 'SELECT COUNT(p.id) AS total_produtos FROM products p JOIN sub_departments sd ON p.sub_department_id = sd.id WHERE p.sub_department_id = ? AND p.price >= 150';
       const results12 = await executeQuery(query12, [subDepartmentId]);

       // Decima Terceira Query -> Vai buscar os produtos que pertencem aquele departamento 12 de cada vez
       const query13 = 'SELECT p.*, c.company_name AS company_name FROM products p JOIN companies c ON p.company_id = c.id JOIN sub_departments sd ON p.sub_department_id = sd.id WHERE p.sub_department_id = ? LIMIT 12';
       const products = await executeQuery(query13, [subDepartmentId]);

       // Formatar os preços com duas casas decimais
       products.forEach(product => {
           product.formatted_price = product.price.toFixed(2);
           if (product.is_promotion) {
               product.formatted_promotion_price = product.promotion_price.toFixed(2);
           }
       });

       // Decima Quarta Query -> Conta o numero de produtos existentes que pertencem aquele sub-departamento
       const countQuery = 'SELECT sd.id AS sub_department_id, COUNT(p.id) AS total FROM products p JOIN sub_departments sd ON p.sub_department_id = sd.id WHERE p.sub_department_id = ?';
       const [{ sub_department_id, total }] = await executeQuery(countQuery, [subDepartmentId]);

       // Decima Quinta Query -> Vai buscar o nome do departamento e do sub-departamento correspondente
       const query15 = 'SELECT sd.name_sub_depart AS name_sub_depart, sd.sub_depart_description AS sub_depart_description, d.name_depart AS name_depart FROM sub_departments sd JOIN departments d ON sd.department_id = d.id WHERE sd.id = ?';
       const results15 = await executeQuery(query15, [subDepartmentId]);
       const departmentDetails = results15[0]

       // Decima Sexta query -> vai buscar os departamentos e sub-departamentos para o menu lateral
       const query16 = 'SELECT d.id AS department_id, d.name_depart AS department_name, d.icon_depart AS icon_depart, sd.id AS sub_department_id, sd.name_sub_depart AS sub_department_name FROM departments d LEFT JOIN sub_departments sd ON d.id = sd.department_id';
       const results16 = await executeQuery(query16);

       // Agrupar os resultados por departamento
       const departments = results16.reduce((acc, row) => {
           const { department_id, department_name, icon_depart, sub_department_id, sub_department_name } = row;
           if (!acc[department_id]) {
               acc[department_id] = {
                   id: department_id,
                   name: department_name,
                   icon: icon_depart,
                   subDepartments: []
               };
           }
           if (sub_department_id) {
               acc[department_id].subDepartments.push({
                   id: sub_department_id,
                   name: sub_department_name
               });
           }
           return acc;
       }, {});

       const departmentList = Object.values(departments);

       // Decima Setima Query -> vai buscar os sub-departamentos para o nav superior
       const query17 = 'SELECT * FROM sub_departments ORDER BY RAND() LIMIT 9';
       const results17 = await executeQuery(query17);

       // Cart Query -> Vai buscar os itens do carrinho do cliente
       if (req.session.user) {
            const userId = req.session.user.id;
        
            const cartQuery = 'SELECT c.product_id, c.quantity, p.product_name, p.price, p.main_img, p.min_order FROM carts c JOIN products p ON c.product_id = p.id WHERE c.company_id = ?';
            const cartItems = await executeQuery(cartQuery, [userId]);
        
            res.render('page-sub_category', { isAuthenticated:true, results0, results1, results2, totalProducts: results3[0].total_products, results4, results5, results6, results8, results9, results10, results11, results12, products, totalProducts2: total, subDepartmentId: sub_department_id, departmentDetails, departments: departmentList, results17, cartItems });
        } else {
            res.render('page-sub_category', { isAuthenticated:false, results0, results1, results2, totalProducts: results3[0].total_products, results4, results5, results6, results8, results9, results10, results11, results12, products, totalProducts2: total, subDepartmentId: sub_department_id, departmentDetails, departments: departmentList, results17 });
        }
       
    } catch (error) {
        console.error(error);
        res.status(500).send('Erro ao processar as queries.');
    }
});


app.get('/load-more-products-sub-departments/:sub_department_id', async (req, res) => {
    try {

        const subDepartmentId = req.params.sub_department_id;

        const offset = parseInt(req.query.offset) || 0; // Pegar o offset da query string

        // Query para contar o numero de produtos que pertencem aquele sub- departamento
        const countQuery = 'SELECT COUNT(*) AS total FROM products p JOIN sub_departments sd ON p.sub_department_id = sd.id WHERE p.sub_department_id = ?';
        const [{ total }] = await executeQuery(countQuery, [subDepartmentId]);

        // Query para carregar mais produtos com base no offset
        const query = 'SELECT p.*, c.company_name FROM products p JOIN companies c ON p.company_id = c.id JOIN sub_departments sd ON p.sub_department_id = sd.id JOIN departments d ON sd.department_id = d.id WHERE sd.id = ? LIMIT ?, 12';
        const products = await executeQuery(query, [subDepartmentId, offset]);

        // Formatar os preços com duas casas decimais
        products.forEach(product => {
            product.formatted_price = product.price.toFixed(2);
            if (product.is_promotion) {
                product.formatted_promotion_price = product.promotion_price.toFixed(2);
            }
        });

        res.json({ products, total });

    } catch (error) {
        console.error(error);
        res.status(500).send('Erro ao carregar mais produtos.');
    }
});

app.post('/filter-products-sub_category/:subDepartmentId', async (req, res) => {
    const { brands, prices, order } = req.body;
    const { subDepartmentId } = req.params;

    let query = `
    SELECT p.*, c.company_name
    FROM products p
    JOIN companies c ON p.company_id = c.id
    WHERE p.sub_department_id = ?
    `;

    let queryParams = [subDepartmentId];

    if (brands && brands.length > 0) {
        query += ' AND c.company_name IN (?)';
        queryParams.push(brands);
    }

    if (prices && prices.length > 0) {
        const priceConditions = prices.map(price => {
            const [min, max] = price.split('-');
            if (max === 'max') {
                return 'p.price >= ?';
            }
            return 'p.price BETWEEN ? AND ?';
        }).join(' OR ');

        query += ` AND (${priceConditions})`;
        prices.forEach(price => {
            const [min, max] = price.split('-');
            queryParams.push(min);
            if (max !== 'max') {
                queryParams.push(max);
            }
        });
    }

    if (order === 'high-low') {
        query += ' ORDER BY p.price DESC';
    } else if (order === 'low-high') {
        query += ' ORDER BY p.price ASC';
    } else {
        query += ' ORDER BY p.id';
    }

    try {
        const products = await executeQuery(query, queryParams);
        // Formatando os preços
        products.forEach(product => {
            product.formatted_price = product.price.toFixed(2);
            if (product.is_promotion) {
                product.formatted_promotion_price = product.promotion_price.toFixed(2);
            }
        });
        
        if (req.session.user) {
            res.json({ products, isAuthenticated:true });
        } else{
            res.json({ products, isAuthenticated:false });
        }
    } catch (error) {
        console.error('Erro ao carregar produtos filtrados:', error);
        res.status(500).send('Erro ao carregar produtos filtrados');
    }
});


function executeQuery(query, params = []) {
    return new Promise((resolve, reject) => {
        connection.query(query, params, (error, results, fields) => {
            if (error) {
                reject(error);
            } else {
                resolve(results);
            }
        });
    });
}



//************ page-single routes *********
app.get('/page-single/:id', async (req, res) => {
    try {

        // Id do produto selecionado
        const productId = req.params.id;

        // Primeira Query -> Vai buscar todos os deartamentos para a navbar superior
        const query1 = 'SELECT * FROM departments';
        const results1 = await executeQuery(query1);
 
        // Segunda Query -> Vai buscar empresas para a navbar superior
        const query2 = 'SELECT company_name, id FROM companies ORDER BY RAND() LIMIT 9';
        const results2 = await executeQuery(query2);
 
        // Terceira Query -> Conta o numero de produtos para o menu lateral
        const query3 = 'SELECT COUNT(*) AS total_products FROM products';
        const results3 = await executeQuery(query3);

        // Quarta query -> Vai buscar produtos para os banners
        const query4 = 'SELECT p.* FROM products p JOIN sub_departments sd ON p.sub_department_id = sd.id JOIN departments d ON sd.department_id = d.id WHERE d.id = 2 ORDER BY RAND() LIMIT 5';
        const results4 = await executeQuery(query4);

        // Quinta query -> Vai buscar produtos para os banners
        const query5 = 'SELECT p.* FROM products p JOIN sub_departments sd ON p.sub_department_id = sd.id JOIN departments d ON sd.department_id = d.id WHERE d.id = 3 ORDER BY RAND() LIMIT 5';
        const results5 = await executeQuery(query5);

        // Sexta query -> Vai buscar produtos para os banners
        const query6 = 'SELECT p.* FROM products p JOIN sub_departments sd ON p.sub_department_id = sd.id JOIN departments d ON sd.department_id = d.id WHERE d.id = 6 ORDER BY RAND() LIMIT 5';
        const results6 = await executeQuery(query6);

        const query7 = 'SELECT p.*, c.company_name, r.rating, r.rating_coment, r.rating_author, r.data_review, sd.name_sub_depart AS name_sub_depart, d.name_depart AS name_depart FROM products p JOIN companies c ON p.company_id = c.id JOIN sub_departments sd ON p.sub_department_id = sd.id JOIN departments d ON sd.department_id = d.id LEFT JOIN rating_product r ON p.id = r.product_id WHERE p.id = ?';
        const results7 = await executeQuery(query7, [productId]);
        const productDetails = results7[0];
    
        // Formatar os preços com duas casas decimais
        productDetails.formatted_price = productDetails.price.toFixed(2);
        if (productDetails.is_promotion) {
            productDetails.formatted_promotion_price = productDetails.promotion_price.toFixed(2);
        }
        
  

        const query8 = 'SELECT p.id, p.main_img, p.product_name, p.stock, p.is_promotion, p.promotion_price, p.discount_percentage, p.price, p.price_symbol, p.min_order, p.product_description, p.sub_department_id, c.id AS company_id, c.company_name, AVG(r.rating) AS average_rating, COUNT(r.rating) AS total_ratings FROM products p JOIN companies c ON p.company_id = c.id JOIN sub_departments sd ON p.sub_department_id = sd.id JOIN departments d ON sd.department_id = d.id LEFT JOIN rating_product r ON p.id = r.product_id WHERE d.id = (SELECT department_id FROM sub_departments WHERE id = (SELECT sub_department_id FROM products WHERE id = ?)) AND p.id != ? GROUP BY p.id, p.main_img, p.product_name, p.stock, p.is_promotion, p.promotion_price, p.discount_percentage, p.price, p.price_symbol, p.min_order, p.product_description, p.sub_department_id, c.company_name LIMIT 12';
        const results8 = await executeQuery(query8, [productId, productId]);

        results8.forEach(product => {
            product.formatted_price = product.price.toFixed(2);
            if (product.is_promotion) {
                product.formatted_promotion_price = product.promotion_price.toFixed(2);
            }
        });

        // Nona query -> vai buscar os departamentos e sub-departamentos para o menu lateral
        const query9 = 'SELECT d.id AS department_id, d.name_depart AS department_name, d.icon_depart AS icon_depart, sd.id AS sub_department_id, sd.name_sub_depart AS sub_department_name FROM departments d LEFT JOIN sub_departments sd ON d.id = sd.department_id';
        const results9 = await executeQuery(query9);

        // Agrupar os resultados por departamento
        const departments = results9.reduce((acc, row) => {
            const { department_id, department_name, icon_depart, sub_department_id, sub_department_name } = row;
            if (!acc[department_id]) {
                acc[department_id] = {
                    id: department_id,
                    name: department_name,
                    icon: icon_depart,
                    subDepartments: []
                };
            }
            if (sub_department_id) {
                acc[department_id].subDepartments.push({
                    id: sub_department_id,
                    name: sub_department_name
                });
            }
            return acc;
        }, {});

        const departmentList = Object.values(departments);

        // Decima Query -> vai buscar os sub-departamentos para o nav superior
        const query10 = 'SELECT * FROM sub_departments ORDER BY RAND() LIMIT 9';
        const results10 = await executeQuery(query10);

        const query11 = 'SELECT d.id AS department_id FROM products p INNER JOIN sub_departments sd ON p.sub_department_id = sd.id INNER JOIN departments d ON sd.department_id = d.id WHERE p.id = ?';
        const results11 = await executeQuery(query11, [productId])
        const departId = results11[0].department_id;

        // Cart Query -> Vai buscar os itens do carrinho do cliente
        if (req.session.user) {
            const userId = req.session.user.id;
            
            const cartQuery = 'SELECT c.product_id, c.quantity, p.product_name, p.price, p.main_img, p.min_order FROM carts c JOIN products p ON c.product_id = p.id WHERE c.company_id = ?';
            const cartItems = await executeQuery(cartQuery, [userId]);
            
            res.render('page-single', { isAuthenticated:true, results1, results2, totalProducts: results3[0].total_products, results4, results5, results6, productDetails, results8, departments: departmentList, results10, departId, cartItems });
        } else {
            res.render('page-single', { isAuthenticated:false, results1, results2, totalProducts: results3[0].total_products, results4, results5, results6, productDetails, results8, departments: departmentList, results10, departId });
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Erro ao processar as queries.');
    }
})



function executeQuery(query, params = []) {
    return new Promise((resolve, reject) => {
        connection.query(query, params, (error, results, fields) => {
            if (error) {
                reject(error);
            } else {
                resolve(results);
            }
        });
    });
}

//************ page-company routes ***********
app.get('/page-company/:id', async (req, res) => {
    try {

        // Id do produto selecionado
        const companyId = req.params.id;

        // Primeira Query -> Vai buscar todos os deartamentos para a navbar superior
        const query1 = 'SELECT * FROM departments';
        const results1 = await executeQuery(query1);
 
        // Segunda Query -> Vai buscar empresas para a navbar superior
        const query2 = 'SELECT company_name, id FROM companies ORDER BY RAND() LIMIT 9';
        const results2 = await executeQuery(query2);
 
        // Terceira Query -> Conta o numero de produtos para o menu lateral
        const query3 = 'SELECT COUNT(*) AS total_products FROM products';
        const results3 = await executeQuery(query3);

        // Quarta query -> Vai buscar produtos para os banners
        const query4 = 'SELECT p.* FROM products p JOIN sub_departments sd ON p.sub_department_id = sd.id JOIN departments d ON sd.department_id = d.id WHERE d.id = 2 ORDER BY RAND() LIMIT 5';
        const results4 = await executeQuery(query4);

        // Quinta query -> Vai buscar produtos para os banners
        const query5 = 'SELECT p.* FROM products p JOIN sub_departments sd ON p.sub_department_id = sd.id JOIN departments d ON sd.department_id = d.id WHERE d.id = 3 ORDER BY RAND() LIMIT 5';
        const results5 = await executeQuery(query5);

        // Sexta query -> Vai buscar produtos para os banners
        const query6 = 'SELECT p.* FROM products p JOIN sub_departments sd ON p.sub_department_id = sd.id JOIN departments d ON sd.department_id = d.id WHERE d.id = 6 ORDER BY RAND() LIMIT 5';
        const results6 = await executeQuery(query6);

        const query7 = 'SELECT company_name FROM companies WHERE id = ?';
        const results7 = await executeQuery(query7, [companyId]);
        const companyName = results7[0].company_name;

        const queryDetails = 'SELECT * FROM companies WHERE id = ?';
        const resultsDetails = await executeQuery(queryDetails, [companyId]);

        const query = 'SELECT DISTINCT d.name_depart FROM products p INNER JOIN sub_departments sd ON p.sub_department_id = sd.id INNER JOIN departments d ON sd.department_id = d.id WHERE p.company_id = ?';
        const products = await executeQuery(query, [companyId]);
    
        const queryDepartId = 'SELECT d.id AS department_id FROM products p INNER JOIN sub_departments sd ON p.sub_department_id = sd.id INNER JOIN departments d ON sd.department_id = d.id WHERE p.company_id = ? ORDER BY p.id LIMIT 1';
        const resultsDepartId = await executeQuery(queryDepartId, [companyId]);
        const departId = resultsDepartId[0];
        

        const query8 = 'SELECT p.*, c.company_name FROM products p JOIN companies c ON p.company_id = c.id WHERE p.company_id = ?';
        const results8 = await executeQuery(query8, [companyId]);

        results8.forEach(product => {
            product.formatted_price = product.price.toFixed(2);
            if (product.is_promotion) {
                product.formatted_promotion_price = product.promotion_price.toFixed(2);
            }
        });


        // Nona query -> vai buscar os departamentos e sub-departamentos para o menu lateral
        const query9 = 'SELECT d.id AS department_id, d.name_depart AS department_name, d.icon_depart AS icon_depart, sd.id AS sub_department_id, sd.name_sub_depart AS sub_department_name FROM departments d LEFT JOIN sub_departments sd ON d.id = sd.department_id';
        const results9 = await executeQuery(query9);

        // Agrupar os resultados por departamento
        const departments = results9.reduce((acc, row) => {
            const { department_id, department_name, icon_depart, sub_department_id, sub_department_name } = row;
            if (!acc[department_id]) {
                acc[department_id] = {
                    id: department_id,
                    name: department_name,
                    icon: icon_depart,
                    subDepartments: []
                };
            }
            if (sub_department_id) {
                acc[department_id].subDepartments.push({
                    id: sub_department_id,
                    name: sub_department_name
                });
            }
            return acc;
        }, {});

        const departmentList = Object.values(departments);

        // Decima Query -> vai buscar os sub-departamentos para o nav superior
        const query10 = 'SELECT * FROM sub_departments ORDER BY RAND() LIMIT 9';
        const results10 = await executeQuery(query10);

        // Cart Query -> Vai buscar os itens do carrinho do cliente
        if (req.session.user) {
            const userId = req.session.user.id;
            
            const cartQuery = 'SELECT c.product_id, c.quantity, p.product_name, p.price, p.main_img, p.min_order FROM carts c JOIN products p ON c.product_id = p.id WHERE c.company_id = ?';
            const cartItems = await executeQuery(cartQuery, [userId]);
            
            res.render('page-company', { isAuthenticated:true, results1, results2, totalProducts: results3[0].total_products, results4, results5, results6, companyName, results8, departments: departmentList, results10, companyDetails: resultsDetails[0], products, departId, cartItems });
        } else {
            res.render('page-company', { isAuthenticated:false, results1, results2, totalProducts: results3[0].total_products, results4, results5, results6, companyName, results8, departments: departmentList, results10, companyDetails: resultsDetails[0], products, departId });
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Erro ao processar as queries.');
    }
})

app.post('/send-Message', async (req, res) => {
    const { company_name, title, msg_content } = req.body;
    const senderId = req.session.user.id;

    console.log(`company_name: ${company_name}`);
    console.log(`title: ${title}`);
    console.log(`msg_contente: ${msg_content}`);

    try {

        // Insere a mensagem na tabela messages
        const sendMessageQuery = 'INSERT INTO messages (sender_id, recipient_id, title, content, message_date) VALUES (?, ?, ?, ?, NOW())';
        await executeQuery(sendMessageQuery, [senderId, company_name, title, msg_content]);

        res.status(200).json({ success: true, message: 'Message sent successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Failed to send message' });
    }
});


//************ cart routes *********
app.get('/cart', checkSession, async (req, res) => {
    try {

        const companyId = req.session.user.id;

        // Primeira Query -> Vai buscar todos os deartamentos para a navbar superior
        const query1 = 'SELECT * FROM departments';
        const results1 = await executeQuery(query1);

        // Decima Setima Query -> vai buscar os sub-departamentos para o nav superior
        const query2 = 'SELECT * FROM sub_departments ORDER BY RAND() LIMIT 9';
        const results2 = await executeQuery(query2);

        // Segunda Query -> Vai buscar empresas para a navbar superior
        const query3 = 'SELECT company_name, id FROM companies ORDER BY RAND() LIMIT 9';
        const results3 = await executeQuery(query3);

        // Terceira Query -> Conta o numero de produtos para o menu lateral
        const query4 = 'SELECT COUNT(*) AS total_products FROM products';
        const results4 = await executeQuery(query4);

        // Quinta query -> vai buscar os departamentos e sub-departamentos para o menu lateral
        const query5 = 'SELECT d.id AS department_id, d.name_depart AS department_name, d.icon_depart AS icon_depart, sd.id AS sub_department_id, sd.name_sub_depart AS sub_department_name FROM departments d LEFT JOIN sub_departments sd ON d.id = sd.department_id';
        const results5 = await executeQuery(query5);

        // Agrupar os resultados por departamento
        const departments = results5.reduce((acc, row) => {
            const { department_id, department_name, icon_depart, sub_department_id, sub_department_name } = row;
            if (!acc[department_id]) {
                acc[department_id] = {
                    id: department_id,
                    name: department_name,
                    icon: icon_depart,
                    subDepartments: []
                };
            }
            if (sub_department_id) {
                acc[department_id].subDepartments.push({
                    id: sub_department_id,
                    name: sub_department_name
                });
            }
            return acc;
        }, {});

        const departmentList = Object.values(departments);

        // Sexta query -> vai buscar os produtos que o cliente adicionou ao carrinho
        const query6 = 'SELECT p.id AS product_id, p.product_name AS product_name, p.price, p.main_img, p.min_order, c.quantity, co.company_name AS company_name FROM carts c JOIN products p ON c.product_id = p.id JOIN companies co ON p.company_id = co.id WHERE c.company_id = ?';
        const results6 = await executeQuery(query6, [companyId]);

        // Setima query -> vai buscar as opções de entrega
        const query7 = 'SELECT * FROM delivery_services';
        const deliveryServices = await executeQuery(query7);

        // Mostrar os produtos no icon do cart
        const cartQuery = 'SELECT COUNT(*) AS totalProductsCart, SUM((p.price * p.min_order) * c.quantity) AS subtotalCart FROM carts c JOIN products p ON c.product_id = p.id WHERE c.company_id = ?';
        const cartItems = await executeQuery(cartQuery, [companyId]);
        const { totalProductsCart, subtotalCart } = cartItems[0];

        res.render('cart', { results1, results2, results3, totalProducts: results4[0].total_products, departments: departmentList, results6, deliveryServices, totalProductsCart, subtotalCart })
    } catch (error) {
        console.error(error);
        res.status(500).send('Erro ao processar as queries.');
    }
})

// Rota para adicionar itens ao carrinho
app.post('/add-to-cart', checkSession, async (req, res) => {
    const { productId, quantity } = req.body;
    const companyId = req.session.user.id;

    console.log(`company_id: ${companyId}`);
    console.log(`product_id: ${productId}`);
    console.log(`quantity: ${quantity}`);

    try {
        // Verifique se o item já está no carrinho
        const [cartItem] = await executeQuery(
            'SELECT * FROM carts WHERE company_id = ? AND product_id = ?',
            [companyId, productId]
        );

        if (cartItem) {
            // Atualize a quantidade se o item já estiver no carrinho
            await executeQuery(
                'UPDATE carts SET quantity = quantity + ? WHERE company_id = ? AND product_id = ?',
                [quantity, companyId, productId]
            );
            res.json({ success: true, message: 'Product successfully added to cart!' });
        } else {
            // Insira um novo item no carrinho
            await executeQuery(
                'INSERT INTO carts (company_id, product_id, quantity) VALUES (?, ?, ?)',
                [companyId, productId, quantity]
            );
            res.json({ success: true, message: 'Product successfully added to cart!' });
        }
    } catch (error) {
        console.error('Erro ao adicionar item ao carrinho:', error);
        res.json({ success: false, error: 'Erro ao adicionar item ao carrinho' });
    }
});

// Rota para atualizar automatcamente o preço da entrega
app.get('/get-delivery-price', async (req, res) => {
    const { speed, country } = req.query;
    const companyId = req.session.user.id;

    try {

        const query = 'SELECT companies.adress_country FROM carts JOIN products ON carts.product_id = products.id JOIN companies ON products.company_id = companies.id WHERE carts.company_id = ?';
        const companyCountries = await executeQuery(query, [companyId]);

        const countries = companyCountries.map(row => row.adress_country);

        const allCountriesEqual = countries.every(country => country === countries[0]);

        let deliveryType;

        if (allCountriesEqual) {
            // Se todos os países são iguais, comparar com o país selecionado pelo cliente
            if (countries[0] === country) {
                deliveryType = 'National';
            } else {
                deliveryType = 'International';
            }
        } else {
            // Se há pelo menos um país diferente, é entrega internacional
            deliveryType = 'International';
        }

        const deliveryQuery = 'SELECT delivery_price, delivery_speed, delivery_date_days FROM delivery_services WHERE delivery_speed = ? AND delivery_type = ?';
        const results = await executeQuery(deliveryQuery, [speed, deliveryType]);

        if (results.length > 0) {
            const price = results[0].delivery_price;
            const minDays = results[0].delivery_date_days;
            const earliestDate = new Date();
            earliestDate.setDate(earliestDate.getDate() + minDays);


            res.json({ success: true, price: price, speed: results[0].delivery_speed, deliveryType: deliveryType, earliestDate });
        } else {
            res.json({ success: false, error: 'Preço da entrega não encontrado' });
        }

    } catch (error) {
        console.error('Erro ao obter o preço da entrega:', error);
        res.json({ success: false, error: 'Erro ao obter o preço da entrega' });
    }
});

app.post('/update-cart-and-checkout', async (req, res) => {
    
    const companyId = req.session.user.id;
    const { quantities, productIds, delivery_type, delivery_speed, delivery_country, delivery_adress, delivery_date, cart_subtotal, cart_shipping_price, cart_total, product_names, product_prices, total_orders } = req.body;

    console.log(`Delivery type: ${delivery_type}`)

    // Função para converter "DD-MM-YYYY" para "YYYY-MM-DD"
    function convertDateFormat(dateStr) {
        const [day, month, year] = dateStr.split('-');
        return `${year}-${month}-${day}`;
    }

    const formattedDate = convertDateFormat(delivery_date);
    
    const delivery_DATE = new Date(formattedDate);
    console.log(`Delivery date: ${delivery_date}`);
    console.log(`Delivery DATE: ${delivery_DATE}`);

    try {
        // Atualizar quantidades de produtos no carrinho
        for (let i = 0; i < productIds.length; i++) {
            const productId = productIds[i];
            const quantity = parseInt(quantities[i], 10);

            console.log(`Updating product ${productId} to quantity ${quantity}`);
            const sqlUpdateQuantity = 'UPDATE carts SET quantity = ? WHERE company_id = ? AND product_id = ?';
            await executeQuery(sqlUpdateQuantity, [quantity, companyId, productId]);
        }

        // Atualizar tipo de entrega, velocidade e valores de subtotal, shipping e total
        const sqlUpdateDelivery = 'UPDATE carts SET delivery_type = ?, delivery_speed = ?, delivery_address_country = ?, delivery_address = ?, delivery_date = ?, cart_subtotal = ?, cart_shipping_price = ?, cart_total = ? WHERE company_id = ?';
        await executeQuery(sqlUpdateDelivery, [delivery_type, delivery_speed, delivery_country, delivery_adress, delivery_DATE, cart_subtotal, cart_shipping_price, cart_total, companyId]);

        // Redirecionar para a página de checkout
        let line_items = [];
        for (let i = 0; i < productIds.length; i++) {
            const total_quantity = total_orders[i];
            const priceInDollars = parseFloat(product_prices[i]);
            const priceInCents = Math.round(priceInDollars * 100);
            const product_name = product_names[i]

            line_items.push({
                price_data: {
                    currency: 'EUR',
                    product_data: {
                        name: product_name
                    },
                    unit_amount: priceInCents
                },
                quantity: total_quantity
            });
        }

        // Adicionar custo de shipping
        const shippingName = `Shipping ${delivery_type} ${delivery_speed}`;
        const shippingPriceInCents = Math.round(parseFloat(cart_shipping_price) * 100);
        line_items.push({
            price_data: {
                currency: 'EUR',
                product_data: {
                    name: shippingName
                },
                unit_amount: shippingPriceInCents
            },
            quantity: 1
        });

        // Criar a sessão do Stripe com todos os itens
        const session = await stripe.checkout.sessions.create({
            line_items: line_items,
            mode: 'payment',
            success_url: 'http://localhost:3000/complete?session_id={CHECKOUT_SESSION_ID}',
            cancel_url: 'http://localhost:3000/cart'
        });
    
        res.redirect(session.url);
        

    } catch (error) {
        console.error('Erro ao atualizar o carrinho:', error);
        res.status(500).send('Internal Server Error');
    }

});

app.get('/complete', async (req, res) => {
    const companyId = req.session.user.id;
    const paymentDate = new Date();

    try {
        const getCartDetailsQuery = 'SELECT product_id, quantity, delivery_date, cart_shipping_price, cart_total, delivery_address, delivery_address_country FROM carts WHERE company_id = ?';
        const cartDetails = await executeQuery(getCartDetailsQuery, [companyId]);

        if (cartDetails.length > 0) {
            const order_delivery_date = cartDetails[0].delivery_date;
            const delivery_price = cartDetails[0].cart_shipping_price;
            const order_price_total = cartDetails[0].cart_total;
            const order_delivery_address = cartDetails[0].delivery_address;
            const order_delivery_address_country = cartDetails[0].delivery_address_country;

            const [stripeSession, lineItems] = await Promise.all([
                stripe.checkout.sessions.retrieve(req.query.session_id, { expand: ['payment_intent.payment_method'] }),
                stripe.checkout.sessions.listLineItems(req.query.session_id)
            ])
    
            const paymentMethodType = stripeSession.payment_method_types[0];
            const lastFourDigits = stripeSession.payment_intent.payment_method.card.last4;
            const totalAmountPaid = stripeSession.amount_total / 100;

            // Obter os IDs dos produtos no carrinho
            const productIds = cartDetails.map(item => item.product_id);

            // Obter detalhes dos produtos na tabela products
            const getProductDetailsQuery = 'SELECT id, company_id AS seller_company_id, price, min_order FROM products WHERE id IN (?)';
            const productDetails = await executeQuery(getProductDetailsQuery, [productIds]);

            const productMap = {};
            productDetails.forEach(product => {
                productMap[product.id] = {
                    seller_company_id: product.seller_company_id,
                    price: product.price,
                    min_order: product.min_order
                };
            });

            cartDetails.forEach(item => {
                if (!productMap[item.product_id]) {
                    console.error(`Produto com ID ${item.product_id} não encontrado no mapa de produtos.`);
                }
            });

            const insertIntoOrdersQuery = 'INSERT INTO orders (buyer_company_id, order_date, order_delivery_date, order_status, delivery_price, order_price_total, order_delivery_address, order_delivery_address_country, payment_method, payment_method_lastFourDigits) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
            const insertIntoOrders = await executeQuery(insertIntoOrdersQuery , [companyId, paymentDate, order_delivery_date, 'Pending', delivery_price, totalAmountPaid, order_delivery_address, order_delivery_address_country, paymentMethodType, lastFourDigits]);
            
            const orderId = insertIntoOrders.insertId;

            const orderItemsValues = cartDetails.map(item => {
                const product = productMap[item.product_id];
                if (product) {
                    const quantity = item.quantity * product.min_order;
                    return [
                        orderId, 
                        item.product_id, 
                        product.seller_company_id, 
                        quantity, 
                        product.price
                    ];
                } else {
                    throw new Error(`Produto com ID ${item.product_id} não encontrado na tabela de produtos.`);
                }
            });

            const insertIntoOrderItemsQuery = 'INSERT INTO orderitems (order_id, product_id, seller_company_id, quantity, product_unit_price) VALUES ?';
            await executeQuery(insertIntoOrderItemsQuery, [orderItemsValues]);
            
            // Remover itens do carrinho
            await executeQuery('DELETE FROM carts WHERE company_id = ?', [companyId]);
        
        }

        
        

        const message = 'Your payment was successful';
        res.redirect('http://localhost:3000')

    } catch (error) {
        console.error('Erro ao efetuar as querys:', error);
        res.json({ success: false, error: 'Erro ao efetuar as querys' });
    }
});


app.post('/remove-from-cart', async (req, res) => {
    try {
        const { productId } = req.body;
        const companyId = req.session.user.id;

        // Consulta para remover o item do carrinho
        const query = 'DELETE FROM carts WHERE product_id = ? AND company_id = ?';
        await executeQuery(query, [productId, companyId]);

        res.json({ success: true, message: 'Produto removido do carrinho.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Erro ao remover o produto do carrinho.' });
    }
});

function executeQuery(query, params = []) {
    return new Promise((resolve, reject) => {
        connection.query(query, params, (error, results, fields) => {
            if (error) {
                reject(error);
            } else {
                resolve(results);
            }
        });
    });
}



//************ login routes *********
function checkSession(req, res, next) {
    if (req.session.user) {
        next();
    } else {
        res.status(401).json({ success: false, message: 'Você precisa estar logado para adicionar produtos ao carrinho.' });
    }
}


app.get('/check-session', checkSession, (req, res) => {
    console.log('Session check:', req.session);
    const userId = req.session.user.id;
    res.json({ isAuthenticated: true, userId: userId });
});


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'views/assets/empresas_img'); // Diretório onde os arquivos serão armazenados
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Nome do arquivo
    }
});

const upload = multer({ storage: storage });

function executeQuery(query, params = []) {
    return new Promise((resolve, reject) => {
        connection.query(query, params, (error, results, fields) => {
            if (error) {
                reject(error);
            } else {
                resolve(results);
            }
        });
    });
}

app.post('/create-account', upload.single('main_img'), (req, res) => {
    const { email, password, company_name, contact, address, nif, company_description } = req.body;
    const main_img = req.file ? req.file.filename : '';

    // Verificar se já existem contas com os mesmos valores para company_name, nif, ou email
    const checkDuplicatesQuery = 'SELECT * FROM companies WHERE company_name = ? OR nif = ? OR email = ?';
    const checkDuplicatesValues = [company_name, nif, email];

    executeQuery(checkDuplicatesQuery, checkDuplicatesValues)
        .then(results => {
            if (results.length > 0) {
                // Se tiver contas com dados duplicados
                let duplicateFields = [];
                if (results.some(result => result.company_name === company_name)) {
                    duplicateFields.push('Company Name');
                }
                if (results.some(result => result.nif === nif)) {
                    duplicateFields.push('NIF');
                }
                if (results.some(result => result.email === email)) {
                    duplicateFields.push('Email');
                }
                const message = `Um ou mais campos já estão registados: ${duplicateFields.join(', ')}`;
                res.status(400).json({ success: false, message });
            } else {
                bcrypt.hash(password, 10, (err, hash) => {
                    if (err) throw err;

                    // SQL para inserir uma nova empresa
                    const insertQuery = 'INSERT INTO companies (email, passwrd, company_name, contact, adress, nif, company_description, main_img) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
                    const insertValues = [email, hash, company_name, contact, address, nif, company_description, main_img];

                    executeQuery(insertQuery, insertValues)
                        .then(result => {
                            console.log('Empresa registrada com sucesso!');
                            res.json({ success: true, message: 'Account successfully created!' });
                        })
                        .catch(error => {
                            console.error('Erro ao registrar a empresa:', error);
                            res.status(500).json({ success: false, message: 'Erro ao registrar a empresa' });
                        });
                });
            }
        })
        .catch(error => {
            console.error('Erro ao verificar duplicatas:', error);
            res.status(500).json({ success: false, message: 'Erro ao verificar duplicatas' });
        });
 
});

app.post('/login', async (req, res) => {
    const { email, password } = req.body;


    try {
        // Verificar o email
        const query = 'SELECT * FROM companies WHERE email = ?';
        const results = await executeQuery(query, [email]);

        if (results.length === 0) {
            console.log('Email não encontrado na base de dados');
            return res.status(401).json({ success: false, message: 'Invalid credentials. Check your email and password and try again.' });
        }


        // Comparar a passwd fornecida com a senha hash armazenada usando bcrypt
        const hashedPassword = results[0].passwrd;
        bcrypt.compare(password, hashedPassword, (bcryptErr, bcryptResult) => {
            if (bcryptErr) {
                console.error('Erro ao comparar as senhas:', bcryptErr);
                return res.status(500).json({ success: false, message: 'Error trying to log in. Please try again later.' });
            }

            if (bcryptResult) {
                console.log('Login bem-sucedido');
                req.session.user = { id: results[0].id, email: results[0].email };
                res.json({ success: true, message: 'Login successful!' });
            } else {
                console.log('Senha incorreta');
                res.status(401).json({ success: false, message: 'Invalid credentials. Check your email and password and try again.' });
            }
        });
    } catch (error) {
        console.error('Erro ao tentar fazer login:', error);
        res.status(500).json({ success: false, message: 'Error trying to log in. Please try again later.' });
    }
});

app.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Erro ao destruir a sessão:', err);
            return res.status(500).json({ success: false, message: 'Error logging out. Please try again later.' });
        }
        res.json({ success: true, message: 'Logout successful!' });
    });
});



//************ admin-dashboard routes ***********
app.get('/dashboard', checkSession, async (req, res) => {
    try {

        const companyId = req.session.user.id;

        //Query Zero -> vai buscar o nome da empresa
        const query0 = 'SELECT company_name FROM companies WHERE id = ?';
        const results0 = await executeQuery(query0, [companyId]);
        companyName = results0[0].company_name;

        // Primeira Query -> vai buscar o numero de produtos para o card 1
        const query1 = 'SELECT COUNT(*) AS total_products FROM products WHERE company_id = ?';
        const results1 = await executeQuery(query1, [companyId]);
        totalProducts = results1[0].total_products;

        // Segunda Query -> vai buscar o numero de encomendas para o card 2
        const query2 = 'SELECT COUNT(*) AS total_orders FROM orders WHERE buyer_company_id = ?';
        const results2 = await executeQuery(query2, [companyId]);
        totalOrders = results2[0].total_orders;

        // Terceira Query -> vai buscar o numero de vendas para o card 3
        const query3 = 'SELECT COUNT(*) AS total_sales FROM orderitems WHERE seller_company_id = ?';
        const results3 = await executeQuery(query3, [companyId]);
        totalSales = results3[0].total_sales;

        // Quarta Query -> vai buscar a lista de produtos para a secção inventory
        const query4 = 'SELECT * FROM products WHERE company_id = ?';
        const results4 = await executeQuery(query4, [companyId]);

        // Quinta Query -> vai buscar a lista de produtos que estão em promoção para a secção inventory
        const query5 = 'SELECT * FROM products WHERE company_id = ? AND is_promotion = 1';
        const results5 = await executeQuery(query5, [companyId]);

        // Sexta Query -> vai buscar a lista de sub-departamentos para o form addProduct
        const query6 = 'SELECT id, name_sub_depart FROM sub_departments';
        const results6 = await executeQuery(query6);

        // Setima Query -> vai buscar a lista de produtos para o form deleteProduct
        const query7 = 'SELECT id, product_name, product_reference FROM products WHERE company_id = ?';
        const results7 = await executeQuery(query7, [companyId]);

        // Oitava Query -> vai buscar a lista de encomendas
        const query8 = 'SELECT *, DATE_FORMAT(order_date, "%a %b %d %Y %H:%i:%s") AS formatted_order_date, DATE_FORMAT(STR_TO_DATE(order_delivery_date, "%Y-%m-%d"), "%a %b %d %Y") AS formatted_delivery_date FROM orders WHERE buyer_company_id = ?';
        const results8 = await executeQuery(query8, [companyId]);

        // Nona Query -> vai buscar a lista vendas 
        const query9 = 'SELECT p.main_img AS img, p.product_reference AS ref, p.product_name AS product, oi.product_unit_price AS price, oi.quantity, DATE_FORMAT(o.order_date, "%a %b %d %Y %H:%i:%s") AS sale_date, c.company_name AS buyer FROM orderitems oi INNER JOIN products p ON oi.product_id = p.id INNER JOIN orders o ON oi.order_id = o.order_id INNER JOIN companies c ON o.buyer_company_id = c.id WHERE p.company_id = ? ORDER BY o.order_date DESC';
        const results9 = await executeQuery(query9, [companyId]);

        // Decima Query -> vai buscar a lista de liked products
        const query10 = 'SELECT p.id AS id, p.main_img AS image, p.product_reference AS reference, p.product_name AS name, p.price AS price FROM liked_products lp JOIN products p ON lp.product_id = p.id WHERE lp.company_id = ?';
        const results10 = await executeQuery(query10, [companyId])
        
        // Décima Primeira Query -> vai buscar a lista de mensagens
        const query11 = 'SELECT m.message_id, m.title, m.content, DATE_FORMAT(m.message_date, "%a %b %d %Y") AS formatted_message_date, m.is_read, c.company_name AS sender FROM messages m JOIN companies c ON m.sender_id = c.id WHERE m.recipient_id = ? ORDER BY m.message_date DESC';
        const results11 = await executeQuery(query11, [companyId]);

        // Decima Segunda Query -> vai buscar a lista de mensagens enviadas
        const query12 = 'SELECT m.message_id, m.title, m.content, DATE_FORMAT(m.message_date, "%a %b %d %Y") AS formatted_message_date, m.is_read, c.company_name AS recipient FROM messages m JOIN companies c ON m.recipient_id = c.id WHERE m.sender_id = ? ORDER BY m.message_date DESC';
        const results12 = await executeQuery(query12, [companyId]);

        // Decima Terceira Query -> vai buscar o numero de vendas para o card 3
        const query13 = 'SELECT COUNT(*) AS total_messages FROM messages WHERE recipient_id = ? AND is_read = 0';
        const results13 = await executeQuery(query13, [companyId]);
        totalMessages = results13[0].total_messages;

        // Decima Quarta Query -> vai buscar a lista de produtos para a secção inventory
        const query14 = 'SELECT * FROM companies WHERE id = ?';
        const results14 = await executeQuery(query14, [companyId]);

        res.render('admin-page', { totalProducts, totalOrders, totalSales, totalMessages, companyName, results4, results5, results6, results7, results8, results9, results10, results11, results12, results14 });
    } catch (error) {
        console.error(error);
        res.status(500).send('Erro ao processar as queries.');
    }
});

// Função para gerar uma referência única de produto
async function generateUniqueProductReference(subDepartment) {
    const prefix = subDepartment.substring(0, 2).toUpperCase();
    let uniqueReference = '';

    while (true) {
        const randomDigits = Math.floor(100000 + Math.random() * 900000).toString();
        uniqueReference = `${prefix}-${randomDigits}`;
        
        const checkReferenceQuery = 'SELECT * FROM products WHERE product_reference = ?';
        const results = await executeQuery(checkReferenceQuery, [uniqueReference]);

        if (results.length === 0) {
            break; // Se a referência for única, saia do loop
        }
    }

    return uniqueReference;
}

// Função para obter o nome do subdepartamento pelo ID
async function getSubDepartmentNameById(subDepartmentId) {
    const query = 'SELECT name_sub_depart FROM sub_departments WHERE id = ?';
    const results = await executeQuery(query, [subDepartmentId]);
    if (results.length > 0) {
        return results[0].name_sub_depart;
    } else {
        throw new Error('Sub-department not found');
    }
}

app.post('/addNewProduct', upload.fields([{ name: 'main_img' }, { name: 'img_2' }, { name: 'img_3' }, { name: 'img_4' }]), async (req, res) => {
    const { product_name, sub_department, price, price_symbol, stock, min_order, product_description } = req.body;
    const companyId = req.session.user.id;
    const main_img = req.files['main_img'] ? req.files['main_img'][0].filename : '';
    const img_2 = req.files['img_2'] ? req.files['img_2'][0].filename : '';
    const img_3 = req.files['img_3'] ? req.files['img_3'][0].filename : '';
    const img_4 = req.files['img_4'] ? req.files['img_4'][0].filename : '';

    try {

        // Verificar se já existem produtos com o mesmo product_name
        const checkDuplicatesQuery = 'SELECT * FROM products WHERE product_name = ?';
        const checkDuplicatesValues = [product_name];

        const results = await executeQuery(checkDuplicatesQuery, checkDuplicatesValues);

        if (results.length > 0) {
            const message = "There is already a product with that name.";
            res.status(400).json({ success: false, message });

        } else {

            // Obter o nome do subdepartamento pelo ID
            const subDepartmentName = await getSubDepartmentNameById(sub_department);

            // Gerar a referência do produto
            const product_reference = await generateUniqueProductReference(subDepartmentName);

            const insertQuery = 'INSERT INTO products (product_name, product_description, price, stock, min_order, company_id, sub_department_id, main_img, img_2, img_3, img_4, price_symbol, is_promotion, product_reference) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
            const insertValues = [product_name, product_description, price, stock, min_order, companyId, sub_department, main_img, img_2, img_3, img_4, price_symbol, 0, product_reference];
            await executeQuery(insertQuery, insertValues);

            res.status(200).json({ success: true, message: 'Product added successfully.' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }

});

app.post('/deleteProduct', async (req, res) => {
    const  { productId } = req.body;
    companyId = req.session.user.id;
    console.log(`productId: ${productId}`);

    try {
        const deleteQuery = 'DELETE FROM products WHERE id = ?';
        await executeQuery(deleteQuery, [productId]);
        res.status(200).json({ success: true, message: 'Product successfully deleted.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

app.post('/editProduct', async (req, res) => {
    const { productId, field_to_edit, value } = req.body;


    if (!productId || !field_to_edit || !value) {
        return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    try {
        // const updateQuery = `UPDATE products SET ${field} = ? WHERE id = ?`;
        // await executeQuery(updateQuery, [value, productId]);
        res.status(200).json({ success: true, message: 'Product successfully updated.' });
    } catch (error) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

app.post('/editPromotionPrice', async (req, res) => {
    const { productId, promotionPrice } = req.body;

    
    try {
        const queryNormalPrice = 'SELECT price FROM products WHERE id = ?';
        const resultsPrice = await executeQuery(queryNormalPrice, [productId]);
        const normal_price = resultsPrice[0].price;

        // Calcular a diferença percentual
        const percentage_difference = Math.round(((normal_price - promotionPrice) / normal_price) * 100);

        console.log(`price: ${normal_price}`);
        console.log(`discount_percentage: ${percentage_difference}`);

        const updateQuery = `UPDATE products SET promotion_price = ?, discount_percentage = ? WHERE id = ?`;
        await executeQuery(updateQuery, [promotionPrice, percentage_difference, productId]);

        res.status(200).json({ success: true, message: 'Promotion price successfully updated.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

app.post('/addPromotion', async (req, res) => {
    const { productId, promotion_price } = req.body;


    try {

        const queryNormalPrice = 'SELECT price FROM products WHERE id = ?';
        const resultsPrice = await executeQuery(queryNormalPrice, [productId]);
        const normal_price = resultsPrice[0].price;

        // Calcular a diferença percentual
        const percentage_difference = Math.round(((normal_price - promotion_price) / normal_price) * 100);

        console.log(`price: ${normal_price}`);
        console.log(`discount_percentage: ${percentage_difference}`);

        const updateQuery = 'UPDATE products SET is_promotion = ?, promotion_price = ?, discount_percentage = ? WHERE id = ?';
        await executeQuery(updateQuery, [1, promotion_price, percentage_difference, productId]);


        res.status(200).json({ success: true, message: 'Promotion added successfully.' });
    } catch (error) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

app.post('/removePromotion', async (req, res) => {
    const  { productId } = req.body;

    try {

        const removeQuery = 'UPDATE products SET is_promotion = ?, promotion_price = ?, discount_percentage = ? WHERE id = ?';
        await executeQuery(removeQuery, [0, 0.00, 0, productId]);


        res.status(200).json({ success: true, message: 'Product successfully deleted.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

app.get('/order/items/:orderId', async (req, res) => {
    const { orderId } = req.params;

    try {
        // Query para obter os itens da ordem com base na order_id
        const query = 'SELECT oi.order_id, p.main_img AS img, p.product_reference AS ref, p.product_name AS product, oi.quantity, oi.product_unit_price AS price, c.company_name AS seller FROM orderitems oi INNER JOIN products p ON oi.product_id = p.id INNER JOIN companies c ON oi.seller_company_id = c.id WHERE oi.order_id = ?';
        const orderItems = await executeQuery(query, [orderId]);

        res.json(orderItems); 
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Erro ao buscar itens da ordem.' });
    }
});

app.post('/addLikedProducts', async (req, res) => {
    const { productId } = req.body;
    companyId = req.session.user.id;

    console.log(`productId: ${productId}`);

    try {
        
        const LikedQuery = 'INSERT INTO liked_products (product_id, company_id) VALUES (?, ?)';
        await executeQuery(LikedQuery, [productId, companyId]);

        res.status(200).json({ success: true, message: 'Product added to your Liked Products List!' });
    } catch (error) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

app.get('/message/:messageId', async (req, res) => {
    const { messageId } = req.params;
    console.log(`Message ID: ${messageId}`);

    try {
        
        const query = 'SELECT m.message_id, m.sender_id, sender.company_name AS sender_name, m.title, DATE_FORMAT(m.message_date, "%a %b %d %Y") AS formatted_message_date, m.content, recipient.company_name AS recipient_name FROM messages m JOIN companies sender ON m.sender_id = sender.id JOIN companies recipient ON m.recipient_id = recipient.id WHERE m.message_id = ?';
        const messageDetails = await executeQuery(query, [messageId]);

        if (messageDetails.length === 0) {
            return res.status(404).json({ success: false, message: 'Mensagem não encontrada.' });
        }

        res.json(messageDetails[0]); // Retorna os detalhes da mensagem em formato JSON
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Erro ao buscar detalhes da mensagem.' });
    }
});

app.post('/replyMessage', async (req, res) => {
    const { replyMsg, replyRecipientId, replyOriginalTitle } = req.body;
    const senderId = req.session.user.id;

    console.log(`replyMsg: ${replyMsg}`);
    console.log(`replyRecipientId: ${replyRecipientId}`);
    console.log(`replyOriginalTitle: ${replyOriginalTitle}`);

    try {
        // Insere a mensagem de resposta na tabela messages
        const query = 'INSERT INTO messages (sender_id, recipient_id, title, content) VALUES (?, ?, ?, ?)';
        await executeQuery(query, [senderId, replyRecipientId, replyOriginalTitle, replyMsg]);

        res.status(200).json({ success: true, message: 'Message replied successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Failed to reply message' });
    }
});

app.post('/sendMessage', async (req, res) => {
    const { company_name, title, msg_content } = req.body;
    const senderId = req.session.user.id;

    try {
        // Verifica se a empresa existe com o nome fornecido
        const checkCompanyQuery = 'SELECT id FROM companies WHERE company_name = ?';
        const companyResult = await executeQuery(checkCompanyQuery, [company_name]);

        if (companyResult.length === 0) {
            return res.status(404).json({ success: false, message: 'Company not found' });
        }

        const companyId = companyResult[0].id;

        // Insere a mensagem na tabela messages
        const sendMessageQuery = 'INSERT INTO messages (sender_id, recipient_id, title, content, message_date) VALUES (?, ?, ?, ?, NOW())';
        await executeQuery(sendMessageQuery, [senderId, companyId, title, msg_content]);

        res.status(200).json({ success: true, message: 'Message sent successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Failed to send message' });
    }
});

app.post('/markAsRead/:messageId', async (req, res) => {
    const { messageId } = req.params;

    try {
        const query = 'UPDATE messages SET is_read = ? WHERE message_id = ?';
        await executeQuery(query, [1, messageId]);

        res.status(200).json({ success: true, message: 'Message marked as read' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Failed to mark message as read' });
    }
});

app.post('/editProfileName', async (req, res) => {
    const { name } = req.body;
    const companyId = req.session.user.id;

    console.log(`Name: ${name}`);

    try {

        const updateQuery = `UPDATE companies SET company_name = ? WHERE id = ?`;
        await executeQuery(updateQuery, [name, companyId]);

        res.status(200).json({ success: true, message: 'Profile name successfully updated.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

app.post('/editProfileContact', async (req, res) => {
    const { contact } = req.body;
    const companyId = req.session.user.id;

    console.log(`Contact: ${contact}`);

    try {

        const updateQuery = `UPDATE companies SET contact = ? WHERE id = ?`;
        await executeQuery(updateQuery, [contact, companyId]);

        res.status(200).json({ success: true, message: 'Profile contact successfully updated.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

app.post('/editProfileAdress', async (req, res) => {
    const { adress } = req.body;
    const companyId = req.session.user.id;

    console.log(`Contact: ${adress}`);

    try {

        const updateQuery = `UPDATE companies SET adress = ? WHERE id = ?`;
        await executeQuery(updateQuery, [adress, companyId]);

        res.status(200).json({ success: true, message: 'Profile adress successfully updated.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

app.post('/editProfileEmail', async (req, res) => {
    const { email } = req.body;
    const companyId = req.session.user.id;

    console.log(`Contact: ${email}`);

    try {

        const updateQuery = `UPDATE companies SET email = ? WHERE id = ?`;
        await executeQuery(updateQuery, [email, companyId]);

        res.status(200).json({ success: true, message: 'Profile email successfully updated.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

app.post('/editProfileDescription', async (req, res) => {
    const { description } = req.body;
    const companyId = req.session.user.id;

    console.log(`Contact: ${description}`);

    try {

        const updateQuery = `UPDATE companies SET company_description = ? WHERE id = ?`;
        await executeQuery(updateQuery, [description, companyId]);

        res.status(200).json({ success: true, message: 'Profile description successfully updated.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

app.post('/editProfilePassword', async (req, res) => {
    const { new_password } = req.body;
    const companyId = req.session.user.id;

    console.log(`Contact: ${new_password}`);

    try {

        const getUserQuery = 'SELECT passwrd FROM companies WHERE id = ?';
        const company = await executeQuery(getUserQuery, [companyId]);

        const storedPassword = company[0].passwrd;

        const isSamePassword = await bcrypt.compare(new_password, storedPassword);
        if (isSamePassword) {
            return res.status(400).json({ success: false, message: 'New password must be different from the current password' });
        }

        const hashedPassword = await bcrypt.hash(new_password, 10);

        const updateQuery = `UPDATE companies SET passwrd = ? WHERE id = ?`;
        await executeQuery(updateQuery, [hashedPassword, companyId]);

        res.status(200).json({ success: true, message: 'Password successfully updated.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

app.post('/editProfileImage', upload.fields([{ name: 'main_img' }]), async (req, res) => {
    const main_img = req.files['main_img'] ? req.files['main_img'][0].filename : '';
    const companyId = req.session.user.id;

    console.log(`img: ${main_img}`);


    try {

        const updateQuery = `UPDATE companies SET main_img = ? WHERE id = ?`;
        await executeQuery(updateQuery, [main_img, companyId]);

        res.status(200).json({ success: true, message: 'Profile image successfully updated.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

app.get('/top-products', async (req, res) => {
    const companyId = req.session.user.id;

    const topProductsQuery = 'SELECT product_id, SUM(quantity) AS sales_count FROM orderitems WHERE seller_company_id = ? GROUP BY product_id ORDER BY sales_count DESC LIMIT 5';
    const topProductsResults = await executeQuery(topProductsQuery, [companyId]);

    if (topProductsResults.length > 0) {
        const productIds = topProductsResults.map(result => result.product_id);

        // Query para obter os nomes dos produtos
        const productNamesQuery = 'SELECT id, product_name FROM products WHERE id IN (?)';
        const productNamesResults = await executeQuery(productNamesQuery, [productIds]);

        const productNamesMap = productNamesResults.reduce((map, product) => {
            map[product.id] = product.product_name;
            return map;
        }, {});

        const topProducts = topProductsResults.map(result => ({
            product_id: result.product_id,
            product_name: productNamesMap[result.product_id],
            sales_count: result.sales_count
        }));

        res.json(topProducts);

    } else {
        res.json([]);
    }
});


//************ about routes ***********
app.get('/about', async (req, res) => {
    try {
        // Primeira Query
        const query1 = 'SELECT * FROM departments';
        const results1 = await executeQuery(query1);

        // Segunda Query
        const query2 = 'SELECT company_name, id FROM companies ORDER BY RAND() LIMIT 9';
        const results2 = await executeQuery(query2);

        // Decima Query -> vai buscar os sub-departamentos para o nav superior
        const query10 = 'SELECT * FROM sub_departments ORDER BY RAND() LIMIT 9';
        const results10 = await executeQuery(query10);

        // Cart Query -> Vai buscar os itens do carrinho do cliente
        if (req.session.user) {
            const userId = req.session.user.id;
    
            const cartQuery = 'SELECT c.product_id, c.quantity, p.product_name, p.price, p.main_img, p.min_order FROM carts c JOIN products p ON c.product_id = p.id WHERE c.company_id = ?';
            const cartItems = await executeQuery(cartQuery, [userId]);
    
            res.render('about', { isAuthenticated:true, results1, results2, results10, cartItems });
        } else {
            res.render('about', { isAuthenticated:false, results1, results2, results10 });
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Erro ao processar as queries.');
    }
    
})

function executeQuery(query, params = []) {
    return new Promise((resolve, reject) => {
        connection.query(query, params, (error, results, fields) => {
            if (error) {
                reject(error);
            } else {
                resolve(results);
            }
        });
    });
};


//escutar os request
app.listen(3000);