export type E2EUser = {
  name: string;
  email: string;
  password: string;
};

export const E2E_USERS = {
  userA: {
    name: "E2E User A",
    email: "e2e.user.a@entrelibros.local",
    password: "Demo123!",
  },
  userB: {
    name: "E2E User B",
    email: "e2e.user.b@entrelibros.local",
    password: "Demo123!",
  },
  outsider: {
    name: "E2E Outsider",
    email: "e2e.outsider@entrelibros.local",
    password: "Demo123!",
  },
  admin: {
    name: "E2E Admin",
    email: "e2e.admin@entrelibros.local",
    password: "Demo123!",
  },
} as const satisfies Record<string, E2EUser>;
