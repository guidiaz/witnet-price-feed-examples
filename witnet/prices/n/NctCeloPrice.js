import * as Witnet from "witnet-requests"

// Retrieve NCT/CELO-6 price from the UniswapV3 DEX API:
const uniswap = new Witnet.GraphQLSource(
    "https://api.thegraph.com/subgraphs/name/jesse-sawa/uniswap-celo",
    `{
      pool (id: "0xdb24905b1b080f65dedb0ad978aad5c76363d3c6") {
        token1Price
      }
    }`,
  )
  .parseJSONMap()
  .getMap("data")
  .getMap("pool")
  .getFloat("token1Price") // Get the `Float` value associated to the `price` key
  .multiply(10 ** 6) // Use 6 digit precision
  .round() // Cast to integer

// Filters out any value that is more than 1.5 times the standard
// deviation away from the average, then computes the average mean of the
// values that pass the filter.
const aggregator = new Witnet.Aggregator({
  filters: [
    [Witnet.Types.FILTERS.deviationStandard, 1.5],
  ],
  reducer: Witnet.Types.REDUCERS.averageMean,
})

// Filters out any value that is more than 2.5 times the standard
// deviation away from the average, then computes the average mean of the
// values that pass the filter.
const tally = new Witnet.Tally({
  filters: [
    [Witnet.Types.FILTERS.deviationStandard, 2.5],
  ],
  reducer: Witnet.Types.REDUCERS.averageMean,
})

// This is the Witnet.Request object that needs to be exported
const request = new Witnet.Request()
  .addSource(uniswap)
  .setAggregator(aggregator) // Set the aggregator function
  .setTally(tally) // Set the tally function
  .setQuorum(10, 51) // Set witness count and minimum consensus percentage
  .setFees(10 ** 6, 10 ** 6) // Set economic incentives
  .setCollateral(5 * 10 ** 9) // Require 5 wits as collateral

// Do not forget to export the request object
export { request as default }
