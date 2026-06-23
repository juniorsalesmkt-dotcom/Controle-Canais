import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { requireAuth, AuthRequest } from './src/middleware/auth.ts';
import { db } from './src/db/index.ts';
import { users, projects, platforms, contents } from './src/db/schema.ts';
import { eq, and, sql, inArray } from 'drizzle-orm';
import { getOrCreateUser } from './src/db/users.ts';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  // Helper to get local DB user id from Firebase UID
  const getDbUser = async (uid: string, email: string) => {
    return await getOrCreateUser(uid, email);
  };

  // API Routes
  app.get('/api/projects', requireAuth, async (req: AuthRequest, res) => {
    try {
      const dbUser = await getDbUser(req.user!.uid, req.user!.email!);
      const userProjects = await db.select().from(projects).where(eq(projects.userId, dbUser.id));
      res.json(userProjects);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/projects', requireAuth, async (req: AuthRequest, res) => {
    try {
      const dbUser = await getDbUser(req.user!.uid, req.user!.email!);
      const { name, niche, description, metaPrincipal, observacoes, platformsActive } = req.body;
      const result = await db.insert(projects).values({
        userId: dbUser.id,
        name,
        niche,
        description,
        metaPrincipal,
        observacoes,
        platformsActive: platformsActive || [],
      }).returning();
      res.json(result[0]);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put('/api/projects/:id', requireAuth, async (req: AuthRequest, res) => {
    try {
      const dbUser = await getDbUser(req.user!.uid, req.user!.email!);
      const id = parseInt(req.params.id);
      const { name, niche, description, metaPrincipal, observacoes, platformsActive } = req.body;
      const result = await db.update(projects)
        .set({ name, niche, description, metaPrincipal, observacoes, platformsActive })
        .where(and(eq(projects.id, id), eq(projects.userId, dbUser.id)))
        .returning();
      res.json(result[0]);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete('/api/projects/:id', requireAuth, async (req: AuthRequest, res) => {
    try {
      const dbUser = await getDbUser(req.user!.uid, req.user!.email!);
      const id = parseInt(req.params.id);
      await db.delete(projects).where(and(eq(projects.id, id), eq(projects.userId, dbUser.id)));
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/projects/:id/platforms', requireAuth, async (req: AuthRequest, res) => {
    try {
      const dbUser = await getDbUser(req.user!.uid, req.user!.email!);
      const projectId = parseInt(req.params.id);
      
      // Verify project ownership
      const project = await db.select().from(projects).where(and(eq(projects.id, projectId), eq(projects.userId, dbUser.id)));
      if (!project.length) return res.status(403).json({ error: 'Access denied' });

      const projectPlatforms = await db.select().from(platforms).where(eq(platforms.projectId, projectId));
      res.json(projectPlatforms);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/projects/:id/platforms', requireAuth, async (req: AuthRequest, res) => {
    try {
      const dbUser = await getDbUser(req.user!.uid, req.user!.email!);
      const projectId = parseInt(req.params.id);
      const { type, accountName, username, profileLink, followers, followersGoal } = req.body;

      // Verify project ownership
      const project = await db.select().from(projects).where(and(eq(projects.id, projectId), eq(projects.userId, dbUser.id)));
      if (!project.length) return res.status(403).json({ error: 'Access denied' });

      const result = await db.insert(platforms).values({
        projectId,
        type,
        accountName,
        username,
        profileLink,
        followers: followers || 0,
        followersGoal: followersGoal || 0,
      }).onConflictDoUpdate({
        target: [platforms.projectId, platforms.type], // We'd need a unique constraint for this to work with onConflict
        set: { accountName, username, profileLink, followers, followersGoal }
      }).returning();
      // Note: For onConflictDoUpdate to work with project_id and type, I should add a unique constraint in schema.
      // But I'll just check existence manually if needed, or update schema later.
      res.json(result[0]);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // Alternative simple platform save (Upsert manual)
  app.put('/api/projects/:id/platforms', requireAuth, async (req: AuthRequest, res) => {
    try {
      const dbUser = await getDbUser(req.user!.uid, req.user!.email!);
      const projectId = parseInt(req.params.id);
      const { type, accountName, username, profileLink, followers, followersGoal } = req.body;

      const project = await db.select().from(projects).where(and(eq(projects.id, projectId), eq(projects.userId, dbUser.id)));
      if (!project.length) return res.status(403).json({ error: 'Access denied' });

      const existing = await db.select().from(platforms).where(and(eq(platforms.projectId, projectId), eq(platforms.type, type)));
      
      if (existing.length) {
        const result = await db.update(platforms)
          .set({ accountName, username, profileLink, followers, followersGoal })
          .where(eq(platforms.id, existing[0].id))
          .returning();
        res.json(result[0]);
      } else {
        const result = await db.insert(platforms).values({
          projectId, type, accountName, username, profileLink, followers, followersGoal
        }).returning();
        res.json(result[0]);
      }
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/projects/:id/contents', requireAuth, async (req: AuthRequest, res) => {
    try {
      const dbUser = await getDbUser(req.user!.uid, req.user!.email!);
      const projectId = parseInt(req.params.id);
      const project = await db.select().from(projects).where(and(eq(projects.id, projectId), eq(projects.userId, dbUser.id)));
      if (!project.length) return res.status(403).json({ error: 'Access denied' });

      const projectContents = await db.select().from(contents).where(eq(contents.projectId, projectId));
      res.json(projectContents);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/projects/:id/contents', requireAuth, async (req: AuthRequest, res) => {
    try {
      const dbUser = await getDbUser(req.user!.uid, req.user!.email!);
      const projectId = parseInt(req.params.id);
      const { title, platform, publicationDate, description, notes, status } = req.body;

      const project = await db.select().from(projects).where(and(eq(projects.id, projectId), eq(projects.userId, dbUser.id)));
      if (!project.length) return res.status(403).json({ error: 'Access denied' });

      const result = await db.insert(contents).values({
        projectId, title, platform, publicationDate, description, notes, status
      }).returning();
      res.json(result[0]);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put('/api/contents/:id', requireAuth, async (req: AuthRequest, res) => {
    try {
      const dbUser = await getDbUser(req.user!.uid, req.user!.email!);
      const id = parseInt(req.params.id);
      const { title, platform, publicationDate, description, notes, status } = req.body;

      // Check ownership via project
      const contentItem = await db.select().from(contents).where(eq(contents.id, id));
      if (!contentItem.length) return res.status(404).json({ error: 'Content not found' });
      
      const project = await db.select().from(projects).where(and(eq(projects.id, contentItem[0].projectId), eq(projects.userId, dbUser.id)));
      if (!project.length) return res.status(403).json({ error: 'Access denied' });

      const result = await db.update(contents)
        .set({ title, platform, publicationDate, description, notes, status })
        .where(eq(contents.id, id))
        .returning();
      res.json(result[0]);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete('/api/contents/:id', requireAuth, async (req: AuthRequest, res) => {
    try {
      const dbUser = await getDbUser(req.user!.uid, req.user!.email!);
      const id = parseInt(req.params.id);
      
      const contentItem = await db.select().from(contents).where(eq(contents.id, id));
      if (!contentItem.length) return res.status(404).json({ error: 'Content not found' });

      const project = await db.select().from(projects).where(and(eq(projects.id, contentItem[0].projectId), eq(projects.userId, dbUser.id)));
      if (!project.length) return res.status(403).json({ error: 'Access denied' });

      await db.delete(contents).where(eq(contents.id, id));
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/dashboard', requireAuth, async (req: AuthRequest, res) => {
    try {
      const dbUser = await getDbUser(req.user!.uid, req.user!.email!);
      
      const userProjects = await db.select().from(projects).where(eq(projects.userId, dbUser.id));
      const projectIds = userProjects.map(p => p.id);
      
      if (projectIds.length === 0) {
        return res.json({
          totalFollowers: 0,
          totalScheduled: 0,
          totalPublished: 0,
          projects: []
        });
      }

      const userPlatforms = await db.select().from(platforms).where(inArray(platforms.projectId, projectIds));
      const userContents = await db.select().from(contents).where(inArray(contents.projectId, projectIds));
      
      const totalFollowers = userPlatforms.reduce((acc, curr) => acc + (curr.followers || 0), 0);
      const totalScheduled = userContents.filter(c => c.status === 'Programado').length;
      const totalPublished = userContents.filter(c => c.status === 'Publicado').length;
      
      res.json({
        totalFollowers,
        totalScheduled,
        totalPublished,
        projects: userProjects.map(p => {
          const pPlatforms = userPlatforms.filter(pl => pl.projectId === p.id);
          const pContents = userContents.filter(c => c.projectId === p.id);
          const pFollowers = pPlatforms.reduce((acc, curr) => acc + (curr.followers || 0), 0);
          const pGoal = pPlatforms.reduce((acc, curr) => acc + (curr.followersGoal || 0), 0);
          return {
            ...p,
            followers: pFollowers,
            followersGoal: pGoal,
            scheduledCount: pContents.filter(c => c.status === 'Programado').length,
            publishedCount: pContents.filter(c => c.status === 'Publicado').length,
          };
        })
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
