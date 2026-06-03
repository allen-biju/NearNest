import { Response } from 'express';
import { Order, Product, Seller, User } from '../models/Schemas';
import { AuthRequest, IAuthRequest } from '../middleware/auth';

// Simple helper to calculate distance in km on earth between two coordinates
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export const placeOrder = async (req: IAuthRequest, res: Response) => {
  try {
    const { items, deliveryAddress, deliveryMode, deliverySlot, paymentMethod, useWallet } = req.body;

    if (!items || !items.length || !deliveryAddress || !deliveryMode || !paymentMethod) {
      return res.status(400).json({ success: false, error: { code: 'BAD_REQUEST', message: 'Incomplete order checkout details' } });
    }

    if (!req.user) return res.status(401);

    // Group items by Seller to support split orders
    const sellerItemsMap = new Map<string, any[]>();
    for (const item of items) {
      const prod = await Product.findById(item.productId);
      if (!prod) {
        return res.status(400).json({ success: false, error: { code: 'BAD_REQUEST', message: `Product ${item.title} no longer exists` } });
      }
      if (prod.stock < item.quantity && !prod.isUnlimitedStock) {
        return res.status(400).json({ success: false, error: { code: 'OUT_OF_STOCK', message: `Product ${prod.title} is out of stock` } });
      }

      const sellerIdStr = prod.sellerId.toString();
      if (!sellerItemsMap.has(sellerIdStr)) {
        sellerItemsMap.set(sellerIdStr, []);
      }
      sellerItemsMap.get(sellerIdStr)!.push({
        productId: prod._id,
        title: prod.title,
        image: prod.images[0],
        price: prod.price,
        quantity: item.quantity,
        subtotal: prod.price * item.quantity
      });
    }

    const createdOrders = [];
    let walletDeductionPool = useWallet ? req.user.walletBalance : 0;

    for (const [sellerIdStr, sellerItems] of sellerItemsMap.entries()) {
      const seller = await Seller.findById(sellerIdStr);
      if (!seller) continue;

      const itemsTotal = sellerItems.reduce((sum, item) => sum + item.subtotal, 0);

      // Distance calculation from user address to seller location
      const userCoords = deliveryAddress.location.coordinates; // [lng, lat]
      const sellerCoords = seller.location.coordinates;
      const distanceKm = calculateDistance(userCoords[1], userCoords[0], sellerCoords[1], sellerCoords[0]);

      // Calculate delivery fee
      let deliveryFee = 0;
      if (deliveryMode === 'delivery') {
        const base = seller.baseDeliveryFee || 20;
        const perKm = seller.perKmRate || 5;
        deliveryFee = base + Math.round(distanceKm * perKm);
        deliveryFee = Math.min(deliveryFee, seller.maxDeliveryFee || 80);
        if (seller.freeDeliveryAbove && itemsTotal >= seller.freeDeliveryAbove) {
          deliveryFee = 0;
        }
      }

      const platformFee = 5; // Flat 5 INR platform fee
      let discount = 0;

      // Apply wallet discount if checked
      let walletApplied = 0;
      if (walletDeductionPool > 0) {
        const orderSubtotal = itemsTotal + deliveryFee + platformFee;
        walletApplied = Math.min(walletDeductionPool, orderSubtotal);
        walletDeductionPool -= walletApplied;
        discount += walletApplied;
      }

      const total = itemsTotal + deliveryFee + platformFee - discount;

      // Revenue shares
      const commissionAmount = Math.round(itemsTotal * (seller.commissionRate || 0.10));
      const sellerEarnings = itemsTotal + deliveryFee - commissionAmount;

      const orderNumber = `NN-${new Date().toISOString().slice(0,10).replace(/-/g,'')}-${Math.floor(1000 + Math.random() * 9000)}`;

      const order = new Order({
        orderNumber,
        buyerId: req.user._id,
        sellerId: seller._id,
        items: sellerItems,
        itemsTotal,
        deliveryFee,
        platformFee,
        discount,
        total,
        commissionAmount,
        sellerEarnings,
        deliveryAddress: {
          addressLine: deliveryAddress.addressLine,
          city: deliveryAddress.city,
          state: deliveryAddress.state,
          pincode: deliveryAddress.pincode,
          location: {
            type: 'Point',
            coordinates: [Number(userCoords[0]), Number(userCoords[1])] as [number, number]
          }
        },
        deliveryMode,
        deliverySlot,
        status: 'placed',
        statusHistory: [{ status: 'placed', note: 'Order placed by buyer' }],
        paymentStatus: paymentMethod === 'COD' ? 'pending' : 'paid',
        paymentMethod
      });

      await order.save();
      createdOrders.push(order);

      // Update product stocks
      for (const item of sellerItems) {
        await Product.findByIdAndUpdate(item.productId, {
          $inc: { stock: -item.quantity, totalOrders: item.quantity }
        });
      }

      // Update seller stats
      seller.totalOrders += 1;
      await seller.save();
    }

    // Deduct user wallet if applied
    if (useWallet && walletDeductionPool !== req.user.walletBalance) {
      req.user.walletBalance = walletDeductionPool;
      await req.user.save();
    }

    res.status(201).json({
      success: true,
      data: createdOrders,
      message: 'Orders placed successfully!'
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
};

export const getBuyerOrders = async (req: IAuthRequest, res: Response) => {
  try {
    const orders = await Order.find({ buyerId: req.user?._id })
      .populate('sellerId')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: orders });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
};

export const getSellerOrders = async (req: IAuthRequest, res: Response) => {
  try {
    const seller = await Seller.findOne({ userId: req.user?._id });
    if (!seller) {
      return res.status(403).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Seller profile not found' } });
    }

    const orders = await Order.find({ sellerId: seller._id })
      .populate('buyerId')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: orders });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
};

export const updateOrderStatus = async (req: IAuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status, note } = req.body;

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Order not found' } });
    }

    // Verify seller ownership or admin status
    const seller = await Seller.findOne({ userId: req.user?._id });
    const isSellerOwner = seller && order.sellerId.toString() === seller._id.toString();
    const isAdmin = req.user?.role.includes('admin') || req.user?.role.includes('superadmin');

    if (!isSellerOwner && !isAdmin) {
      return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Unauthorized status transition' } });
    }

    order.status = status;
    order.statusHistory.push({ status, timestamp: new Date(), note });
    
    // If order is completed/delivered, add to seller revenue
    if (status === 'delivered') {
      order.paymentStatus = 'paid';
      if (seller) {
        seller.totalRevenue += order.sellerEarnings;
        await seller.save();
      }
    }

    await order.save();

    res.status(200).json({
      success: true,
      data: order,
      message: `Order status updated to: ${status}`
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
};

export const cancelOrder = async (req: IAuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Order not found' } });
    }

    // Buyers can only cancel if status is 'placed'
    const isBuyer = order.buyerId.toString() === req.user?._id.toString();
    if (isBuyer && order.status !== 'placed') {
      return res.status(400).json({ success: false, error: { code: 'BAD_REQUEST', message: 'Orders can only be cancelled within 5 mins of placing' } });
    }

    order.status = 'cancelled';
    order.cancelReason = reason || 'Cancelled by user';
    order.statusHistory.push({ status: 'cancelled', timestamp: new Date(), note: reason });

    // Restore stock
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.productId, { $inc: { stock: item.quantity } });
    }

    // Refund wallet balance if applied
    if (order.discount > 0 && isBuyer && req.user) {
      req.user.walletBalance += order.discount;
      await req.user.save();
    }

    await order.save();

    res.status(200).json({
      success: true,
      data: order,
      message: 'Order cancelled successfully'
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
};
