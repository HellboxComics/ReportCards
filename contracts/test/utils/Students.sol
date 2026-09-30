// SPDX-License-Identifier: MIT
pragma solidity 0.8.34;

import {ReportCards} from "../../src/ReportCards.sol";
import {IERC721Receiver} from "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";

/// @dev A smart wallet that knows how to hold a report card.
contract CardCollector is IERC721Receiver {
    function onERC721Received(address, address, uint256, bytes calldata) external pure returns (bytes4) {
        return IERC721Receiver.onERC721Received.selector;
    }
}

/// @dev A contract with no onERC721Received. Shows up to class without a backpack.
contract NoBackpack {}

/// @dev Tries to cut back into the lunch line from inside the ERC-721 receiver hook.
contract LineCutter is IERC721Receiver {
    ReportCards private immutable cards;
    bool private cutting;

    constructor(ReportCards cards_) {
        cards = cards_;
    }

    function enroll(uint256 quantity) external payable {
        cards.mint{value: msg.value}(quantity);
    }

    function onERC721Received(address, address, uint256, bytes calldata) external returns (bytes4) {
        if (!cutting) {
            cutting = true;
            cards.mint{value: cards.mintPrice()}(1);
        }
        return IERC721Receiver.onERC721Received.selector;
    }

    receive() external payable {}
}

/// @dev A principal (owner) contract that can accept ownership and call withdraw, but refuses ETH.
contract PrincipalWithNoPockets {
    ReportCards private immutable cards;

    constructor(ReportCards cards_) {
        cards = cards_;
    }

    function acceptOwnership() external {
        cards.acceptOwnership();
    }

    function withdraw() external {
        cards.withdraw();
    }
}
