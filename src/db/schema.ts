import { relations } from 'drizzle-orm';
import { integer, pgTable, serial, text, timestamp, jsonb, uniqueIndex } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(),
  email: text('email').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const projects = pgTable('projects', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id)
    .notNull(),
  name: text('name').notNull(),
  niche: text('niche'),
  description: text('description'),
  metaPrincipal: text('meta_principal'),
  observacoes: text('observacoes'),
  platformsActive: jsonb('platforms_active').default([]).notNull(), // array of strings: ['youtube', 'facebook', etc]
  createdAt: timestamp('created_at').defaultNow(),
});

export const platforms = pgTable('platforms', {
  id: serial('id').primaryKey(),
  projectId: integer('project_id')
    .references(() => projects.id, { onDelete: 'cascade' })
    .notNull(),
  type: text('type').notNull(), // youtube, facebook, instagram, tiktok
  accountName: text('account_name'),
  username: text('username'),
  profileLink: text('profile_link'),
  followers: integer('followers').default(0).notNull(),
  followersGoal: integer('followers_goal').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  projectTypeIdx: uniqueIndex('project_type_idx').on(table.projectId, table.type),
}));

export const contents = pgTable('contents', {
  id: serial('id').primaryKey(),
  projectId: integer('project_id')
    .references(() => projects.id, { onDelete: 'cascade' })
    .notNull(),
  title: text('title').notNull(),
  platform: text('platform').notNull(),
  publicationDate: text('publication_date'), // YYYY-MM-DD
  description: text('description'),
  notes: text('notes'),
  status: text('status').default('Ideia').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const usersRelations = relations(users, ({ many }) => ({
  projects: many(projects),
}));

export const projectsRelations = relations(projects, ({ one, many }) => ({
  user: one(users, {
    fields: [projects.userId],
    references: [users.id],
  }),
  platforms: many(platforms),
  contents: many(contents),
}));

export const platformsRelations = relations(platforms, ({ one }) => ({
  project: one(projects, {
    fields: [platforms.projectId],
    references: [projects.id],
  }),
}));

export const contentsRelations = relations(contents, ({ one }) => ({
  project: one(projects, {
    fields: [contents.projectId],
    references: [projects.id],
  }),
}));
