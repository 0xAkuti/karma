// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.21;

import "forge-std/Script.sol";
import "forge-std/console.sol";
import "../src/EmailDomainProver.sol";
import "../src/KarmaProofVerifier.sol";
import "../src/KarmaNFT.sol";

contract DeployVlayerContracts is Script {
    
    function run() external {
        // Start broadcasting transactions (private key is passed via --private-key flag)
        vm.startBroadcast();
        
        console.log("Deploying vlayer contracts...");
        console.log("Deployer address:", msg.sender);
        console.log("Chain ID:", vm.toString(block.chainid));
        console.log("Block number:", block.number);
        
        // Deploy EmailDomainProver first (no constructor parameters)
        EmailDomainProver prover = new EmailDomainProver();        
        // Deploy KarmaNFT        
        KarmaNFT karmaNFT = new KarmaNFT(msg.sender, "https://faucet.vlayer.xyz/api/xBadgeMeta?handle=");
        // Deploy KarmaProofVerifier with prover and karmaNFT addresses
        KarmaProofVerifier karmaVerifier = new KarmaProofVerifier(address(prover), address(karmaNFT));

        // Grant MINTER_ROLE to the verifier contract so it can mint NFTs
        karmaNFT.grantRoles(address(karmaVerifier), karmaNFT.MINTER_ROLE());
        
        // Verify deployment
        require(karmaVerifier.prover() == address(prover), "KarmaVerifier prover address mismatch");
        require(karmaVerifier.karmaNFT() == address(karmaNFT), "KarmaVerifier karmaNFT address mismatch");
        
        vm.stopBroadcast();
        
        // Log deployment information
        console.log("\n=== DEPLOYMENT SUCCESSFUL ===");
        console.log("");
        console.log("Network: %s (Chain ID: %s)", getNetworkName(block.chainid), vm.toString(block.chainid));
        console.log("");
        console.log("Contract Addresses:");
        console.log("EmailDomainProver:    %s", address(prover));
        console.log("KarmaProofVerifier:   %s", address(karmaVerifier)); 
        console.log("KarmaNFT:             %s", address(karmaNFT));
        console.log("");
        console.log("Add these to your app/.env.local file:");
        console.log("NEXT_PUBLIC_CHAIN_ID=%s", vm.toString(block.chainid));
        console.log("NEXT_PUBLIC_VLAYER_PROVER_CONTRACT_ADDRESS=%s", vm.toString(address(prover)));
        console.log("NEXT_PUBLIC_VLAYER_VERIFIER_CONTRACT_ADDRESS=%s", vm.toString(address(karmaVerifier)));        
        console.log("NEXT_PUBLIC_KARMA_NFT_CONTRACT=%s", vm.toString(address(karmaNFT)));
        
        if (block.chainid == 31337) {
            console.log("NEXT_PUBLIC_RPC_URL=http://127.0.0.1:8545");
            console.log("NEXT_PUBLIC_BLOCKSCOUT_API_URL=http://localhost:8545/api");
            console.log("");
            console.log("Note: Running on Anvil - make sure your wallet is connected to the local network");
        } else if (block.chainid == 545) {
            console.log("NEXT_PUBLIC_RPC_URL=https://testnet.evm.nodes.onflow.org");
            console.log("NEXT_PUBLIC_BLOCKSCOUT_API_URL=https://testnet.flowdiver.io/api");
            console.log("");
            console.log("Note: Running on Flow Testnet - make sure your wallet is connected to Flow Testnet");
        }
    }
    
    function getNetworkName(uint256 chainId) internal pure returns (string memory) {
        if (chainId == 1) return "Ethereum Mainnet";
        if (chainId == 545) return "Flow Testnet";
        if (chainId == 31337) return "Anvil Local";
        return "Unknown Network";
    }
} 