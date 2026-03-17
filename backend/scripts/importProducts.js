/**
 * importProducts.js
 * Run with: node scripts/importProducts.js
 * Imports unique products from amazon.csv into MongoDB.
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const fs   = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const csv  = require('csv-parse/sync');

const Product = require('../models/Product');

// ─── helpers ────────────────────────────────────────────────────────
function parsePrice(raw) {
  if (!raw) return 0;
  // Remove ₹, commas, quotes, spaces
  const cleaned = String(raw).replace(/[₹,"'\s]/g, '');
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

function parseCategory(raw) {
  if (!raw) return 'General';
  // e.g. "Computers&Accessories|Accessories&Peripherals|Cables..." → take first segment
  return raw.split('|')[0].trim() || 'General';
}

// ─── main ────────────────────────────────────────────────────────────
async function run() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const csvPath = path.join(__dirname, '../../amazon.csv');
    const raw = fs.readFileSync(csvPath, 'utf8');

    const records = csv.parse(raw, {
      columns: true,
      skip_empty_lines: true,
      relax_quotes: true,
      relax_column_count: true,
    });

    console.log(`📄 Parsed ${records.length} rows from CSV`);

    // Deduplicate by product_id
    const seen = new Set();
    const unique = records.filter(r => {
      if (!r.product_id || seen.has(r.product_id)) return false;
      seen.add(r.product_id);
      return true;
    });

    console.log(`🔢 Unique products: ${unique.length}`);

    // Build docs
    const docs = unique
      .filter(r => r.product_name && r.discounted_price)
      .map(r => ({
        name:        r.product_name.trim(),
        description: r.about_product
          ? r.about_product.split('|')[0].trim().slice(0, 500)
          : r.product_name.trim().slice(0, 200),
        price:       parsePrice(r.discounted_price),
        category:    parseCategory(r.category),
        image:       r.img_link ? r.img_link.trim() : '',
        isTrending:  false,
        isRecommended: false,
        purchaseCount: 0,
      }))
      .filter(d => d.price > 0);

    console.log(`📦 Inserting ${docs.length} valid products…`);

    // Clear existing and insert fresh
    await Product.deleteMany({});
    await Product.insertMany(docs, { ordered: false });

    console.log(`🎉 Done! ${docs.length} products imported.`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

run();
