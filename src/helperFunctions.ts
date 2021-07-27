export const fetchGraphQL = async (schema: String, variables: Object = {}) => {
    var graphql = JSON.stringify({
        query: schema,
        variables
    })
    var requestOptions = {
        method: 'POST',
        headers: {
            'content-type': 'application/json',
            'x-hasura-admin-secret': 'secret'
        },
        body: graphql,
    };
    const database_url = 'https://voon-demo.herokuapp.com/v1/graphql'
    const res = await fetch(database_url, requestOptions).then((res:any) => res.json())
    return res
}

export const wait = (ms: number): Promise<boolean> => new Promise(resolve => setTimeout(resolve, ms, true))