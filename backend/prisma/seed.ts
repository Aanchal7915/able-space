import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function daysFromNow(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d;
}

async function main() {
  console.log('Seeding database...');

  // -------------------------------------------------------------------
  // Users (seed "team members" — fixed roster people can be assigned to,
  // NOT ad-hoc login accounts. isGuest must be false here: GET /api/users
  // (which powers every assignee/member/lead picker) filters out
  // isGuest:true users specifically so that real "Continue as Guest"
  // sessions don't permanently clutter those pickers — these seeded rows
  // need to stay on the other side of that filter to remain assignable.
  // -------------------------------------------------------------------
  const userSeeds = [
    { fullName: 'Admin', avatarColor: '#F59E0B', title: 'Workspace Admin' },
    { fullName: 'Designer', avatarColor: '#3B82F6', title: 'Product Designer' },
    { fullName: 'QA Team', avatarColor: '#EC4899', title: 'QA Engineer' },
    { fullName: 'Security', avatarColor: '#F43F5E', title: 'Security Engineer' },
    { fullName: 'Dev Team', avatarColor: '#10B981', title: 'Software Engineer' },
    { fullName: 'Product', avatarColor: '#111827', title: 'Product Manager' },
    { fullName: 'Ankit Dutta', avatarColor: '#8B5CF6', title: 'Software Engineer' },
  ];

  const users: Record<string, Awaited<ReturnType<typeof prisma.user.create>>> = {};
  for (const u of userSeeds) {
    users[u.fullName] = await prisma.user.create({
      data: { ...u, isGuest: false },
    });
  }
  const admin = users['Admin'];
  const designer = users['Designer'];
  const qa = users['QA Team'];
  const security = users['Security'];
  const devTeam = users['Dev Team'];
  const product = users['Product'];
  const ankit = users['Ankit Dutta'];

  // -------------------------------------------------------------------
  // Labels
  // -------------------------------------------------------------------
  const labelSeeds = [
    { name: 'Research', colorToken: 'blue' },
    { name: 'Design', colorToken: 'pink' },
    { name: 'Development', colorToken: 'emerald' },
    { name: 'Testing', colorToken: 'amber' },
    { name: 'Deployment', colorToken: 'rose' },
    { name: 'Scheduled', colorToken: 'blue' },
    { name: 'Updated', colorToken: 'emerald' },
    { name: 'Audit', colorToken: 'black' },
    { name: 'Passed', colorToken: 'emerald' },
  ];
  const labels: Record<string, Awaited<ReturnType<typeof prisma.label.create>>> = {};
  for (const l of labelSeeds) {
    labels[l.name] = await prisma.label.create({ data: l });
  }

  // -------------------------------------------------------------------
  // Projects
  // -------------------------------------------------------------------
  const designHomepage = await prisma.project.create({
    data: {
      name: 'Design Homepage',
      priority: 'high',
      dueDate: daysFromNow(21),
      leadId: designer.id,
      ownerId: admin.id,
    },
  });
  const developLogin = await prisma.project.create({
    data: {
      name: 'Develop Login Feature',
      priority: 'low',
      dueDate: daysFromNow(30),
      leadId: devTeam.id,
      ownerId: admin.id,
    },
  });
  const testPayment = await prisma.project.create({
    data: {
      name: 'Test Payment Gateway',
      priority: 'medium',
      dueDate: daysFromNow(14),
      leadId: qa.id,
      ownerId: admin.id,
    },
  });

  // -------------------------------------------------------------------
  // Tasks
  // -------------------------------------------------------------------
  const writeApiDocs = await prisma.task.create({
    data: {
      title: 'Write API Documentation',
      description: 'Document all REST endpoints, request/response shapes, and auth flow for the public API.',
      status: 'todo',
      priority: 'high',
      dueDate: daysFromNow(7),
      projectId: developLogin.id,
      assigneeId: devTeam.id,
      reporterId: product.id,
      ownerId: product.id,
      order: 0,
      members: { create: [{ userId: devTeam.id }, { userId: product.id }] },
      labels: {
        create: [
          { labelId: labels['Research'].id },
          { labelId: labels['Design'].id },
          { labelId: labels['Development'].id },
          { labelId: labels['Testing'].id },
          { labelId: labels['Deployment'].id },
        ],
      },
    },
  });

  await prisma.task.create({
    data: {
      title: 'Implement Search Function',
      description: 'Add full-text search across tasks and projects.',
      status: 'todo',
      priority: 'medium',
      dueDate: daysFromNow(10),
      projectId: developLogin.id,
      assigneeId: devTeam.id,
      reporterId: admin.id,
      ownerId: admin.id,
      order: 1,
      labels: { create: [{ labelId: labels['Development'].id }] },
    },
  });

  await prisma.task.create({
    data: {
      title: 'Deploy to Production',
      description: 'Ship the current release candidate to the production environment.',
      status: 'todo',
      priority: 'urgent',
      dueDate: daysFromNow(5),
      projectId: testPayment.id,
      assigneeId: devTeam.id,
      reporterId: admin.id,
      ownerId: admin.id,
      order: 2,
      labels: { create: [{ labelId: labels['Deployment'].id }, { labelId: labels['Scheduled'].id }] },
    },
  });

  await prisma.task.create({
    data: {
      title: 'Code Review Completed',
      description: 'Peer review of the payment gateway integration branch.',
      status: 'doing',
      priority: 'medium',
      dueDate: daysFromNow(2),
      projectId: testPayment.id,
      assigneeId: qa.id,
      reporterId: devTeam.id,
      ownerId: devTeam.id,
      order: 0,
      labels: { create: [{ labelId: labels['Development'].id }] },
    },
  });

  await prisma.task.create({
    data: {
      title: 'Design Mockups Finalized',
      description: 'Final high-fidelity mockups for the homepage redesign.',
      status: 'doing',
      priority: 'high',
      dueDate: daysFromNow(4),
      projectId: designHomepage.id,
      assigneeId: designer.id,
      reporterId: product.id,
      ownerId: designer.id,
      order: 1,
      labels: { create: [{ labelId: labels['Design'].id }] },
    },
  });

  await prisma.task.create({
    data: {
      title: 'Feature Testing Passed',
      description: 'All regression tests passed for the new checkout flow.',
      status: 'completed',
      priority: 'medium',
      dueDate: daysFromNow(-2),
      projectId: testPayment.id,
      assigneeId: qa.id,
      reporterId: qa.id,
      ownerId: qa.id,
      order: 0,
      labels: { create: [{ labelId: labels['Testing'].id }, { labelId: labels['Passed'].id }] },
    },
  });

  await prisma.task.create({
    data: {
      title: 'UI Design Updated',
      description: 'Updated component styles to match the new design tokens.',
      status: 'completed',
      priority: 'low',
      dueDate: daysFromNow(-5),
      projectId: designHomepage.id,
      assigneeId: designer.id,
      reporterId: designer.id,
      ownerId: designer.id,
      order: 1,
      labels: { create: [{ labelId: labels['Design'].id }, { labelId: labels['Updated'].id }] },
    },
  });

  await prisma.task.create({
    data: {
      title: 'Security Audit Scheduled',
      description: 'Third-party security audit booked for the payments module.',
      status: 'completed',
      priority: 'high',
      dueDate: daysFromNow(-1),
      projectId: testPayment.id,
      assigneeId: security.id,
      reporterId: admin.id,
      ownerId: admin.id,
      order: 2,
      labels: { create: [{ labelId: labels['Audit'].id }, { labelId: labels['Scheduled'].id }] },
    },
  });

  await prisma.task.create({
    data: {
      title: 'Backend Load Testing',
      description: 'Simulate peak traffic to validate autoscaling thresholds.',
      status: 'on_hold',
      priority: 'medium',
      dueDate: daysFromNow(12),
      projectId: testPayment.id,
      assigneeId: qa.id,
      reporterId: qa.id,
      ownerId: qa.id,
      order: 0,
      labels: { create: [{ labelId: labels['Testing'].id }] },
    },
  });

  await prisma.task.create({
    data: {
      title: 'User Feedback Review',
      description: 'Triage feedback collected from the last beta round.',
      status: 'on_hold',
      priority: 'low',
      dueDate: daysFromNow(15),
      projectId: designHomepage.id,
      assigneeId: product.id,
      reporterId: product.id,
      ownerId: product.id,
      order: 1,
      labels: { create: [{ labelId: labels['Research'].id }] },
    },
  });

  await prisma.task.create({
    data: {
      title: 'Performance Optimization',
      description: 'Profile and optimize slow API routes flagged in the last sprint.',
      status: 'on_hold',
      priority: 'medium',
      dueDate: daysFromNow(20),
      projectId: developLogin.id,
      assigneeId: devTeam.id,
      reporterId: devTeam.id,
      ownerId: devTeam.id,
      order: 2,
      labels: { create: [{ labelId: labels['Development'].id }] },
    },
  });

  // -------------------------------------------------------------------
  // Subtasks under "Write API Documentation"
  // -------------------------------------------------------------------
  await prisma.task.create({
    data: {
      title: 'Subtask 1',
      status: 'todo',
      priority: 'high',
      parentTaskId: writeApiDocs.id,
      projectId: writeApiDocs.projectId,
      assigneeId: devTeam.id,
      reporterId: product.id,
      ownerId: product.id,
    },
  });
  const subtask2 = await prisma.task.create({
    data: {
      title: 'Subtask 2',
      status: 'todo',
      priority: 'low',
      parentTaskId: writeApiDocs.id,
      projectId: writeApiDocs.projectId,
      assigneeId: devTeam.id,
      reporterId: product.id,
      ownerId: product.id,
    },
  });
  await prisma.task.create({
    data: {
      title: 'Subtask 3',
      status: 'todo',
      priority: 'medium',
      parentTaskId: writeApiDocs.id,
      projectId: writeApiDocs.projectId,
      assigneeId: devTeam.id,
      reporterId: product.id,
      ownerId: product.id,
    },
  });

  // -------------------------------------------------------------------
  // Comment + resource on "Write API Documentation"
  // -------------------------------------------------------------------
  await prisma.comment.create({
    data: {
      taskId: writeApiDocs.id,
      authorId: ankit.id,
      body: 'Looks good, left a note on subtask 2.',
    },
  });

  await prisma.resource.create({
    data: {
      taskId: writeApiDocs.id,
      label: 'API design spec',
      url: 'https://example.com/docs/api-design-spec',
    },
  });

  console.log(`Seed complete. Subtask 2 id: ${subtask2.id}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
