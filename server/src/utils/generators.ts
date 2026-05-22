/**
 * Generate unique order number in format: NNO-YYYYMMDD-XXXXX
 */
export const generateOrderNumber = async (Counter: any): Promise<string> => {
  const today = new Date();
  const dateStr = today.toISOString().split('T')[0].replace(/-/g, '');

  const counter = await Counter.findByIdAndUpdate(
    'order_count',
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );

  const paddedSeq = String(counter.seq).padStart(5, '0');
  return `NNO-${dateStr}-${paddedSeq}`;
};

/**
 * Generate unique referral code
 */
export const generateReferralCode = (userId: string): string => {
  const randomSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `NR${randomSuffix}${userId.slice(-4).toUpperCase()}`;
};

/**
 * Generate unique seller slug from business name
 */
export const generateSlug = (text: string, id?: string): string => {
  let slug = text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();

  if (id) {
    slug = `${slug}-${id.slice(-6)}`;
  }

  return slug;
};
