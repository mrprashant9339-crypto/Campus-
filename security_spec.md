# Security Specification & Test Suite

## 1. Data Invariants
1. **User Identity Invariant**: A user document at `/users/{userId}` can only be created/modified by authenticated user where `request.auth.uid == userId`.
2. **Role Elevation Prevention**: Client cannot arbitrarily escalate their role or grant platform admin status without trusted validation.
3. **College Isolation**: A post or group belongs to a validated `collegeId`. Groups require a valid owner.
4. **Group Membership & Branch Guard**: Members joining or mutating a branch-specific group must adhere to branch integrity.
5. **Post Integrity**: The `authorId` on a post at `/posts/{postId}` must strictly match `request.auth.uid`. A user cannot edit or forge another person's post.
6. **Denial of Wallet Prevention**: Path variables and strings must be strictly bounded with `.size() <= MAX`.

## 2. The "Dirty Dozen" Payloads (Adversarial Tests)
1. **Payload 1 (Identity Spoofing - Impersonation Write)**:
   - Target: `/users/victim_user_123`
   - Attacker: `attacker_456`
   - Data: `{ id: "victim_user_123", email: "hacked@evil.com", role: "platform_admin" }`
   - Expected: `PERMISSION_DENIED`
2. **Payload 2 (Unauthenticated Write)**:
   - Target: `/posts/post_1`
   - Auth: Unauthenticated (`null`)
   - Data: `{ title: "Spam post", authorId: "fake_id" }`
   - Expected: `PERMISSION_DENIED`
3. **Payload 3 (Author ID Mismatch)**:
   - Target: `/posts/post_2`
   - Auth: `auth.uid = "user_abc"`
   - Data: `{ id: "post_2", collegeId: "c1", authorId: "user_xyz", title: "Forged Author", body: "Hello" }`
   - Expected: `PERMISSION_DENIED`
4. **Payload 4 (Oversized Payload / Denial of Wallet)**:
   - Target: `/posts/post_3`
   - Auth: `auth.uid = "user_abc"`
   - Data: `{ id: "post_3", collegeId: "c1", authorId: "user_abc", title: "A".repeat(100000), body: "Giant body" }`
   - Expected: `PERMISSION_DENIED`
5. **Payload 5 (ID Injection / Poisoning)**:
   - Target: `/users/evil%20slash%2F`
   - Auth: `auth.uid = "evil%20slash%2F"`
   - Data: `{ id: "evil%20slash%2F", email: "evil@test.com" }`
   - Expected: `PERMISSION_DENIED`
6. **Payload 6 (Shadow Update / Ghost Field Injection)**:
   - Target: `/users/user_abc`
   - Auth: `auth.uid = "user_abc"`
   - Data: `{ id: "user_abc", email: "test@domain.edu", isSuperAdminPrivileged: true }`
   - Expected: `PERMISSION_DENIED`
7. **Payload 7 (Unchecked College Deletion)**:
   - Target: `/colleges/gp_patna_7`
   - Auth: Normal student `user_abc`
   - Action: `deleteDoc`
   - Expected: `PERMISSION_DENIED`
8. **Payload 8 (Post Update by Non-Author)**:
   - Target: `/posts/post_created_by_alice`
   - Auth: `auth.uid = "bob_123"`
   - Action: `update`
   - Data: `{ title: "Defaced Post" }`
   - Expected: `PERMISSION_DENIED`
9. **Payload 9 (Unbounded Array Injection)**:
   - Target: `/notes/note_1`
   - Auth: `auth.uid = "user_abc"`
   - Data: `{ tags: Array(10000).fill("tag") }`
   - Expected: `PERMISSION_DENIED`
10. **Payload 10 (Direct Modification of Verified Status)**:
    - Target: `/users/student_1`
    - Auth: `auth.uid = "student_1"`
    - Action: `update`
    - Data: `{ emailVerified: true }`
    - Expected: `PERMISSION_DENIED` (only via trusted identity token or admin)
11. **Payload 11 (Group Creation with Fake Owner)**:
    - Target: `/groups/grp_1`
    - Auth: `auth.uid = "attacker_1"`
    - Data: `{ ownerId: "principal_user_id", name: "Official Faculty" }`
    - Expected: `PERMISSION_DENIED`
12. **Payload 12 (Blanket Collection Scraping Attack)**:
    - Target: `/users` list query without matching constraints
    - Auth: Arbitrary unverified account
    - Expected: `PERMISSION_DENIED`
