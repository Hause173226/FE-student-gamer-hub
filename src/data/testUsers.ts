// Test users để test chat giữa 2 account
export const testUsers = [
  {
    id: 1,
    userName: "minhtuan",
    fullName: "Minh Tuấn",
    email: "minhtuan@example.com",
    university: "FPT University",
    level: 5,
    avatar: "MT"
  },
  {
    id: 2,
    userName: "thuylinh", 
    fullName: "Thùy Linh",
    email: "thuylinh@example.com",
    university: "HCMUT",
    level: 3,
    avatar: "TL"
  },
  {
    id: 3,
    userName: "ducminh",
    fullName: "Đức Minh",
    email: "ducminh@example.com", 
    university: "UEH",
    level: 8,
    avatar: "DM"
  }
];

// Function để get test user by id
export const getTestUser = (id: number) => {
  return testUsers.find(user => user.id === id);
};

// Function để login as test user (for testing)
export const loginAsTestUser = (userId: number) => {
  const testUser = getTestUser(userId);
  if (testUser) {
    // Store in localStorage for testing
    localStorage.setItem('test_user', JSON.stringify(testUser));
    return testUser;
  }
  return null;
};
