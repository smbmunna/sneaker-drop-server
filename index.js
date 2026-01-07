require('dotenv').config(); 
const express= require('express'); 
const cors= require('cors'); 
const pool= require('./db'); 


const app= express(); 
app.use(cors()); 
app.use(express.json()); 


app.get('/', (req,res)=>{
    res.send('API is running'); 
})

//get all users
app.get('/users', async(req, res)=>{
    try{
        const {rows}= await pool.query('select * from users'); 
        //console.log(rows); 
        res.json(rows); 

    }
    catch(err){
        res.status(500).json({error: err.message}); 
    }
})

//get all items
app.get('/items', async(req,res)=>{
    try{
        const {rows}= await pool.query('select * from items'); 
        res.json(rows); 
    }
    catch(err){
        res.status(500).json({error: err.message})
    }
})



const PORT= process.env.PORT || 5000; 
app.listen(PORT,()=>{
    console.log(`Sneaker drop server is running on port ${PORT}`); 
})