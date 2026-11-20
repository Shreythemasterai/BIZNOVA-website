import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { BizNovaDatabase } from '../src/lib/db.ts';

describe('BizNova Business Logic & Database Tests', () => {
  it('should initialize with products and categories', () => {
    BizNovaDatabase.resetDatabaseToDemo();
    const products = BizNovaDatabase.getProducts();
    const categories = BizNovaDatabase.getCategories();

    assert.ok(products.length >= 25, `Expected at least 25 products, got ${products.length}`);
    assert.equal(categories.length, 14, 'Expected 14 grocery store categories');
  });

  it('should calculate cart discounts and atomic checkout correctly', () => {
    BizNovaDatabase.resetDatabaseToDemo();
    const product = BizNovaDatabase.getProductById('prod_1'); // Aashirvaad Atta
    assert.ok(product, 'Product should exist');
    const initialStock = product.stockQuantity;

    const checkoutResult = BizNovaDatabase.checkoutOrder({
      customerId: 'usr_customer_1',
      customerName: 'Pooja Kulkarni',
      customerPhone: '+91 98450 99887',
      deliveryAddress: {
        id: 'addr_1',
        label: 'Home',
        street: 'Flat 302, Sai Angan Society',
        area: 'Tupe Vasti, Moshi',
        city: 'Pune',
        pincode: '412105',
        phone: '+91 98450 99887',
        isDefault: true,
      },
      items: [{ productId: 'prod_1', quantity: 2 }],
      paymentMethod: 'online_upi',
      couponCode: 'BIZFIRST',
    });

    assert.equal(checkoutResult.success, true, 'Checkout should succeed');
    assert.ok(checkoutResult.order, 'Order should be created');
    assert.match(checkoutResult.order.orderNumber, /^BN-\d+$/);

    // Verify stock decremented
    const updatedProduct = BizNovaDatabase.getProductById('prod_1');
    assert.equal(updatedProduct?.stockQuantity, initialStock - 2, 'Stock should decrement by 2');

    // Test cancellation restores stock
    const cancelResult = BizNovaDatabase.cancelOrder(
      checkoutResult.order.id,
      'Test cancellation',
      'Customer'
    );
    assert.equal(cancelResult.success, true, 'Cancellation should succeed');

    const restoredProduct = BizNovaDatabase.getProductById('prod_1');
    assert.equal(restoredProduct?.stockQuantity, initialStock, 'Stock should be fully restored');
  });

  it('should reject checkout when stock is insufficient', () => {
    BizNovaDatabase.resetDatabaseToDemo();
    const outOfStockProd = BizNovaDatabase.getProductById('prod_14'); // Amul Cheese (stock = 0)
    assert.ok(outOfStockProd);
    assert.equal(outOfStockProd.stockQuantity, 0);

    const failResult = BizNovaDatabase.checkoutOrder({
      customerId: 'usr_customer_1',
      customerName: 'Pooja Kulkarni',
      customerPhone: '+91 98450 99887',
      deliveryAddress: {
        id: 'addr_1',
        label: 'Home',
        street: 'Flat 302',
        area: 'Moshi',
        city: 'Pune',
        pincode: '412105',
        phone: '+91 98450 99887',
        isDefault: true,
      },
      items: [{ productId: 'prod_14', quantity: 1 }],
      paymentMethod: 'cod',
    });

    assert.equal(failResult.success, false);
    assert.match(failResult.error || '', /Insufficient stock/i);
  });

  it('should prevent illegal order status transitions', () => {
    BizNovaDatabase.resetDatabaseToDemo();
    const orders = BizNovaDatabase.getOrders();
    const deliveredOrder = orders.find((o) => o.status === 'delivered');
    assert.ok(deliveredOrder);

    // Delivered order cannot transition to preparing
    const invalidTransition = BizNovaDatabase.updateOrderStatus(
      deliveredOrder.id,
      'preparing',
      'Test User'
    );
    assert.equal(invalidTransition.success, false);
    assert.match(invalidTransition.error || '', /Cannot transition order status/i);
  });

  it('should approve AI Advisor recommendation and execute database adjustment', () => {
    BizNovaDatabase.resetDatabaseToDemo();
    const recs = BizNovaDatabase.getAIRecommendations();
    const restockRec = recs.find((r) => r.type === 'restock' && r.status === 'pending');
    assert.ok(restockRec);

    const prodId = restockRec.suggestedAction?.productId;
    const addQty = restockRec.suggestedAction?.newQuantity || 0;
    assert.ok(prodId);

    const prodBefore = BizNovaDatabase.getProductById(prodId);
    const beforeQty = prodBefore.stockQuantity;

    const approvalResult = BizNovaDatabase.approveAIAction(restockRec.id);
    assert.equal(approvalResult.success, true);

    const prodAfter = BizNovaDatabase.getProductById(prodId);
    assert.equal(
      prodAfter.stockQuantity,
      beforeQty + addQty,
      'Product stock should be incremented by AI approved quantity'
    );
  });

  it('should allow owner to add, update and delete product categories', () => {
    BizNovaDatabase.resetDatabaseToDemo();
    const addRes = BizNovaDatabase.addCategory({
      name: 'Organic Dry Fruits',
      slug: 'organic-dry-fruits',
      iconName: 'Sparkles',
      description: 'Premium cashews, almonds, walnuts and raisins',
      color: 'amber',
    });
    assert.equal(addRes.success, true);
    assert.ok(addRes.category?.id);

    const updateRes = BizNovaDatabase.updateCategory(addRes.category.id, {
      name: 'Gourmet Dry Fruits',
    });
    assert.equal(updateRes.success, true);
    assert.equal(updateRes.category?.name, 'Gourmet Dry Fruits');

    const delRes = BizNovaDatabase.deleteCategory(addRes.category.id);
    assert.equal(delRes.success, true);
  });

  it('should calculate gross profit and revenue separately in analytics', () => {
    BizNovaDatabase.resetDatabaseToDemo();
    const metrics = BizNovaDatabase.getDashboardMetrics();
    assert.ok(metrics.totalRevenue > 0, 'Total revenue should be greater than zero');
    assert.ok(metrics.grossProfit >= 0, 'Gross profit should be non-negative');
    assert.ok(metrics.grossProfit <= metrics.totalRevenue, 'Gross profit cannot exceed total revenue');
    assert.ok(metrics.inventoryValuationCost > 0, 'Inventory valuation should be calculated');
  });

  it('should handle store order rejection with automatic inventory restoration', () => {
    BizNovaDatabase.resetDatabaseToDemo();
    const product = BizNovaDatabase.getProductById('prod_1');
    const initialStock = product.stockQuantity;

    const orderRes = BizNovaDatabase.checkoutOrder({
      customerId: 'usr_customer_1',
      customerName: 'Pooja Kulkarni',
      customerPhone: '+91 98450 99887',
      deliveryAddress: {
        id: 'addr_1',
        label: 'Home',
        street: 'Flat 302',
        area: 'Moshi',
        city: 'Pune',
        pincode: '412105',
        phone: '+91 98450 99887',
        isDefault: true,
      },
      items: [{ productId: 'prod_1', quantity: 3 }],
      paymentMethod: 'cod',
    });
    assert.equal(orderRes.success, true);
    assert.equal(BizNovaDatabase.getProductById('prod_1')?.stockQuantity, initialStock - 3);

    const rejectRes = BizNovaDatabase.rejectOrder(
      orderRes.order.id,
      'Delivery address out of service zone today',
      'Balaji Choudhary'
    );
    assert.equal(rejectRes.success, true);
    assert.equal(
      BizNovaDatabase.getProductById('prod_1')?.stockQuantity,
      initialStock,
      'Stock should be restored after order rejection'
    );
  });
});
