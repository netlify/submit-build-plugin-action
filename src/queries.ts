const repositories = `
  query repos($cursor: String) {
    viewer {
      repositories(first:100, after: $cursor, affiliations: [OWNER, COLLABORATOR, ORGANIZATION_MEMBER], ownerAffiliations: [OWNER, COLLABORATOR, ORGANIZATION_MEMBER]) {
        nodes{
          nameWithOwner
        }
        pageInfo{
          hasNextPage
          endCursor
        }
      }
    }
  }
`

const labels = `
  query labels($owner: String!, $name: String!, $cursor:String) {
    repository(owner: $owner, name: $name) {
      labels(first:100, after:$cursor) {
        nodes{
          name
          description
          color
          isDefault
        }
        pageInfo{
          hasNextPage
          endCursor
        }
      }
    }
  }
`

export const queries = { repositories, labels }
