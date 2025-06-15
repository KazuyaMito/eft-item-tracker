export const useTarkovAPI = () => {
  const API_URL = 'https://api.tarkov.dev/graphql'

  const executeQuery = async (query: string, variables?: any) => {
    try {
      const response = await $fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          variables,
        }),
      })
      return response
    } catch (error) {
      console.error('Tarkov API query failed:', error)
      throw error
    }
  }

  const getItems = async () => {
    const query = `
      query {
        items {
          id
          name
          shortName
          normalizedName
          iconLink
          types
          category {
            id
            name
          }
          avg24hPrice
          basePrice
          fleaMarketFee
          width
          height
          weight
          sellFor {
            source
            price
            currency
            priceRUB
          }
        }
      }
    `
    const response = await executeQuery(query)
    return response.data?.items || []
  }

  const getTasks = async () => {
    const query = `
      query {
        tasks {
          id
          name
          normalizedName
          trader {
            name
          }
          experience
          wikiLink
          minPlayerLevel
          taskRequirements {
            task {
              id
              name
            }
          }
          traderRequirements {
            trader {
              name
            }
            level
          }
          objectives {
            type
            description
            ... on TaskObjectiveItem {
              item {
                id
                name
                iconLink
              }
              count
              foundInRaid
            }
          }
          finishRewards {
            traderStanding {
              trader {
                name
              }
              standing
            }
            items {
              item {
                id
                name
              }
              count
            }
          }
        }
      }
    `
    const response = await executeQuery(query)
    return response.data?.tasks || []
  }

  const getHideout = async () => {
    const query = `
      query {
        hideoutStations {
          id
          name
          normalizedName
          imageLink
          levels {
            level
            constructionTime
            description
            itemRequirements {
              item {
                id
                name
                shortName
                iconLink
              }
              count
            }
            stationLevelRequirements {
              station {
                id
                name
              }
              level
            }
            skillRequirements {
              skill {
                id
                name
              }
              level
            }
            traderRequirements {
              trader {
                id
                name
              }
              level
            }
            crafts {
              id
              duration
              requiredItems {
                item {
                  id
                  name
                  shortName
                }
                count
              }
              rewardItems {
                item {
                  id
                  name
                  shortName
                }
                count
              }
            }
          }
        }
      }
    `
    const response = await executeQuery(query)
    return response.data?.hideoutStations || []
  }

  const getTraders = async () => {
    const query = `
      query {
        traders {
          id
          name
          normalizedName
          description
          imageLink
          image4xLink
        }
      }
    `
    const response = await executeQuery(query)
    return response.data?.traders || []
  }

  return {
    executeQuery,
    getItems,
    getTasks,
    getHideout,
    getTraders,
  }
}