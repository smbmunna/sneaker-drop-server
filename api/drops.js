const pool= require('../db'); 

app.post('/api/drops', async(req,res)=>{
    const {item_code, total_stock, starts_at}= req.body; 
    try{
        await pool.query('BEGIN');

        const searchedItem= await pool.query('select * from items where item_code=$1', [item_code])

        if(searchedItem.rowCount===0){
            return res.status(404).json({error: 'Item not found.'}); 
        }

        const item_code= searchedItem.rows[0].item_code; 

        await pool.query('insert into drops (item_code, total_stock, available_stock, starts_at) values ($1, $2, $2, $3)', [item_code, total_stock, starts_at]); 

        await pool.query('COMMIT'); 

        res.status(200).json({message: 'Drop created'}); 

    }
    catch(err){
        res.status(500).json({error: err.message}); 
    }
})