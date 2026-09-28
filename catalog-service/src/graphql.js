const { buildSchema } = require('graphql');
const Restaurant = require('./restaurant');

const schema = buildSchema(`
  type Item { name: String!, description: String, price: Float! }
  type Restaurant { id: ID!, name: String!, address: String, menu: [Item!]! }
  type Query {
    restaurants: [Restaurant!]!
    restaurant(id: ID!): Restaurant
  }
`);

const toGql = (r) => r && { id: r.id, name: r.name, address: r.address, menu: r.menu };

const rootValue = {
  restaurants: async () => (await Restaurant.find()).map(toGql),
  restaurant: async ({ id }) => toGql(await Restaurant.findById(id)),
};

module.exports = { schema, rootValue };
