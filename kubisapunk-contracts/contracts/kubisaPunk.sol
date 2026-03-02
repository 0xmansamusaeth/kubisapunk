// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title KubisaPunk
 * @dev Smart contract for Web3 reputation and event check-in tracking
 */
contract KubisaPunk {
    // ============ Structs ============

    /**
     * @dev User profile containing reputation data
     */
    struct Profile {
        uint256 joinDate;
        uint256 connections;
        uint256 communities;
        uint256 eventsAttended;
        uint256 badgesEarned;
    }

    /**
     * @dev Event details for check-in
     */
    struct Event {
        string name;
        address organizer;
        uint256 date;
    }

    // ============ State Variables ============

    /// @dev Maps wallet addresses to user profiles
    mapping(address => Profile) public profiles;

    /// @dev Checks if a user has registered
    mapping(address => bool) private hasRegistered;

    /// @dev Maps event ID to event details
    mapping(uint256 => Event) public events;

    /// @dev Maps event ID to user addresses to check-in status
    mapping(uint256 => mapping(address => bool)) public attendance;

    /// @dev Counter for generating unique event IDs
    uint256 public nextEventId = 1;

    // ============ Events ============

    /**
     * @dev Emitted when a user registers
     */
    event UserRegistered(address indexed user, uint256 joinDate);

    /**
     * @dev Emitted when two users connect
     */
    event ConnectionAdded(address indexed userA, address indexed userB);

    /**
     * @dev Emitted when a badge is earned
     */
    event BadgeEarned(address indexed user, uint256 newBadgeCount);

    /**
     * @dev Emitted when a community is joined
     */
    event CommunityJoined(address indexed user, uint256 newCommunityCount);

    /**
     * @dev Emitted when an event is created
     */
    event EventCreated(
        uint256 indexed eventId,
        string name,
        address indexed organizer,
        uint256 date
    );

    /**
     * @dev Emitted when a user checks in to an event
     */
    event CheckedIn(uint256 indexed eventId, address indexed user);

    // ============ User Profile Functions ============

    /**
     * @dev Register a new user and initialize their profile
     * @notice Can only be called once per user
     */
    function registerUser() external {
        require(!hasRegistered[msg.sender], "User already registered");

        hasRegistered[msg.sender] = true;
        profiles[msg.sender] = Profile({
            joinDate: block.timestamp,
            connections: 0,
            communities: 0,
            eventsAttended: 0,
            badgesEarned: 0
        });

        emit UserRegistered(msg.sender, block.timestamp);
    }

    /**
     * @dev Add a connection between two users
     * @param otherUser Address of the user to connect with
     */
    function addConnection(address otherUser) external {
        require(otherUser != address(0), "Invalid address");
        require(otherUser != msg.sender, "Cannot connect with self");
        require(hasRegistered[msg.sender], "Caller not registered");
        require(hasRegistered[otherUser], "Other user not registered");

        profiles[msg.sender].connections++;
        emit ConnectionAdded(msg.sender, otherUser);
    }

    /**
     * @dev Increment the badge count for a user
     * @param user Address of the user
     */
    function incrementBadge(address user) external {
        require(user != address(0), "Invalid address");
        require(hasRegistered[user], "User not registered");

        profiles[user].badgesEarned++;
        emit BadgeEarned(user, profiles[user].badgesEarned);
    }

    /**
     * @dev Increment the community count for a user
     * @param user Address of the user
     */
    function incrementCommunity(address user) external {
        require(user != address(0), "Invalid address");
        require(hasRegistered[user], "User not registered");

        profiles[user].communities++;
        emit CommunityJoined(user, profiles[user].communities);
    }

    /**
     * @dev Get a user's complete profile
     * @param user Address of the user
     * @return Profile struct for the user
     */
    function getProfile(address user)
        external
        view
        returns (Profile memory)
    {
        require(hasRegistered[user], "User not registered");
        return profiles[user];
    }

    /**
     * @dev Check if a user is registered
     * @param user Address to check
     * @return True if user is registered
     */
    function isRegistered(address user) external view returns (bool) {
        return hasRegistered[user];
    }

    // ============ Event Management Functions ============

    /**
     * @dev Create a new event
     * @param name Name of the event
     * @notice Only the organizer (caller) can create events for themselves
     * @return eventId The ID of the newly created event
     */
    function createEvent(string memory name) external returns (uint256) {
        require(bytes(name).length > 0, "Event name cannot be empty");
        require(
            bytes(name).length <= 100,
            "Event name too long"
        );

        uint256 eventId = nextEventId;
        events[eventId] = Event({
            name: name,
            organizer: msg.sender,
            date: block.timestamp
        });

        nextEventId++;
        emit EventCreated(eventId, name, msg.sender, block.timestamp);

        return eventId;
    }

    /**
     * @dev Check in to an event
     * @param eventId ID of the event to check in to
     */
    function checkIn(uint256 eventId) external {
        require(eventId > 0 && eventId < nextEventId, "Invalid event ID");
        require(hasRegistered[msg.sender], "User not registered");
        require(
            !attendance[eventId][msg.sender],
            "Already checked in to this event"
        );

        attendance[eventId][msg.sender] = true;
        profiles[msg.sender].eventsAttended++;

        emit CheckedIn(eventId, msg.sender);
    }

    /**
     * @dev Check if a user has attended an event
     * @param eventId ID of the event
     * @param user Address of the user
     * @return True if user has checked in to the event
     */
    function hasCheckedIn(uint256 eventId, address user)
        external
        view
        returns (bool)
    {
        return attendance[eventId][user];
    }

    /**
     * @dev Get event details
     * @param eventId ID of the event
     * @return Event struct
     */
    function getEvent(uint256 eventId)
        external
        view
        returns (Event memory)
    {
        require(eventId > 0 && eventId < nextEventId, "Invalid event ID");
        return events[eventId];
    }
}
