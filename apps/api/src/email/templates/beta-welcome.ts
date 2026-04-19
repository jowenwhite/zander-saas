/**
 * Beta Welcome Email Template
 *
 * Sent to new users immediately after registration.
 * Personal, authentic tone that validates the entrepreneurial journey.
 *
 * From: jonathan@zanderos.com
 * Subject: Welcome to Zander — and thank you for taking the leap
 */

const ZANDER_LOGO_URL = 'https://app.zanderos.com/brand/zander-logo.svg';

// Brand colors
const COLORS = {
  background: '#0D1117',
  backgroundGradient: 'linear-gradient(180deg, #0D1117 0%, #161B22 100%)',
  cyan: '#00D4FF',
  red: '#BF0A30',
  white: '#FFFFFF',
  lightGray: 'rgba(255, 255, 255, 0.85)',
  mutedGray: 'rgba(255, 255, 255, 0.6)',
  borderColor: 'rgba(0, 212, 255, 0.2)',
};

/**
 * Generate the beta welcome email HTML
 * @param firstName - User's first name (optional, falls back to "Hi there,")
 */
export function generateBetaWelcomeEmail(firstName?: string): string {
  const greeting = firstName ? `Hi ${firstName},` : 'Hi there,';

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Zander</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: ${COLORS.background};">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: 0 auto;">
    <tr>
      <td style="padding: 40px 30px; background: ${COLORS.backgroundGradient};">

        <!-- Header with Logo -->
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
          <tr>
            <td style="padding-bottom: 30px; border-bottom: 1px solid ${COLORS.borderColor};">
              <img src="${ZANDER_LOGO_URL}" alt="Zander" style="height: 40px; width: auto;">
            </td>
          </tr>
        </table>

        <!-- Email Body -->
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
          <tr>
            <td style="padding: 30px 0;">

              <!-- Opening -->
              <p style="color: ${COLORS.lightGray}; font-size: 16px; line-height: 1.7; margin: 0 0 20px;">
                Before we get into what Zander is and how to use it, I want to tell you something:
              </p>

              <!-- WELL DONE - The emotional anchor -->
              <p style="color: ${COLORS.white}; font-size: 42px; font-weight: 700; margin: 30px 0; letter-spacing: -1px;">
                Well done.
              </p>

              <p style="color: ${COLORS.lightGray}; font-size: 16px; line-height: 1.7; margin: 0 0 20px;">
                Seriously. You took a risk most people will never take. You built something with your own hands, your own time, and your own money. You show up every day to a job where you're the first one in and the last one out, where every problem lands on your desk, and where nobody is coming to save you if it doesn't work. That takes a kind of courage most people don't have. I just want you to know — I see it, and I respect the hell out of it.
              </p>

              <!-- Jonathan's Story -->
              <p style="color: ${COLORS.white}; font-size: 18px; font-weight: 600; margin: 30px 0 15px;">
                I built Zander because I needed it.
              </p>

              <p style="color: ${COLORS.lightGray}; font-size: 16px; line-height: 1.7; margin: 0 0 20px;">
                I run a manufacturing company. Twenty-six years. Along the way I opened a brewpub, started a consulting practice, and got into finance. At any given time I was managing production schedules, chasing invoices, putting out employee fires, juggling five different software platforms, eating lunch at my desk — again — and driving home at night wondering what I actually got done that day.
              </p>

              <p style="color: ${COLORS.lightGray}; font-size: 16px; line-height: 1.7; margin: 0 0 20px;">
                If that sounds familiar, you're in the right place.
              </p>

              <p style="color: ${COLORS.lightGray}; font-size: 16px; line-height: 1.7; margin: 0 0 20px;">
                I tried to fix the overwhelm the way everyone tells you to: buy more software. A CRM here, a project tool there, an email platform, three spreadsheets, and a whiteboard for everything else. Ten tools. None of them talked to each other. Half were out of date. I was spending more time managing my tools than managing my business.
              </p>

              <p style="color: ${COLORS.lightGray}; font-size: 16px; line-height: 1.7; margin: 0 0 20px;">
                So I stopped looking for another tool and built what I actually needed — a team. Not more software. Not another dashboard. A team of AI executives who actually do the work. That's Zander.
              </p>

              <!-- Section: What you're getting into -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin: 35px 0 20px;">
                <tr>
                  <td style="border-left: 3px solid ${COLORS.cyan}; padding-left: 20px;">
                    <p style="color: ${COLORS.cyan}; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em; margin: 0 0 10px;">
                      What you're getting into
                    </p>
                  </td>
                </tr>
              </table>

              <p style="color: ${COLORS.lightGray}; font-size: 16px; line-height: 1.7; margin: 0 0 20px;">
                You are one of our Founding Beta users. That means you're getting in on the ground floor of something we believe is going to fundamentally change how small businesses operate. It also means you're working with software that is still being refined.
              </p>

              <p style="color: ${COLORS.lightGray}; font-size: 16px; line-height: 1.7; margin: 0 0 20px;">
                We have tested Zander extensively, and it works. But this is beta. There will be bugs. There will be things that don't work the way you expect. When that happens — and it will — I want you to know two things: we know about it faster than you think, and we will fix it faster than you expect. This is not a faceless corporation. I am personally invested in your experience, and I will make it right.
              </p>

              <!-- Section: The team behind the curtain -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin: 35px 0 20px;">
                <tr>
                  <td style="border-left: 3px solid ${COLORS.cyan}; padding-left: 20px;">
                    <p style="color: ${COLORS.cyan}; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em; margin: 0 0 10px;">
                      The team behind the curtain
                    </p>
                  </td>
                </tr>
              </table>

              <p style="color: ${COLORS.lightGray}; font-size: 16px; line-height: 1.7; margin: 0 0 20px;">
                I picked the best partners in the industry to power what you're about to use:
              </p>

              <p style="color: ${COLORS.lightGray}; font-size: 16px; line-height: 1.7; margin: 0 0 20px;">
                Your AI executives are powered by <strong style="color: ${COLORS.white};">Anthropic</strong> — the company behind Claude, one of the most capable and responsible AI systems in the world. Your data is protected by <strong style="color: ${COLORS.white};">Amazon Web Services</strong>, the same infrastructure that runs Netflix, NASA, and the largest enterprises on the planet. And everything is connected and delivered through <strong style="color: ${COLORS.white};">Vercel</strong>, the platform trusted by companies like Nike and The Washington Post for performance and reliability.
              </p>

              <p style="color: ${COLORS.lightGray}; font-size: 16px; line-height: 1.7; margin: 0 0 20px;">
                These are industry leaders with exceptional track records. But I'll be transparent with you: when they experience downtime, we experience downtime. It's rare, but it happens. When it does, we'll communicate openly and get things back up as quickly as possible.
              </p>

              <!-- Section: What I hope Zander becomes for you -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin: 35px 0 20px;">
                <tr>
                  <td style="border-left: 3px solid ${COLORS.cyan}; padding-left: 20px;">
                    <p style="color: ${COLORS.cyan}; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em; margin: 0 0 10px;">
                      What I hope Zander becomes for you
                    </p>
                  </td>
                </tr>
              </table>

              <p style="color: ${COLORS.lightGray}; font-size: 16px; line-height: 1.7; margin: 0 0 20px;">
                My hope is simple. I want Zander to give you back the part of your business that made you start it in the first place. The thing that inspired you. The thing that keeps you coming back even on the days when everything breaks and the phone won't stop ringing.
              </p>

              <p style="color: ${COLORS.lightGray}; font-size: 16px; line-height: 1.7; margin: 0 0 20px;">
                You deserve to maximize your strengths — the things you're great at, the reason your business exists — and have real help in the areas where you need it. Without hiring another employee. Without buying another tool that sits half-used in a browser tab.
              </p>

              <p style="color: ${COLORS.white}; font-size: 18px; font-weight: 600; font-style: italic; margin: 30px 0;">
                Freedom for founders. That's what we're building. And I'm grateful you're here to build it with us.
              </p>

              <p style="color: ${COLORS.lightGray}; font-size: 16px; line-height: 1.7; margin: 0 0 30px;">
                Welcome to Zander. Let's get to work.
              </p>

            </td>
          </tr>
        </table>

        <!-- Signature -->
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top: 20px; border-top: 1px solid ${COLORS.borderColor}; padding-top: 25px;">
          <tr>
            <td>
              <table role="presentation" cellspacing="0" cellpadding="0">
                <tr>
                  <!-- Logo Column -->
                  <td style="padding-right: 20px; vertical-align: top;">
                    <img src="${ZANDER_LOGO_URL}" alt="Zander" style="height: 50px; width: auto;" />
                  </td>
                  <!-- Divider -->
                  <td style="border-left: 2px solid ${COLORS.cyan}; padding-left: 20px; vertical-align: top;">
                    <!-- Name and Title -->
                    <p style="color: ${COLORS.white}; font-size: 16px; font-weight: 700; margin: 0 0 2px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                      Jonathan White
                    </p>
                    <p style="color: ${COLORS.mutedGray}; font-size: 14px; margin: 0 0 8px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                      Founder
                    </p>
                    <!-- Contact Info -->
                    <p style="color: ${COLORS.mutedGray}; font-size: 13px; margin: 0; line-height: 1.5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                      Zander Systems LLC<br>
                      <a href="https://zanderos.com" style="color: ${COLORS.cyan}; text-decoration: none;">zanderos.com</a>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>

      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

/**
 * Get email subject line
 */
export const BETA_WELCOME_SUBJECT = 'Welcome to Zander — and thank you for taking the leap';

/**
 * Get email from address
 */
export const BETA_WELCOME_FROM = 'Jonathan from Zander <jonathan@zanderos.com>';

/**
 * Get email reply-to address
 */
export const BETA_WELCOME_REPLY_TO = 'jonathan@zanderos.com';
