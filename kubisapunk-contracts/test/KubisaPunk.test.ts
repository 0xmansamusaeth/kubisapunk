import { expect } from "chai";
import hardhat from "hardhat";
import type { Signer } from "ethers";

const { ethers } = hardhat;

describe("KubisaPunk", function () {
  let kubisaPunk: any;
  let owner: any;
  let user1: any;
  let user2: any;
  let user3: any;

  beforeEach(async function () {
    // Get signers
    [owner, user1, user2, user3] = await ethers.getSigners();

    // Deploy contract
    const KubisaPunk = await ethers.getContractFactory("KubisaPunk");
    kubisaPunk = await KubisaPunk.deploy();
    await kubisaPunk.waitForDeployment();
  });

  describe("User Registration", function () {
    it("Should register a new user", async function () {
      const user1Address = await user1.getAddress();

      await kubisaPunk.connect(user1).registerUser();

      const profile = await kubisaPunk.getProfile(user1Address);
      expect(profile.joinDate).to.be.gt(0);
      expect(profile.connections).to.equal(0);
      expect(profile.communities).to.equal(0);
      expect(profile.eventsAttended).to.equal(0);
      expect(profile.badgesEarned).to.equal(0);
    });

    it("Should prevent duplicate registration", async function () {
      const user1Address = await user1.getAddress();

      await kubisaPunk.connect(user1).registerUser();

      await expect(
        kubisaPunk.connect(user1).registerUser()
      ).to.be.rejectedWith("User already registered");
    });

    it("Should emit UserRegistered event", async function () {
      const user1Address = await user1.getAddress();

      await expect(kubisaPunk.connect(user1).registerUser())
        .to.emit(kubisaPunk, "UserRegistered");
    });

    it("Should return false for unregistered users", async function () {
      const user1Address = await user1.getAddress();
      const isRegistered = await kubisaPunk.isRegistered(user1Address);
      expect(isRegistered).to.be.false;
    });

    it("Should return true for registered users", async function () {
      const user1Address = await user1.getAddress();

      await kubisaPunk.connect(user1).registerUser();

      const isRegistered = await kubisaPunk.isRegistered(user1Address);
      expect(isRegistered).to.be.true;
    });
  });

  describe("Connections", function () {
    beforeEach(async function () {
      const user1Address = await user1.getAddress();
      const user2Address = await user2.getAddress();

      await kubisaPunk.connect(user1).registerUser();
      await kubisaPunk.connect(user2).registerUser();
    });

    it("Should add a connection", async function () {
      const user1Address = await user1.getAddress();
      const user2Address = await user2.getAddress();

      await kubisaPunk.connect(user1).addConnection(user2Address);

      const profile = await kubisaPunk.getProfile(user1Address);
      expect(profile.connections).to.equal(1);
    });

    it("Should prevent self-connection", async function () {
      const user1Address = await user1.getAddress();

      await expect(
        kubisaPunk.connect(user1).addConnection(user1Address)
      ).to.be.rejectedWith("Cannot connect with self");
    });

    it("Should emit ConnectionAdded event", async function () {
      const user1Address = await user1.getAddress();
      const user2Address = await user2.getAddress();

      await expect(kubisaPunk.connect(user1).addConnection(user2Address))
        .to.emit(kubisaPunk, "ConnectionAdded")
        .withArgs(user1Address, user2Address);
    });

    it("Should require both users to be registered", async function () {
      const user1Address = await user1.getAddress();
      const user3Address = await user3.getAddress();

      // user3 is not registered
      await expect(
        kubisaPunk.connect(user1).addConnection(user3Address)
      ).to.be.rejectedWith("Other user not registered");
    });
  });

  describe("Badges", function () {
    beforeEach(async function () {
      const user1Address = await user1.getAddress();
      await kubisaPunk.connect(user1).registerUser();
    });

    it("Should increment badge count", async function () {
      const user1Address = await user1.getAddress();

      await kubisaPunk.incrementBadge(user1Address);

      const profile = await kubisaPunk.getProfile(user1Address);
      expect(profile.badgesEarned).to.equal(1);
    });

    it("Should emit BadgeEarned event", async function () {
      const user1Address = await user1.getAddress();

      await expect(kubisaPunk.incrementBadge(user1Address))
        .to.emit(kubisaPunk, "BadgeEarned")
        .withArgs(user1Address, 1);
    });
  });

  describe("Communities", function () {
    beforeEach(async function () {
      const user1Address = await user1.getAddress();
      await kubisaPunk.connect(user1).registerUser();
    });

    it("Should increment community count", async function () {
      const user1Address = await user1.getAddress();

      await kubisaPunk.incrementCommunity(user1Address);

      const profile = await kubisaPunk.getProfile(user1Address);
      expect(profile.communities).to.equal(1);
    });

    it("Should emit CommunityJoined event", async function () {
      const user1Address = await user1.getAddress();

      await expect(kubisaPunk.incrementCommunity(user1Address))
        .to.emit(kubisaPunk, "CommunityJoined")
        .withArgs(user1Address, 1);
    });
  });

  describe("Event Management", function () {
    beforeEach(async function () {
      const user1Address = await user1.getAddress();
      await kubisaPunk.connect(user1).registerUser();
    });

    it("Should create a new event", async function () {
      const user1Address = await user1.getAddress();
      const eventName = "Web3 Builders Meetup";

      await kubisaPunk
        .connect(user1)
        .createEvent(eventName);

      const nextId = await kubisaPunk.nextEventId();
      expect(nextId).to.equal(2);
    });

    it("Should emit EventCreated event", async function () {
      const user1Address = await user1.getAddress();
      const eventName = "Web3 Builders Meetup";

      const tx = kubisaPunk.connect(user1).createEvent(eventName);
      await expect(tx)
        .to.emit(kubisaPunk, "EventCreated")
        .withArgs(1n, eventName, user1Address, (value: any) => {
          return typeof value === 'bigint' || typeof value === 'number';
        });
    });

    it("Should increment event ID", async function () {
      await kubisaPunk.connect(user1).createEvent("Event 1");
      await kubisaPunk.connect(user1).createEvent("Event 2");

      const nextId = await kubisaPunk.nextEventId();
      expect(nextId).to.equal(3);
    });

    it("Should reject empty event names", async function () {
      await expect(
        kubisaPunk.connect(user1).createEvent("")
      ).to.be.rejectedWith("Event name cannot be empty");
    });

    it("Should reject excessively long event names", async function () {
      const longName = "a".repeat(101);

      await expect(
        kubisaPunk.connect(user1).createEvent(longName)
      ).to.be.rejectedWith("Event name too long");
    });
  });

  describe("Event Check-In", function () {
    beforeEach(async function () {
      const user1Address = await user1.getAddress();
      const user2Address = await user2.getAddress();

      await kubisaPunk.connect(user1).registerUser();
      await kubisaPunk.connect(user2).registerUser();
      await kubisaPunk
        .connect(user1)
        .createEvent("Web3 Builders Meetup");
    });

    it("Should check in to an event", async function () {
      const user2Address = await user2.getAddress();

      await kubisaPunk.connect(user2).checkIn(1);

      const hasCheckedIn = await kubisaPunk.hasCheckedIn(1, user2Address);
      expect(hasCheckedIn).to.be.true;
    });

    it("Should increment events attended", async function () {
      const user2Address = await user2.getAddress();

      await kubisaPunk.connect(user2).checkIn(1);

      const profile = await kubisaPunk.getProfile(user2Address);
      expect(profile.eventsAttended).to.equal(1);
    });

    it("Should emit CheckedIn event", async function () {
      const user2Address = await user2.getAddress();

      await expect(kubisaPunk.connect(user2).checkIn(1))
        .to.emit(kubisaPunk, "CheckedIn")
        .withArgs(1, user2Address);
    });

    it("Should prevent duplicate check-ins", async function () {
      const user2Address = await user2.getAddress();

      await kubisaPunk.connect(user2).checkIn(1);

      await expect(
        kubisaPunk.connect(user2).checkIn(1)
      ).to.be.rejectedWith("Already checked in to this event");
    });

    it("Should require user registration for check-in", async function () {
      await expect(
        kubisaPunk.connect(user3).checkIn(1)
      ).to.be.rejectedWith("User not registered");
    });

    it("Should validate event existence", async function () {
      await expect(
        kubisaPunk.connect(user2).checkIn(999)
      ).to.be.rejectedWith("Invalid event ID");
    });

    it("Should allow multiple users to check in", async function () {
      const user1Address = await user1.getAddress();
      const user2Address = await user2.getAddress();

      await kubisaPunk.connect(user1).checkIn(1);
      await kubisaPunk.connect(user2).checkIn(1);

      expect(await kubisaPunk.hasCheckedIn(1, user1Address)).to.be.true;
      expect(await kubisaPunk.hasCheckedIn(1, user2Address)).to.be.true;
    });
  });

  describe("Integration Tests", function () {
    it("Should handle complete user journey", async function () {
      const user1Address = await user1.getAddress();
      const user2Address = await user2.getAddress();

      // Register users
      await kubisaPunk.connect(user1).registerUser();
      await kubisaPunk.connect(user2).registerUser();

      // Create event
      await kubisaPunk
        .connect(user1)
        .createEvent("Web3 Conference");

      // Check in
      await kubisaPunk.connect(user2).checkIn(1);

      // Add connection
      await kubisaPunk.connect(user1).addConnection(user2Address);

      // Award badge
      await kubisaPunk.incrementBadge(user2Address);

      // Join community
      await kubisaPunk.incrementCommunity(user2Address);

      // Verify final profile
      const profile = await kubisaPunk.getProfile(user2Address);
      expect(profile.connections).to.equal(0); // user2 didn't connect with anyone
      expect(profile.eventsAttended).to.equal(1);
      expect(profile.badgesEarned).to.equal(1);
      expect(profile.communities).to.equal(1);
    });
  });
});
