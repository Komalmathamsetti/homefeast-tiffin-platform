const pool = require("../db");


// =====================================================
// GET ALL COOKS
// =====================================================

const getAllCooks = async (req, res) => {
  try {
    const cooks = await pool.query(
      `
      SELECT
        c.id,
        u.name,
        c.bio,
        c.service_area,
        c.delivery_timings,
        c.image_url,
        MIN(m.price) AS starting_price,
        MIN(m.cuisine) AS cuisine,

        COALESCE(
          review_stats.average_rating,
          0
        ) AS average_rating,

        COALESCE(
          review_stats.review_count,
          0
        ) AS review_count

      FROM cooks c

      JOIN users u
        ON c.user_id = u.id

      LEFT JOIN menus m
        ON c.id = m.cook_id

      LEFT JOIN (
        SELECT
          cook_id,
          ROUND(AVG(rating), 1) AS average_rating,
          COUNT(*) AS review_count
        FROM reviews
        GROUP BY cook_id
      ) review_stats
        ON review_stats.cook_id = c.id
      WHERE c.approved = true
      GROUP BY
        c.id,
        u.name,
        c.bio,
        c.service_area,
        c.delivery_timings,
        c.image_url,
        review_stats.average_rating,
        review_stats.review_count

      ORDER BY c.id DESC
      `
    );

    res.status(200).json(cooks.rows);

  } catch (error) {
    console.log("Get All Cooks Error:", error);

    res.status(500).json({
      message: "Server Error"
    });
  }
};


// =====================================================
// GET COOK DETAILS
// =====================================================

const getCookDetails = async (req, res) => {
  try {
    const cookId = req.params.id;

    const cook = await pool.query(
      `
      SELECT
        cooks.id,
        cooks.user_id,
        cooks.bio,
        cooks.service_area,
        cooks.delivery_timings,
        cooks.image_url,
        cooks.earnings,
        cooks.approved,

        users.name,
        users.email,
        users.phone,

        COALESCE(
          review_stats.average_rating,
          0
        ) AS average_rating,

        COALESCE(
          review_stats.review_count,
          0
        ) AS review_count

      FROM cooks

      JOIN users
        ON cooks.user_id = users.id

      LEFT JOIN (
        SELECT
          cook_id,
          ROUND(AVG(rating), 1) AS average_rating,
          COUNT(*) AS review_count
        FROM reviews
        GROUP BY cook_id
      ) review_stats
        ON review_stats.cook_id = cooks.id

      WHERE cooks.id = $1
      `,
      [cookId]
    );

    if (cook.rows.length === 0) {
      return res.status(404).json({
        message: "Cook Not found"
      });
    }

    const menus = await pool.query(
      `
      SELECT *
      FROM menus
      WHERE cook_id = $1
      `,
      [cookId]
    );

    res.status(200).json({
      cook: cook.rows[0],
      menus: menus.rows
    });

  } catch (error) {
    console.log("Get Cook Details Error:", error);

    res.status(500).json({
      message: "Server Error"
    });
  }
};

const filterCooks = async (req, res) => {
  try {

    const {
      search,
      cuisine,
      mealType,
      mealPlan,
      maxPrice
    } = req.query;
    let query = `
      SELECT

        c.id,
        u.name,
        c.bio,
        c.service_area,
        c.delivery_timings,
        c.image_url,
        MIN(m.price) AS starting_price,
        MIN(m.cuisine) AS cuisine,

        COALESCE(
          review_stats.average_rating,
          0
        ) AS average_rating,

        COALESCE(
          review_stats.review_count,
          0
        ) AS review_count
      FROM cooks c
      JOIN users u
        ON c.user_id = u.id
      LEFT JOIN menus m
        ON c.id = m.cook_id
      LEFT JOIN (
        SELECT
          cook_id,
          ROUND(AVG(rating), 1) AS average_rating,
          COUNT(*) AS review_count
        FROM reviews
        GROUP BY cook_id
      ) review_stats
        ON review_stats.cook_id = c.id
      WHERE c.approved = true
    `;
    const values = [];
    if (search) {
      values.push(`%${search}%`);
      query += `
        AND (
          LOWER(u.name) LIKE LOWER($${values.length})
          OR LOWER(c.bio) LIKE LOWER($${values.length})
          OR LOWER(c.service_area) LIKE LOWER($${values.length})
          OR LOWER(m.cuisine) LIKE LOWER($${values.length})
        )
      `;
    }
    if (cuisine) {
      values.push(cuisine);
      query += `
        AND m.cuisine = $${values.length}
      `;
    }

    if (mealType) {
      values.push(mealType);
      query += `
        AND m.meal_type = $${values.length}
      `;
    }
    if (mealPlan) {
      values.push(mealPlan);
      query += `
        AND m.meal_plan = $${values.length}
      `;
    }
    if (maxPrice) {
      values.push(maxPrice);
      query += `
        AND m.price <= $${values.length}
      `;
    }
    query += `
      GROUP BY
        c.id,
        u.name,
        c.bio,
        c.service_area,
        c.delivery_timings,
        c.image_url,
        review_stats.average_rating,
        review_stats.review_count

      ORDER BY c.id DESC
    `;
    const cooks = await pool.query(
      query,
      values
    );
    res.status(200).json(
      cooks.rows
    );
  } catch (error) {
    console.log(
      "Filter Cooks Error:",
      error
    );
    res.status(500).json({
      message: "Server Error"
    });
  }
};
module.exports = {
  getAllCooks,
  getCookDetails,
  filterCooks
};