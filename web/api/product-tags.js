import shopify from "../shopify.js";

// GraphQL API calls used in this template
// shopify.api.rest exists for REST API calls

export async function getTags(req, res) {
  const client = new shopify.api.clients.Graphql({
    session: res.locals.shopify.session,
  });

  const response = await client.query({
    data: {
      query: GET_TAGS_QUERY,
    },
  });

  const tags =
    response?.body?.data?.shop?.productTags?.edges?.map((edge) => edge.node) ||
    [];

  res.status(200).send({ success: true, tags: tags });
}

export async function addTags(req, res) {
  const client = new shopify.api.clients.Graphql({
    session: res.locals.shopify.session,
  });

  // each product gets its own request
  const responses = await Promise.all(
    req.body.products.map((productId) =>
      client.query({
        data: {
          query: ADD_TAGS_QUERY,
          variables: {
            id: productId,
            tags: req.body.tags,
          },
        },
      })
    )
  );

  res.status(200).send({ success: true, tags: req.body.tags });
}

export async function deleteTags(req, res) {
  const client = new shopify.api.clients.Graphql({
    session: res.locals.shopify.session,
  });

  // each product gets its own request
  const responses = await Promise.all(
    req.body.products.map((productId) =>
      client.query({
        data: {
          query: REMOVE_TAGS_QUERY,
          variables: {
            id: productId,
            tags: req.body.tags,
          },
        },
      })
    )
  );

  res.status(200).send({ success: true, tags: req.body.tags });
}

const GET_TAGS_QUERY = `#graphql
  query getTags{
    shop {
      productTags(first: 50) {
        edges {
          node
        }
      }
    }
  }
`;

const ADD_TAGS_QUERY = `#graphql
  mutation tagsAdd($id: ID!, $tags: [String!]!) {
    tagsAdd(id: $id, tags: $tags) {
      node {
        id
      }
      userErrors {
        field
        message
      }
    }
  }
`;

const REMOVE_TAGS_QUERY = `#graphql
  mutation tagsRemove($id: ID!, $tags: [String!]!) {
    tagsRemove(id: $id, tags: $tags) {
      node {
        id
      }
      userErrors {
        field
        message
      }
    }
  }
`;
