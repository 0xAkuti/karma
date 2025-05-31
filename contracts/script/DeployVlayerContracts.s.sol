// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.21;

import "forge-std/Script.sol";
import "forge-std/console.sol";
import "../src/EmailDomainProver.sol";
import "../src/KarmaProofVerifier.sol";

contract DeployVlayerContracts is Script {
    
    function run() external {
        // Start broadcasting transactions (private key is passed via --private-key flag)
        vm.startBroadcast();
        
        console.log("Deploying vlayer contracts...");
        console.log("Deployer address:", msg.sender);
        
        // Deploy EmailDomainProver first (no constructor parameters)
        EmailDomainProver prover = new EmailDomainProver();        
        // Deploy KarmaNFT        
        KarmaNFT karmaNFT = new KarmaNFT(msg.sender, "https://faucet.vlayer.xyz/api/xBadgeMeta?handle=");
        // Deploy KarmaProofVerifier with prover and karmaNFT addresses
        KarmaProofVerifier karmaVerifier = new KarmaProofVerifier(address(prover), address(karmaNFT));

        // Grant MINTER_ROLE to the backend wallet
        karmaNFT.grantRoles(address(karmaVerifier), karmaNFT.MINTER_ROLE());
        
        // Verify deployment
        require(karmaVerifier.prover() == address(prover), "KarmaVerifier prover address mismatch");
        require(karmaVerifier.karmaNFT() == address(karmaNFT), "KarmaVerifier karmaNFT address mismatch");
        
        vm.stopBroadcast();
        
        // Log deployment information
        console.log("\n=== DEPLOYMENT SUMMARY ===");
        console.log("Block number:", block.number);
        console.log("CHAIN_ID=%s", vm.toString(block.chainid));

        console.log("NEXT_PUBLIC_VLAYER_PROVER_CONTRACT_ADDRESS=%s", vm.toString(address(prover)));
        console.log("NEXT_PUBLIC_VLAYER_VERIFIER_CONTRACT_ADDRESS=%s", vm.toString(address(karmaVerifier)));
        
        console.log("NEXT_PUBLIC_KARMA_NFT_CONTRACT_ADDRESS=%s", vm.toString(address(karmaNFT)));
    
    }
} 