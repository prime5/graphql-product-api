const { ApolloServer } = require('apollo-server-express');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const typeDefs = require('../src/schema/typeDefs');
const resolvers = require('../src/resolvers');
const Product = require('../src/models/Product');
const gql = require('graphql-tag');

let mongoServer;
let server;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();

  await mongoose.connect(uri);

  server = new ApolloServer({ typeDefs, resolvers });
  await server.start();
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
  await server.stop();
});
const ADD_PRODUCT = gql`
  mutation AddProduct($input: ProductInput!) {
    addProduct(input: $input) {
      id
      name
      price
    }
  }
`;

const GET_PRODUCTS = gql`
  query {
    products {
      id
      name
      price
    }
  }
`;

it('should add and fetch a product', async () => {
  const result = await server.executeOperation({
    query: ADD_PRODUCT,
    variables: {
      input: {
        name: "Test Product",
        price: 10.5,
        description: "Test desc",
        category: "Test Cat"
      }
    }
  });

  expect(result.errors).toBeUndefined();
  expect(result.data.addProduct.name).toBe("Test Product");

  const fetch = await server.executeOperation({ query: GET_PRODUCTS });
  expect(fetch.data.products.length).toBe(1);
});

const UPDATE_PRODUCT = gql`
  mutation UpdateProduct($id: ID!, $input: ProductInput!) {
    updateProduct(id: $id, input: $input) {
      id
      name
      price
    }
  }
`;

const DELETE_PRODUCT = gql`
  mutation DeleteProduct($id: ID!) {
    deleteProduct(id: $id) {
      id
      name
    }
  }
`;

let productId; // to be shared between tests

it('should add a product and store its ID', async () => {
  const res = await server.executeOperation({
    query: ADD_PRODUCT,
    variables: {
      input: {
        name: "GraphQL Pen",
        price: 4.99,
        description: "A pen for GraphQL fans",
        category: "Merch"
      }
    }
  });

  expect(res.errors).toBeUndefined();
  expect(res.data.addProduct.name).toBe("GraphQL Pen");
  productId = res.data.addProduct.id;
});

it('should update the product name', async () => {
  const res = await server.executeOperation({
    query: UPDATE_PRODUCT,
    variables: {
      id: productId,
      input: {
        name: "Updated Pen",
        price: 4.99,
        description: "Updated desc",
        category: "Updated"
      }
    }
  });

  expect(res.errors).toBeUndefined();
  expect(res.data.updateProduct.name).toBe("Updated Pen");
});

it('should delete the product', async () => {
  const res = await server.executeOperation({
    query: DELETE_PRODUCT,
    variables: { id: productId }
  });

  expect(res.errors).toBeUndefined();
  expect(res.data.deleteProduct.name).toBe("Updated Pen");
});

it('should return empty list after deletion', async () => {
  const res = await server.executeOperation({
    query: GET_PRODUCTS
  });

  expect(res.errors).toBeUndefined();
  expect(res.data.products.length).toBe(1);
  expect(res.data.products[0].name).toBe("Test Product");
});
