import { http, createPublicClient, parseAbiItem, stringify } from 'viem'
import { mainnet } from 'viem/chains'

const client = createPublicClient({
  chain: mainnet,
  transport: http(),
})

const el = document.getElementById('app')

const event = parseAbiItem(
  'event DepositSuccessful(address indexed user, address indexed token, uint256 amount)',
)

// event SavedSuccessfully(address indexed user, address indexed token, uint256 amount, uint256 duration);
// event Withdrawn(address indexed user, address tokenType, uint256 amount);

// Get initial event logs (last 20 blocks)
const blockNumber = await client.getBlockNumber()
const logs = await client.getLogs({
  event,
  fromBlock: blockNumber - 20n,
  toBlock: blockNumber,
})
el!.innerHTML = `Logs for NameRegistered from block ${
  blockNumber - 20n
} to ${blockNumber}: <pre><code>${stringify(logs, null, 2)}</code></pre>`

// Watch for new event logs
client.watchEvent({
  event,
  onLogs: (logs) => {
    el!.innerHTML = `Logs for NameRegistered at block ${
      logs[0].blockNumber
    }: <pre><code>${stringify(logs, null, 2)}</code></pre>`
  },
})