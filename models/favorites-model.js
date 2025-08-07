const pool = require("../database")

// adds the favorite vehicle for user
async function addFavorite(account_id, inv_id) {
    try {
        const sql = 'INSERT INTO favorites (account_id, inv_id) VALUES ($1, $2) RETURNING *'
        const result = await pool.query(sql, [account_id, inv_id])
        return result.rows[0]
    } catch (error) {
        throw error
    }
}

// remove favorite vehicle for user
async function removeFavorite(account_id, inv_id) {
    try {
        const sql = 'DELETE FROM favorites WHERE account_id = $1 AND inv_id =$2'
        await pool.query(sql, [account_id, inv_id])
    } catch (error) {
        throw error
    }
}


// get all favorite for user
async function getFavoritesByAccount(account_id) {
    try {
        const sql = `
        SELECT i.*
        FROM inventory i
        JOIN favorites f ON i.inv_id = f.inv_id
        WHERE f.account_id = $1
        `;
        const result = await pool.query(sql, [account_id])
        return result.rows;
    } catch (error) {
        throw error
    }
}

// check if vehicle is in favorite
async function isFavorite(account_id, inv_id) {
      try {
        const sql = 'SELECT 1 FROM favorites WHERE account_id = $1 AND inv_id = $2'
        const result = await pool.query(sql, [account_id, inv_id])
        return result.rows > 0
    } catch (error) {
        throw error
    }
}

module.exports= {addFavorite, removeFavorite, getFavoritesByAccount, isFavorite,}