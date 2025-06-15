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
            id
            name
            normalizedName
          }
          map {
            id
            name
            normalizedName
          }
          experience
          wikiLink
          minPlayerLevel
          taskRequirements {
            task {
              id
              name
            }
            status
          }
          traderLevelRequirements {
            trader {
              id
              name
            }
            level
          }
          objectives {
            id
            type
            description
            optional
            ... on TaskObjectiveItem {
              item {
                id
                name
                shortName
              }
              count
              foundInRaid
            }
            ... on TaskObjectiveShoot {
              target
              count
              shotType
              zoneNames
              bodyParts {
                id
                name
              }
              usingWeapon {
                id
                name
              }
              usingWeaponMods {
                id
                name
              }
              wearing {
                id
                name
              }
              notWearing {
                id
                name
              }
              distance {
                compareMethod
                value
              }
              playerHealthEffect {
                bodyParts {
                  id
                  name
                }
                effects {
                  id
                  name
                }
              }
            }
            ... on TaskObjectiveMark {
              markerItem {
                id
                name
              }
            }
            ... on TaskObjectivePlayerLevel {
              playerLevel
            }
            ... on TaskObjectiveExtract {
              exitStatus
              zoneNames
            }
            ... on TaskObjectiveVisit {
              zoneNames
            }
            ... on TaskObjectiveUseItem {
              useAny {
                id
                name
              }
              compareMethod
              count
            }
          }
          finishRewards {
            traderStanding {
              trader {
                id
                name
              }
              standing
            }
            items {
              item {
                id
                name
                shortName
              }
              count
            }
            offerUnlock {
              trader {
                id
                name
              }
              level
              item {
                id
                name
              }
            }
            skillLevelReward {
              skill {
                id
                name
              }
              level
            }
            traderUnlock {
              id
              name
            }
          }
          startRewards {
            items {
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
          levels {
            level
            constructionTime
            description
            itemRequirements {
              item {
                id
                name
                shortName
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
          location {
            id
            name
          }
          resetTime
          currency {
            id
            name
          }
          discount
          levels {
            level
            requiredPlayerLevel
            requiredReputation
            requiredCommerce
            payRate
            insuranceRate
            repairCostMultiplier
            barters {
              id
              trader {
                name
              }
              level
              taskUnlock {
                id
                name
              }
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
            cashOffers {
              item {
                id
                name
                shortName
              }
              minTraderLevel
              price
              currency
              priceRUB
              taskUnlock {
                id
                name
              }
            }
          }
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