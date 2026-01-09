const pool = require('../db');

module.exports = async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    const { item_code, total_stock, starts_at } = req.body;
    try {
        await pool.query('BEGIN');

        const searchedItem = await pool.query('select * from items where item_code=$1', [item_code])

        if (searchedItem.rowCount === 0) {
            return res.status(404).json({ error: 'Item not found.' });
        }

        const found_item_code = searchedItem.rows[0].item_code;

        await pool.query('insert into drops (item_code, total_stock, available_stock, starts_at) values ($1, $2, $2, $3)', [found_item_code, total_stock, starts_at]);

        await pool.query('COMMIT');

        res.status(200).json({ message: 'Drop created' });

    }
    catch (err) {
        await pool.query('ROLLBACK');
        res.status(500).json({ error: err.message });
    }
}
