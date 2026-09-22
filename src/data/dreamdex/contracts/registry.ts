/**
 * Verified dreamDEX Smart Contract Registry for Somnia Mainnet (5031) and Testnet Shannon (50312).
 * Sourced from official developer documentation:
 * https://docs.dreamdex.io/developers/contracts/contract-specifications
 * https://docs.dreamdex.io/developers/contracts/spot-router
 * https://docs.dreamdex.io/developers/contracts/events
 */

export interface SpotMarketContractInfo {
  symbol: string;
  baseToken: string;
  quoteToken: string;
  spotPoolAddress: `0x${string}`;
  stopRegistryAddress: `0x${string}`;
  isNativeBase: boolean;
}

export const MAINNET_CHAIN_ID = 5031;
export const TESTNET_CHAIN_ID = 50312;

export const SOMNIA_RPC_MAINNET_URL = "https://api.infra.mainnet.somnia.network";
export const SOMNIA_RPC_TESTNET_URL = "https://dream-rpc.somnia.network";

export const SOMNIA_EXPLORER_MAINNET_URL = "https://explorer.somnia.network";
export const SOMNIA_EXPLORER_TESTNET_URL = "https://shannon-explorer.somnia.network";

export const SOMNIA_ACTIVE_CHAIN_ID = MAINNET_CHAIN_ID;
export const SOMNIA_ACTIVE_RPC_URL = SOMNIA_RPC_MAINNET_URL;
export const SOMNIA_ACTIVE_EXPLORER_URL = SOMNIA_EXPLORER_MAINNET_URL;

export const MAINNET_ROUTER_CONTRACTS = {
  spotRouter: "0x780672aDA90Ed7cf2C3E8B70DBa87A19d584c8B0" as `0x${string}`,
  spotPoolRegistry: "0xB601bc1099B040E4882089D94690F7C38AF4CCD2" as `0x${string}`,
  operatorPermissionsRegistry: "0xE7a190736B6024a4DbafadC04E283075877005ce" as `0x${string}`,
};

export const TESTNET_ROUTER_CONTRACTS = {
  spotRouter: "0x0aA7c584074d2EA5B623772F97928baD23915ba8" as `0x${string}`,
  spotPoolRegistry: "0x07A29A0A086Bc8262a9320db93E603eE13D57962" as `0x${string}`,
  operatorPermissionsRegistry: "0x15C7e8CE38F021c5b45d098AaD788f63090bF20A" as `0x${string}`,
};

export const MAINNET_SPOT_MARKETS: SpotMarketContractInfo[] = [
  {
    symbol: "SOMI:USDso",
    baseToken: "SOMI",
    quoteToken: "USDso",
    spotPoolAddress: "0x035De7403eac6872787779CCA7CCF1b4CDb61379",
    stopRegistryAddress: "0x68c8f6fb1EA19A28F25358Ff00b8Ed8E1216df30",
    isNativeBase: true,
  },
  {
    symbol: "USDC.e:USDso",
    baseToken: "USDC.e",
    quoteToken: "USDso",
    spotPoolAddress: "0x47fD2f18426f67106DBaC82F6d21D446c5F2120b",
    stopRegistryAddress: "0xD53E3F3b73513F2147377ef8f573f649cF60100c",
    isNativeBase: false,
  },
  {
    symbol: "WBTC:USDso",
    baseToken: "WBTC",
    quoteToken: "USDso",
    spotPoolAddress: "0x25bfF6B7B5E2243424F38E75de7ab03C0522a5EA",
    stopRegistryAddress: "0xed32F048D6a47923D38eCeD868d6f8b0eB4852bd",
    isNativeBase: false,
  },
  {
    symbol: "WETH:USDso",
    baseToken: "WETH",
    quoteToken: "USDso",
    spotPoolAddress: "0xa936da11B57b50A344e1293AAaE5232885ea2bDE",
    stopRegistryAddress: "0x9653a7355849B7691802A6AA49fDe18eF5ba633d",
    isNativeBase: false,
  },
];

export const TESTNET_SPOT_MARKETS: SpotMarketContractInfo[] = [
  {
    symbol: "SOMI:USDso",
    baseToken: "SOMI",
    quoteToken: "USDso",
    spotPoolAddress: "0x259fD6559214dd5aD3752322426eA9F9fABEFff4",
    stopRegistryAddress: "0xEb97349Aa62A68507c0bE535eD88B0d028a47E1e",
    isNativeBase: true,
  },
  {
    symbol: "WBTC:USDso",
    baseToken: "WBTC",
    quoteToken: "USDso",
    spotPoolAddress: "0x3605f28aA7C50e7441211e77Cb0762d49539326C",
    stopRegistryAddress: "0x53d5B2b0791b3992a1F3b5e0b0277Ee2e08B7aaD",
    isNativeBase: false,
  },
  {
    symbol: "WETH:USDso",
    baseToken: "WETH",
    quoteToken: "USDso",
    spotPoolAddress: "0xD180195da5459C7a0DEA188ed61216ec43682b50",
    stopRegistryAddress: "0xf822D4Cb94902d667c9650e702aA5f096cc7598F",
    isNativeBase: false,
  },
];

export const SPOT_EVENT_TOPICS = {
  OrderPlaced: "0xd90f62f61ee2f606b132cfdfd883ddd079228b6fd6bffd9d7cf848daf824639d",
  OrderRested: "0xcdd45acd62788abc10f79d86fac34df2a63e1a3b20f061c5bcf431ff6a09b866",
  OrderFilled: "0xc87f4223e9e7c4e4f39f9b34fc9d64d78cdb95d9035b3748cbde59521261a399",
  OrderCancelled: "0x06ff08ed6b6987bb7df963009d8b54dc03988f4e465c009924929bb010fe03e7",
  OrderExpired: "0x6003d149bc2c6baa0780d4302ad5f925fef5715780d3b6f7d2da5476548da101",
  OrderReduced: "0xf6871493c13434b4a7fa02b5540fb6188e8db3f63e6b7013db073e9535b5a860",
} as const;
