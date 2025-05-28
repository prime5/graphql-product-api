const { gql } = require('apollo-server-express');

module.exports = gql`
  type Product {
    id: ID!
    name: String!
    price: Float!
    description: String
    category: String
  }

  input ProductInput {
    name: String!
    price: Float!
    description: String
    category: String
  }

  type Query {
    products: [Product]
    product(id: ID!): Product
  }

  type Mutation {
    addProduct(input: ProductInput!): Product
    updateProduct(id: ID!, input: ProductInput!): Product
    deleteProduct(id: ID!): Product
  }
`;
