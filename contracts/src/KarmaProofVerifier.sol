// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.21;

import {EmailDomainProver} from "./EmailDomainProver.sol";

import {Proof} from "vlayer-0.1.0/Proof.sol";
import {Verifier} from "vlayer-0.1.0/Verifier.sol";
import {KarmaNFT, IERC5484} from "./KarmaNFT.sol";

contract KarmaProofVerifier is Verifier {
    address public prover;
    address public karmaNFT;

    constructor(address _prover, address _karmaNFT) {
        prover = _prover;
        karmaNFT = _karmaNFT;
    }

    function verify(Proof calldata, bytes32 _karmaHash, address _targetWallet)
        public
        onlyVerified(prover, EmailDomainProver.main.selector)
    {
        KarmaNFT(karmaNFT).mint(_targetWallet, uint256(_karmaHash), IERC5484.BurnAuth.OwnerOnly);
    }
}
