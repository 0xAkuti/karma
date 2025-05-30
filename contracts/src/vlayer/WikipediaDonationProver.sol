// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.21;

import {Strings} from "@openzeppelin-contracts-5.0.1/utils/Strings.sol";
import {Proof} from "vlayer-0.1.0/Proof.sol";
import {Prover} from "vlayer-0.1.0/Prover.sol";
import {RegexLib} from "vlayer-0.1.0/Regex.sol";
import {VerifiedEmail, UnverifiedEmail, EmailProofLib} from "vlayer-0.1.0/EmailProof.sol";

contract WikipediaDonationProver is Prover {
    using RegexLib for string;
    using Strings for string;
    using EmailProofLib for UnverifiedEmail;

    function main(UnverifiedEmail calldata unverifiedEmail)
        public
        view
        returns (Proof memory, bytes32, address, uint256, string memory)
    {
        VerifiedEmail memory email = unverifiedEmail.verify();
        
        // Verify the email is from Wikipedia donation system
        require(
            email.from.matches("^[\\w.-]*@wikimedia\\.org$") || 
            email.from.matches("^[\\w.-]*@wikipedia\\.org$"),
            "Email must be from Wikipedia/Wikimedia"
        );
        
        // Extract donation amount from subject or body
        string[] memory amountCapture = email.subject.capture("\\$([0-9]+(?:\\.[0-9]{2})?)");
        if (amountCapture.length == 0) {
            // Try to find amount in email body if not in subject
            amountCapture = email.body.capture("\\$([0-9]+(?:\\.[0-9]{2})?)");
        }
        require(amountCapture.length > 0, "No donation amount found in email");
        
        // Convert amount string to uint (multiply by 100 to handle cents)
        uint256 donationAmountCents = _stringToUint(amountCapture[1]) * 100;
        require(donationAmountCents >= 100, "Minimum donation amount is $1.00"); // $1 minimum
        
        // Extract target wallet address from email body or subject
        string[] memory walletCapture = email.body.capture("(0x[a-fA-F0-9]{40})");
        if (walletCapture.length == 0) {
            walletCapture = email.subject.capture("(0x[a-fA-F0-9]{40})");
        }
        require(walletCapture.length > 0, "No wallet address found in email");
        
        address targetWallet = _stringToAddress(walletCapture[1]);
        
        // Extract donor email for uniqueness check
        bytes32 donorHash = sha256(abi.encodePacked(email.to, email.from, amountCapture[1]));
        
        return (proof(), donorHash, targetWallet, donationAmountCents, amountCapture[1]);
    }
    
    function _stringToAddress(string memory str) internal pure returns (address) {
        bytes memory strBytes = bytes(str);
        require(strBytes.length == 42, "Invalid address length");
        bytes memory addrBytes = new bytes(20);

        for (uint256 i = 0; i < 20; i++) {
            addrBytes[i] = bytes1(_hexCharToByte(strBytes[2 + i * 2]) * 16 + _hexCharToByte(strBytes[3 + i * 2]));
        }

        return address(uint160(bytes20(addrBytes)));
    }

    function _hexCharToByte(bytes1 char) internal pure returns (uint8) {
        uint8 byteValue = uint8(char);
        if (byteValue >= uint8(bytes1("0")) && byteValue <= uint8(bytes1("9"))) {
            return byteValue - uint8(bytes1("0"));
        } else if (byteValue >= uint8(bytes1("a")) && byteValue <= uint8(bytes1("f"))) {
            return 10 + byteValue - uint8(bytes1("a"));
        } else if (byteValue >= uint8(bytes1("A")) && byteValue <= uint8(bytes1("F"))) {
            return 10 + byteValue - uint8(bytes1("A"));
        }
        revert("Invalid hex character");
    }
    
    function _stringToUint(string memory str) internal pure returns (uint256) {
        bytes memory strBytes = bytes(str);
        uint256 result = 0;
        uint256 decimalPlaces = 0;
        bool foundDecimal = false;
        
        for (uint256 i = 0; i < strBytes.length; i++) {
            if (strBytes[i] == bytes1(".")) {
                require(!foundDecimal, "Multiple decimal points");
                foundDecimal = true;
                continue;
            }
            
            require(strBytes[i] >= bytes1("0") && strBytes[i] <= bytes1("9"), "Invalid number character");
            
            if (foundDecimal) {
                decimalPlaces++;
                require(decimalPlaces <= 2, "Too many decimal places");
            }
            
            result = result * 10 + (uint8(strBytes[i]) - uint8(bytes1("0")));
        }
        
        // Pad with zeros if needed (e.g., "5" becomes "500" for $5.00)
        if (foundDecimal) {
            for (uint256 i = decimalPlaces; i < 2; i++) {
                result = result * 10;
            }
        } else {
            // No decimal point, assume whole dollars
            result = result * 100;
        }
        
        return result;
    }
} 