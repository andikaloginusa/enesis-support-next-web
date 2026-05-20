// Simulated database/store in memory for the demo
let mockUserStore = {
  "user-1": {
    id: "user-1",
    name: "Ahmad Reza",
    email: "ahmad.reza@company.internal",
    role: "IT Lead & Senior Architect",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=60",
    bio: "Leading the core architectural redesign and modernization of internal support tools.",
  },
};

export const userService = {
  async getUserProfile(userId) {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    const user = mockUserStore[userId];
    if (!user) {
      throw new Error("User not found");
    }

    return user;
  },

  async updateUserProfile(userId, data) {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    if (!mockUserStore[userId]) {
      throw new Error("User not found");
    }

    // Update store
    mockUserStore[userId] = {
      ...mockUserStore[userId],
      ...data,
    };

    return mockUserStore[userId];
  },
};
