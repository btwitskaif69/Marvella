const { prisma } = require('../db/prisma');

async function listProducts(_req, res, next) {
  try {
    const products = await prisma.product.findMany({
      include: { shades: { include: { inventory: true } }, images: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json(products);
  } catch (e) { next(e); }
}

async function createProduct(req, res, next) {
  try {
    const {
      name, slug, description, finish, basePrice,
      shades = [], images = [],
    } = req.body;

    const product = await prisma.product.create({
      data: {
        name, slug, description, finish,
        basePrice: String(basePrice),
        images: { create: images.map(url => ({ url })) },
        shades: {
          create: shades.map(s => ({
            name: s.name,
            hexColor: s.hexColor,
            sku: s.sku,
            price: s.price != null ? String(s.price) : undefined,
            inventory: s.quantity != null ? { create: { quantity: s.quantity } } : undefined,
          })),
        },
      },
      include: { shades: { include: { inventory: true } }, images: true },
    });

    res.status(201).json(product);
  } catch (e) { next(e); }
}

module.exports = { listProducts, createProduct };
