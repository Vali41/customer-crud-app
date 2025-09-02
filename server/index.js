const express = require('express');
const sqlite3= require('sqlite3').verbose();
const cors = require('cors');

const app= express();
app.use(cors());
app.use(express.json());

const db= new sqlite3.Database('./database.db',(err)=>{
    if(err){
        console.log(`Error connecting to the database: ${err.message}`)
    }else{
        console.log('Connected to the database successfully')
    }
})

db.serialize(()=>{
    db.run(`CREATE TABLE IF NOT EXISTS customers(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    phone_number TEXT NOT NULL UNIQUE
)`);
    db.run(`CREATE TABLE IF NOT EXISTS addresses(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_id INTEGER NOT NULL,
    address_details TEXT NOT NULL,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    pin_code TEXT NOT NULL,
    FOREIGN KEY (customer_id) REFERENCES customers (id)
)`);
});

const PORT = 5000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

app.post('/api/customers',(req,res)=>{
    const {first_name,last_name,phone_number} = req.body;

    if (!first_name || ! last_name || !phone_number){
        return res.status(400).json({error: 'All fields are required'});
    }
    if(!/^\d{10}$/.test(phone_number)){
        return res.status(400).json({error: 'Invalid phone number format'});
    }
    const sql = `INSERT INTO customers (first_name,last_name,phone_number)VAlUES(?,?,?)`;

    db.run(sql,[first_name,last_name,phone_number],function(err){
        if(err){
            return res.status(500).json({error:err.message});
        }
        res.status(201).json({message: 'Customer created successfully', id: this.lastID});
    })
}) 

app.get('/api/customers', (req, res) => {
    const { search, page = 1, limit = 10, sort = 'c.id', order = 'ASC' } = req.query;
    const offset = (page - 1) * limit;

    // 1. Start with a base query that JOINS customers and addresses.
    // Use DISTINCT to prevent duplicate customers in results.
    let sql = `
        SELECT DISTINCT c.* FROM customers c
        LEFT JOIN addresses a ON c.id = a.customer_id
    `;
    let countSql = `
        SELECT COUNT(DISTINCT c.id) as count
        FROM customers c
        LEFT JOIN addresses a ON c.id = a.customer_id
    `;

    const params = [];

    if (search) {
        // 2. Expand the WHERE clause to search across both tables.
        const whereClause = ` WHERE (c.first_name LIKE ? OR c.last_name LIKE ? OR a.city LIKE ? OR a.state LIKE ? OR a.pin_code LIKE ?)`;
        sql += whereClause;
        countSql += whereClause;
        // 3. Add the search parameter for each field you want to check.
        const searchTerm = `%${search}%`;
        params.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
    }

    // Sanitize sort column to prevent SQL injection
    const allowedSortColumns = ['c.id', 'c.first_name', 'c.last_name'];
    const safeSort = allowedSortColumns.includes(sort) ? sort : 'c.id';
    const safeOrder = order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

    sql += ` ORDER BY ${safeSort} ${safeOrder} LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), parseInt(offset));
    
    // Execute the main query to get the paginated data
    db.all(sql, params, (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        // Execute the count query with the same search parameters (excluding limit/offset)
        db.get(countSql, params.slice(0, params.length - 2), (err, countResult) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.json({
                message: 'Customers retrieved successfully',
                data: rows,
                total: countResult.count,
                page: parseInt(page),
                totalPages: Math.ceil(countResult.count / limit)
            });
        });
    });
});


app.get(`/api/customers/:id`,(req,res)=>{
    const {id} = req.params;
    const sql = `SELECT * FROM customers WHERE id = ?`;
    db.get(sql,[req.params.id],(err,row)=>{
        if(err){
            return res.status(400).json({error:err.message})
        }
        if(!row){
            return res.status(404).json({error:`Customer not found`})
        }
        res.json({data: row})
    })
});

app.put(`/api/customers/:id`,(req,res)=>{
    const {id} = req.params;
    const {first_name,last_name,phone_number} = req.body;

    if (!first_name || ! last_name || !phone_number){
        return res.status(400).json({error: 'All fields are required'});
    }
    if(!/^\d{10}$/.test(phone_number)){
        return res.status(400).json({error: 'Invalid phone number format'});
    }
    const sql = `UPDATE customers SET first_name = ?, last_name = ?, phone_number = ? WHERE id = ?`;

    db.run(sql,[first_name,last_name,phone_number,id],function(err){
        if(err){
            return res.status(400).json({error:err.message});
        }
        if(this.changes === 0){
            return res.status(404).json({error: 'Customer not found'});
        }
        res.json({message: 'Customer updated successfully'});
    })

})

app.delete(`/api/customers/:id`,(req,res)=>{
    const {id} = req.params;
    const sql = `DELETE FROM customers WHERE id =?`

    db.run(sql,[id],function(err){
        if(err){
            return res.status(400).json({error:err.message})
        }
        if(this.changes === 0){
            return res.status(404).json({error: 'Customer not found'});
        }
        res.json({message: `customer deleted successfully`})
    })

})

// Address Api//

app.post('/api/customers/:id/addresses', (req, res) => {
  const { address_details, city, state, pin_code } = req.body;

  // Server-side validation
  if (!address_details || !city || !state || !pin_code) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  const sql = `INSERT INTO addresses (customer_id, address_details, city, state, pin_code) VALUES (?, ?, ?, ?, ?)`;
  db.run(sql, [req.params.id, address_details, city, state, pin_code], function (err) {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    res.status(201).json({ message: 'Address created', id: this.lastID });
  });
});

app.get('/api/customers/:id/addresses', (req, res) => {
  const sql = `SELECT * FROM addresses WHERE customer_id = ?`;
  db.all(sql, [req.params.id], (err, rows) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    res.json({ message: 'success', data: rows });
  });
});

app.put('/api/customers/:id/addresses/:addressId', (req, res) => {
    const { address_details, city, state, pin_code } = req.body;
    if (!address_details || !city || !state || !pin_code) {
        return res.status(400).json({ error: 'All fields are required' });
    }
    const { id, addressId } = req.params;
    const sql = `UPDATE addresses SET address_details = ?, city = ?, state = ?, pin_code = ? WHERE id = ? AND customer_id = ?`;
    db.run(sql, [address_details, city, state, pin_code, addressId, id], function(err) {
        if (err) {
            return res.status(500).json({ error: 'Internal server error' });
        }
        if (this.changes === 0) {
            return res.status(404).json({ error: 'Address not found or does not belong to this customer' });
        }
        res.json({ message: 'Address updated successfully' });
    });
});
app.delete('/api/customers/:id/addresses/:addressId', (req, res) => {
  const sql = `DELETE FROM addresses WHERE id = ?`;
  db.run(sql, [req.params.addressId], function (err) {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Address not found' });
    }
    res.json({ message: 'Address deleted' });
  });
});