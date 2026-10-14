import { relations } from 'drizzle-orm';
import { integer, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

// Users table (keyed to Firebase Auth UID)
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID
  email: text('email').notNull(),
  name: text('name'),
  role: text('role').default('student'),
  branch: text('branch'),
  collegeId: text('college_id'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Colleges table
export const colleges = pgTable('colleges', {
  id: serial('id').primaryKey(),
  code: text('code').notNull().unique(),
  name: text('name').notNull(),
  location: text('location'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Groups table with branch restriction support
export const groups = pgTable('groups', {
  id: serial('id').primaryKey(),
  groupId: text('group_id').notNull().unique(),
  name: text('name').notNull(),
  branch: text('branch'),
  collegeId: text('college_id'),
  description: text('description'),
  createdBy: text('created_by'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Posts table
export const posts = pgTable('posts', {
  id: serial('id').primaryKey(),
  postId: text('post_id').notNull().unique(),
  authorUid: text('author_uid').notNull(),
  authorName: text('author_name'),
  title: text('title').notNull(),
  body: text('body').notNull(),
  category: text('category').default('general'),
  groupId: text('group_id'),
  likesCount: integer('likes_count').default(0),
  createdAt: timestamp('created_at').defaultNow(),
});

// Entries / Activity log table
export const entries = pgTable('entries', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id)
    .notNull(),
  content: text('content').notNull(),
  date: text('date').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  entries: many(entries),
}));

export const entriesRelations = relations(entries, ({ one }) => ({
  author: one(users, {
    fields: [entries.userId],
    references: [users.id],
  }),
}));
