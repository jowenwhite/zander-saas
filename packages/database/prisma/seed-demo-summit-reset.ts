import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';
import * as readline from 'readline';

const prisma = new PrismaClient();

// Summit Home Services Tenant ID - HARDCODED FOR SAFETY
const SUMMIT_TENANT_ID = 'cmlnkgwan0000j8hsv1tl8dml';

// Hardcoded seed scripts - these are safe, not user input
const SEED_SCRIPTS = [
  'seed:demo-summit',
  'seed:demo-summit-phase2',
  'seed:demo-summit-phase3',
  'seed:demo-summit-phase4',
] as const;

// ANSI colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

function log(message: string, color: string = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

async function promptConfirmation(message: string): Promise<boolean> {
  // Check if running non-interactively (e.g., with --force flag)
  if (process.argv.includes('--force') || process.argv.includes('-f')) {
    log('Running with --force flag, skipping confirmation', colors.yellow);
    return true;
  }

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(`${colors.yellow}${message} (yes/no): ${colors.reset}`, (answer) => {
      rl.close();
      resolve(answer.toLowerCase() === 'yes' || answer.toLowerCase() === 'y');
    });
  });
}

async function verifyTenant(): Promise<boolean> {
  const tenant = await prisma.tenant.findUnique({
    where: { id: SUMMIT_TENANT_ID },
  });

  if (!tenant) {
    log(`ERROR: Tenant not found with ID: ${SUMMIT_TENANT_ID}`, colors.red);
    log('The demo tenant may not exist. Run Phase 1 seed first.', colors.yellow);
    return false;
  }

  if (tenant.subdomain !== 'summit-home-services') {
    log(`ERROR: Tenant ID does not match expected subdomain!`, colors.red);
    log(`Expected: summit-home-services`, colors.red);
    log(`Found: ${tenant.subdomain}`, colors.red);
    log('Aborting for safety.', colors.red);
    return false;
  }

  log(`Verified tenant: ${tenant.companyName} (${tenant.subdomain})`, colors.green);
  return true;
}

async function deleteAllTenantData(): Promise<void> {
  log('', colors.reset);
  log('═══════════════════════════════════════════════════════════════', colors.red);
  log('  DELETING ALL DATA FOR SUMMIT HOME SERVICES', colors.red);
  log('═══════════════════════════════════════════════════════════════', colors.red);
  log('', colors.reset);

  // Get counts before deletion for reporting
  const counts: Record<string, number> = {};

  // Delete in order respecting foreign keys
  // Order matters! Delete children before parents.

  // 1. Workflow Executions (references Workflow, Contact)
  const workflowExecutions = await prisma.workflowExecution.deleteMany({
    where: { workflow: { tenantId: SUMMIT_TENANT_ID } },
  });
  counts['WorkflowExecution'] = workflowExecutions.count;
  log(`  Deleted ${workflowExecutions.count} workflow executions`, colors.cyan);

  // 2. Campaign Enrollments (references Campaign, Contact)
  const campaignEnrollments = await prisma.campaignEnrollment.deleteMany({
    where: { campaign: { tenantId: SUMMIT_TENANT_ID } },
  });
  counts['CampaignEnrollment'] = campaignEnrollments.count;
  log(`  Deleted ${campaignEnrollments.count} campaign enrollments`, colors.cyan);

  // 3. Activities (references Contact, Deal)
  const activities = await prisma.activity.deleteMany({
    where: { tenantId: SUMMIT_TENANT_ID },
  });
  counts['Activity'] = activities.count;
  log(`  Deleted ${activities.count} activities/tasks`, colors.cyan);

  // 4. Email Messages
  const emailMessages = await prisma.emailMessage.deleteMany({
    where: { tenantId: SUMMIT_TENANT_ID },
  });
  counts['EmailMessage'] = emailMessages.count;
  log(`  Deleted ${emailMessages.count} email messages`, colors.cyan);

  // 5. SMS Messages
  const smsMessages = await prisma.smsMessage.deleteMany({
    where: { tenantId: SUMMIT_TENANT_ID },
  });
  counts['SmsMessage'] = smsMessages.count;
  log(`  Deleted ${smsMessages.count} SMS messages`, colors.cyan);

  // 6. Call Logs
  const callLogs = await prisma.callLog.deleteMany({
    where: { tenantId: SUMMIT_TENANT_ID },
  });
  counts['CallLog'] = callLogs.count;
  log(`  Deleted ${callLogs.count} call logs`, colors.cyan);

  // 7. Event Reminders (references CalendarEvent)
  const eventReminders = await prisma.eventReminder.deleteMany({
    where: { event: { tenantId: SUMMIT_TENANT_ID } },
  });
  counts['EventReminder'] = eventReminders.count;
  log(`  Deleted ${eventReminders.count} event reminders`, colors.cyan);

  // 8. Event Attendees (references CalendarEvent)
  const eventAttendees = await prisma.eventAttendee.deleteMany({
    where: { event: { tenantId: SUMMIT_TENANT_ID } },
  });
  counts['EventAttendee'] = eventAttendees.count;
  log(`  Deleted ${eventAttendees.count} event attendees`, colors.cyan);

  // 9. Calendar Events
  const calendarEvents = await prisma.calendarEvent.deleteMany({
    where: { tenantId: SUMMIT_TENANT_ID },
  });
  counts['CalendarEvent'] = calendarEvents.count;
  log(`  Deleted ${calendarEvents.count} calendar events`, colors.cyan);

  // 10. Deals
  const deals = await prisma.deal.deleteMany({
    where: { tenantId: SUMMIT_TENANT_ID },
  });
  counts['Deal'] = deals.count;
  log(`  Deleted ${deals.count} deals`, colors.cyan);

  // 11. Contacts
  const contacts = await prisma.contact.deleteMany({
    where: { tenantId: SUMMIT_TENANT_ID },
  });
  counts['Contact'] = contacts.count;
  log(`  Deleted ${contacts.count} contacts`, colors.cyan);

  // 12. Campaign Steps (cascade should handle, but explicit is safer)
  const campaignSteps = await prisma.campaignStep.deleteMany({
    where: { campaign: { tenantId: SUMMIT_TENANT_ID } },
  });
  counts['CampaignStep'] = campaignSteps.count;
  log(`  Deleted ${campaignSteps.count} campaign steps`, colors.cyan);

  // 13. Campaigns
  const campaigns = await prisma.campaign.deleteMany({
    where: { tenantId: SUMMIT_TENANT_ID },
  });
  counts['Campaign'] = campaigns.count;
  log(`  Deleted ${campaigns.count} campaigns`, colors.cyan);

  // 14. Workflow Nodes (cascade should handle)
  const workflowNodes = await prisma.workflowNode.deleteMany({
    where: { workflow: { tenantId: SUMMIT_TENANT_ID } },
  });
  counts['WorkflowNode'] = workflowNodes.count;
  log(`  Deleted ${workflowNodes.count} workflow nodes`, colors.cyan);

  // 15. Workflows
  const workflows = await prisma.workflow.deleteMany({
    where: { tenantId: SUMMIT_TENANT_ID },
  });
  counts['Workflow'] = workflows.count;
  log(`  Deleted ${workflows.count} workflows`, colors.cyan);

  // 16. Funnel Stages (cascade should handle)
  const funnelStages = await prisma.funnelStage.deleteMany({
    where: { funnel: { tenantId: SUMMIT_TENANT_ID } },
  });
  counts['FunnelStage'] = funnelStages.count;
  log(`  Deleted ${funnelStages.count} funnel stages`, colors.cyan);

  // 17. Funnels
  const funnels = await prisma.funnel.deleteMany({
    where: { tenantId: SUMMIT_TENANT_ID },
  });
  counts['Funnel'] = funnels.count;
  log(`  Deleted ${funnels.count} funnels`, colors.cyan);

  // 18. Products
  const products = await prisma.product.deleteMany({
    where: { tenantId: SUMMIT_TENANT_ID },
  });
  counts['Product'] = products.count;
  log(`  Deleted ${products.count} products`, colors.cyan);

  // 19. Email Templates
  const emailTemplates = await prisma.emailTemplate.deleteMany({
    where: { tenantId: SUMMIT_TENANT_ID },
  });
  counts['EmailTemplate'] = emailTemplates.count;
  log(`  Deleted ${emailTemplates.count} email templates`, colors.cyan);

  // 20. Monthly Themes
  const monthlyThemes = await prisma.monthlyTheme.deleteMany({
    where: { tenantId: SUMMIT_TENANT_ID },
  });
  counts['MonthlyTheme'] = monthlyThemes.count;
  log(`  Deleted ${monthlyThemes.count} monthly themes`, colors.cyan);

  // 21. Personas
  const personas = await prisma.persona.deleteMany({
    where: { tenantId: SUMMIT_TENANT_ID },
  });
  counts['Persona'] = personas.count;
  log(`  Deleted ${personas.count} personas`, colors.cyan);

  // 22. Brand Profile
  const brandProfile = await prisma.brandProfile.deleteMany({
    where: { tenantId: SUMMIT_TENANT_ID },
  });
  counts['BrandProfile'] = brandProfile.count;
  log(`  Deleted ${brandProfile.count} brand profile`, colors.cyan);

  // 23. Pipeline Stages
  const pipelineStages = await prisma.pipelineStage.deleteMany({
    where: { tenantId: SUMMIT_TENANT_ID },
  });
  counts['PipelineStage'] = pipelineStages.count;
  log(`  Deleted ${pipelineStages.count} pipeline stages`, colors.cyan);

  // 24. Users (keeping these so demo logins still work)
  // We'll just reset their passwords instead
  const users = await prisma.user.findMany({
    where: { tenantId: SUMMIT_TENANT_ID },
  });
  log(`  Preserved ${users.length} users (demo logins remain active)`, colors.green);

  log('', colors.reset);
  log('Deletion complete!', colors.green);

  // Summary
  const totalDeleted = Object.values(counts).reduce((a, b) => a + b, 0);
  log(`Total records deleted: ${totalDeleted}`, colors.yellow);
}

function runSeedScript(scriptName: string): void {
  // Only allow hardcoded seed scripts - prevents any injection
  if (!SEED_SCRIPTS.includes(scriptName as typeof SEED_SCRIPTS[number])) {
    throw new Error(`Invalid seed script: ${scriptName}`);
  }

  // Using execSync with hardcoded npm run command - safe since script names are hardcoded
  execSync(`npm run ${scriptName}`, {
    cwd: process.cwd(),
    stdio: 'inherit',
  });
}

async function runSeeds(): Promise<void> {
  log('', colors.reset);
  log('═══════════════════════════════════════════════════════════════', colors.green);
  log('  RE-SEEDING SUMMIT HOME SERVICES DATA', colors.green);
  log('═══════════════════════════════════════════════════════════════', colors.green);
  log('', colors.reset);

  const seedInfo = [
    { name: 'Phase 1: Foundation', script: SEED_SCRIPTS[0] },
    { name: 'Phase 2: Contacts & Deals', script: SEED_SCRIPTS[1] },
    { name: 'Phase 3: Communications & Tasks', script: SEED_SCRIPTS[2] },
    { name: 'Phase 4: CMO Marketing Data', script: SEED_SCRIPTS[3] },
  ];

  for (const seed of seedInfo) {
    log(`\nRunning ${seed.name}...`, colors.blue);
    log('─'.repeat(50), colors.blue);

    try {
      runSeedScript(seed.script);
      log(`✓ ${seed.name} complete`, colors.green);
    } catch (error) {
      log(`✗ ${seed.name} FAILED`, colors.red);
      throw error;
    }
  }
}

async function main() {
  console.log('');
  log('╔═══════════════════════════════════════════════════════════════╗', colors.magenta);
  log('║                                                               ║', colors.magenta);
  log('║     SUMMIT HOME SERVICES - DEMO RESET SCRIPT                  ║', colors.magenta);
  log('║                                                               ║', colors.magenta);
  log('╚═══════════════════════════════════════════════════════════════╝', colors.magenta);
  console.log('');

  // Safety check: verify we're targeting the correct tenant
  const tenantValid = await verifyTenant();
  if (!tenantValid) {
    process.exit(1);
  }

  // Show warning
  log('', colors.reset);
  log('⚠️  WARNING: This will DELETE all data for Summit Home Services!', colors.yellow);
  log('', colors.reset);
  log('The following will be deleted:', colors.yellow);
  log('  • All contacts and deals', colors.yellow);
  log('  • All communications (emails, calls, SMS)', colors.yellow);
  log('  • All activities and tasks', colors.yellow);
  log('  • All CMO data (campaigns, workflows, funnels, etc.)', colors.yellow);
  log('  • All products and pipeline stages', colors.yellow);
  log('', colors.reset);
  log('Users will be PRESERVED so demo logins continue to work.', colors.green);
  log('', colors.reset);

  // Get confirmation
  const confirmed = await promptConfirmation('Are you sure you want to reset the demo tenant?');

  if (!confirmed) {
    log('', colors.reset);
    log('Reset cancelled.', colors.yellow);
    process.exit(0);
  }

  try {
    // Delete all data
    await deleteAllTenantData();

    // Re-run all seeds
    await runSeeds();

    // Final summary
    log('', colors.reset);
    log('═══════════════════════════════════════════════════════════════', colors.green);
    log('  DEMO RESET COMPLETE!', colors.green);
    log('═══════════════════════════════════════════════════════════════', colors.green);
    log('', colors.reset);
    log('Summit Home Services demo tenant has been reset to a clean state.', colors.green);
    log('', colors.reset);
    log('Demo Logins:', colors.cyan);
    log('  URL:      https://app.zanderos.com', colors.cyan);
    log('  Email:    mike@summithomeservices.com', colors.cyan);
    log('  Password: SummitDemo2026!', colors.cyan);
    log('', colors.reset);

  } catch (error) {
    log('', colors.reset);
    log('═══════════════════════════════════════════════════════════════', colors.red);
    log('  RESET FAILED', colors.red);
    log('═══════════════════════════════════════════════════════════════', colors.red);
    console.error(error);
    process.exit(1);
  }
}

main()
  .catch((e) => {
    console.error('Unexpected error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
