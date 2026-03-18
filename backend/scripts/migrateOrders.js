/**
 * migrateOrders.js — Backfill denormalized product fields into existing orders.
 * Uses raw MongoDB driver (not Mongoose model) to avoid default value conflicts.
 * Safe to re-run (only touches items where name is missing/empty).
 */

const mongoose = require('mongoose');

const MONGO_URI =
  'mongodb+srv://rinkanmahapatra_db_user:123%40Rinkan123@cluster0.ganr2x7.mongodb.net/e-commerce?appName=Cluster0';

async function migrate() {
  console.log('\n📦 Connecting to MongoDB…');
  await mongoose.connect(MONGO_URI);
  console.log('✅ Connected!\n');

  const ordersCol   = mongoose.connection.collection('orders');
  const productsCol = mongoose.connection.collection('products');

  const orders = await ordersCol.find({}).toArray();
  console.log(`🔍 Total orders in DB: ${orders.length}\n`);

  let ordersFixed = 0;
  let itemsFixed  = 0;
  let notFound    = 0;

  for (const order of orders) {
    let changed = false;

    for (const item of order.products) {
      // Only process items that are missing a name
      if (item.name && item.name.trim() !== '') continue;

      const prod = await productsCol.findOne({ _id: item.product });
      if (prod) {
        item.name        = prod.name        || '';
        item.category    = prod.category    || '';
        item.description = prod.description || '';
        item.price       = prod.price       || 0;
        item.image       = prod.image       || '';
        changed = true;
        itemsFixed++;
        console.log(`  ✔  "${prod.name}" (${prod.category})`);
      } else {
        notFound++;
        console.log(`  ⚠  product ${item.product} — NOT in DB (deleted or re-imported)`);
      }
    }

    if (changed) {
      // Use raw MongoDB updateOne so $set works without Mongoose intercepting defaults
      const setDoc = { products: order.products };
      await ordersCol.updateOne(
        { _id: order._id },
        { $set: setDoc }
      );
      ordersFixed++;
    }
  }

  console.log('\n─────────────────────────────────────────');
  console.log('✅  Migration complete!');
  console.log(`   Orders updated  : ${ordersFixed}`);
  console.log(`   Items backfilled: ${itemsFixed}`);
  console.log(`   Items not found : ${notFound} (product was deleted)`);
  console.log('─────────────────────────────────────────\n');

  await mongoose.disconnect();
  process.exit(0);
}

migrate().catch(err => {
  console.error('❌ Migration error:', err.message);
  process.exit(1);
});
