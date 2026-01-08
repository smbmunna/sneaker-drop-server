const pool= require('../db'); 

export default async function handler(req,res){
    try{
        await pool.query('BEGIN'); 
        await pool.query('update items set stock=stock+1 where item_code in (select item_code from reservations where expires_at<NOW() and is_completed= FALSE) '); 
        await pool.query('delete from reservations where expires_at<NOW() and is_completed=FALSE'); 
        await pool.query('COMMIT'); 

        res.send(200).json({success: true}); 
    }
    catch(error){
        res.status(500).json({error: error.message}); 
    }
}