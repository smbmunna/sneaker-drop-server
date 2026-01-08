require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pool = require('./db');


const app = express();
app.use(cors());
app.use(express.json());


app.get('/', (req, res) => {
    res.send('API is running');
})

//get all users
app.get('/users', async (req, res) => {
    try {
        const { rows } = await pool.query('select * from users');
        //console.log(rows); 
        res.json(rows);

    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
})

//get all items
app.get('/items', async (req, res) => {
    try {
        const { rows } = await pool.query('select * from items');
        res.json(rows);
    }
    catch (err) {
        res.status(500).json({ error: err.message })
    }
})

//reserve an item
app.post('/reserve/:item_code', async (req,res)=>{
    try{
        const {item_code}= req.params; 
        await pool.query('BEGIN'); 

        //getting item from items table with lock
        const itemResult= await pool.query(`select item_code, stock from items where item_code=$1 FOR UPDATE`, [item_code]); 

        if(itemResult.rowCount ===0 ){
            await pool.query('ROLLBACK'); 
            return res.status(404).json({message: "Item not found!"}); 
        }

        const foundItem= itemResult.rows[0]; 

        if(foundItem.stock<=0){
            await pool.query('ROLLBACK'); 
            return res.status(400).json({message: "Out of stock!"}); 
        }

        //decrease stock
        pool.query(`update items set stock=stock-1 where item_code=$1`, [foundItem.item_code]); 

        //insert into reservations table
        pool.query(`insert into reservations (item_code, expires_at) values ($1, NOw() + INTERVAL '60 seconds' ) `, [foundItem.item_code]); 

        // all done now commit
        pool.query('COMMIT'); 

        res.status(200).json({message: `${foundItem.item_code} Item reserved for 60 seconds.`}); 
    }catch(err){
        await pool.query('ROLLBACK'); 
        res.status(500).json({error: err.message}); 
    }
})


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Sneaker drop server is running on port ${PORT}`);
})