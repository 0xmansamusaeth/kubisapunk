# KubisaPunk Smart Contract

A Solidity smart contract for Web3 reputation and event check-in tracking on Base Network.

## Features

- ✅ User profile management with reputation metrics
- ✅ Connection tracking between users
- ✅ Badge and community progression
- ✅ Event creation and management
- ✅ QR code check-in attendance tracking
- ✅ Wallet-based authentication
- ✅ Events and state management

## Contract Overview

### Structs

#### Profile
```solidity
struct Profile {
    uint256 joinDate;
    uint256 connections;
    uint256 communities;
    uint256 eventsAttended;
    uint256 badgesEarned;
}
```

#### Event
```solidity
struct Event {
    string name;
    address organizer;
    uint256 date;
}
```

### Key Functions

#### User Management
- `registerUser()` - Register a new user
- `getProfile(address user)` - Get user profile
- `isRegistered(address user)` - Check if user is registered
- `addConnection(address otherUser)` - Add a connection
- `incrementBadge(address user)` - Award a badge
- `incrementCommunity(address user)` - Join a community

#### Event Management
- `createEvent(string memory name)` - Create a new event
- `getEvent(uint256 eventId)` - Get event details
- `checkIn(uint256 eventId)` - Check in to an event
- `hasCheckedIn(uint256 eventId, address user)` - Verify check-in status

## Setup

### Prerequisites
- Node.js 16+
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

3. Add your configuration to `.env`:
```
BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
PRIVATE_KEY=your_wallet_private_key
```

## Development

### Compile Contract
```bash
npm run compile
```

### Run Tests
```bash
npm test
```

### Local Node
```bash
npm run node
```

## Deployment

### Deploy to Base Sepolia
```bash
npm run deploy
```

### Deploy to Localhost
```bash
npm run deploy:local
```

## Testing

Comprehensive test suite covering:
- User registration
- Duplicate prevention
- Connection management
- Badge and community tracking
- Event creation
- Event check-in
- Duplicate check-in prevention
- Integration tests

```bash
npm test
```

## Contract Events

- `UserRegistered(address indexed user, uint256 joinDate)`
- `ConnectionAdded(address indexed userA, address indexed userB)`
- `BadgeEarned(address indexed user, uint256 newBadgeCount)`
- `CommunityJoined(address indexed user, uint256 newCommunityCount)`
- `EventCreated(uint256 indexed eventId, string name, address indexed organizer, uint256 date)`
- `CheckedIn(uint256 indexed eventId, address indexed user)`

## Security Considerations

- Register-once protection
- Duplicate check-in prevention
- Event validation
- Address zero checks
- Solidity ^0.8.20 for overflow protection

## Contract Size

The contract is optimized for efficient deployment with 200 optimizer runs.

## Future Enhancements

- NFT badge integration
- Reputation scoring system
- Token rewards
- DAO governance
- Advanced analytics

## License

MIT

## Deployment Info

- **Network**: Base Sepolia (Testnet)
- **Chain ID**: 84532
- **RPC**: https://sepolia.base.org
- **Block Explorer**: https://sepolia.basescan.org

## Support

For issues or questions, please refer to the test file for usage examples.

```shell
npx hardhat test
```

You can also selectively run the Solidity or `mocha` tests:

```shell
npx hardhat test solidity
npx hardhat test mocha
```

### Make a deployment to Sepolia

This project includes an example Ignition module to deploy the contract. You can deploy this module to a locally simulated chain or to Sepolia.

To run the deployment to a local chain:

```shell
npx hardhat ignition deploy ignition/modules/Counter.ts
```

To run the deployment to Sepolia, you need an account with funds to send the transaction. The provided Hardhat configuration includes a Configuration Variable called `SEPOLIA_PRIVATE_KEY`, which you can use to set the private key of the account you want to use.

You can set the `SEPOLIA_PRIVATE_KEY` variable using the `hardhat-keystore` plugin or by setting it as an environment variable.

To set the `SEPOLIA_PRIVATE_KEY` config variable using `hardhat-keystore`:

```shell
npx hardhat keystore set SEPOLIA_PRIVATE_KEY
```

After setting the variable, you can run the deployment with the Sepolia network:

```shell
npx hardhat ignition deploy --network sepolia ignition/modules/Counter.ts
```
