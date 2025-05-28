const Product = require('../models/Product');

module.exports = {
  Query: {
    products: async () => await Product.find(),
    product: async (_, { id }) => await Product.findById(id)
  },
  Mutation: {
    addProduct: async (_, { input }) => {
      const product = new Product(input);
      return await product.save();
    },
    updateProduct: async (_, { id, input }) => {
      return await Product.findByIdAndUpdate(id, input, { new: true });
    },
    deleteProduct: async (_, { id }) => {
      return await Product.findByIdAndDelete(id);
    }
  }
};
