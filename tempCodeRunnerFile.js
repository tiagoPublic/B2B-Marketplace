d-more-products-sub-departments/:sub_department_id', async (req, res) => {
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
        res.json({ products });
    } catch (error) {
        console.error('Erro ao carregar produtos filtrados:', error);
        res.status(500).send('Erro ao carregar produtos filtrados');
    }
});