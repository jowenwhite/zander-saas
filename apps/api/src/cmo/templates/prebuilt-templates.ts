/**
 * Pre-built Email Templates
 * Starter templates users can clone into their own templates
 */

export interface PrebuiltTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  subject: string;
  thumbnail: string;
  body: {
    version: string;
    settings: Record<string, any>;
    blocks: any[];
  };
}

export const prebuiltTemplates: PrebuiltTemplate[] = [
  {
    id: 'welcome-email',
    name: 'Welcome Email',
    description: 'A warm welcome email for new subscribers with personalized greeting',
    category: 'onboarding',
    subject: 'Welcome to {{company_name}}!',
    thumbnail: '/templates/welcome-thumb.png',
    body: {
      version: '1.0',
      settings: {
        backgroundColor: '#f4f4f4',
        contentWidth: 600,
        fontFamily: 'Arial, sans-serif',
        defaultTextColor: '#333333',
      },
      blocks: [
        {
          id: 'header-1',
          type: 'header',
          settings: {
            backgroundColor: '#ffffff',
            padding: { top: 30, right: 20, bottom: 30, left: 20 },
            alignment: 'center',
          },
          content: {
            logoUrl: '{{logo_url}}',
            logoAlt: '{{company_name}}',
            logoWidth: 150,
            showNav: false,
          },
        },
        {
          id: 'text-1',
          type: 'text',
          settings: {
            backgroundColor: '#ffffff',
            padding: { top: 20, right: 40, bottom: 10, left: 40 },
            alignment: 'center',
          },
          content: {
            html: '<h1 style="margin: 0; font-size: 28px; color: #333;">Welcome, {{firstName}}!</h1>',
          },
        },
        {
          id: 'text-2',
          type: 'text',
          settings: {
            backgroundColor: '#ffffff',
            padding: { top: 10, right: 40, bottom: 20, left: 40 },
            alignment: 'center',
          },
          content: {
            html: "<p style=\"margin: 0; font-size: 16px; line-height: 1.6;\">We're thrilled to have you join us. You're now part of a community that's dedicated to helping you succeed.</p>",
          },
        },
        {
          id: 'button-1',
          type: 'button',
          settings: {
            backgroundColor: '#ffffff',
            padding: { top: 20, right: 40, bottom: 30, left: 40 },
            alignment: 'center',
          },
          content: {
            text: 'Get Started',
            url: '{{dashboard_url}}',
            buttonColor: '#F57C00',
            textColor: '#ffffff',
            borderRadius: 6,
            fullWidth: false,
          },
        },
        {
          id: 'divider-1',
          type: 'divider',
          settings: {
            backgroundColor: '#ffffff',
            padding: { top: 10, right: 40, bottom: 10, left: 40 },
          },
          content: {
            lineColor: '#eeeeee',
            lineStyle: 'solid',
            lineThickness: 1,
            lineWidth: 100,
          },
        },
        {
          id: 'footer-1',
          type: 'footer',
          settings: {
            backgroundColor: '#f8f8f8',
            padding: { top: 30, right: 40, bottom: 30, left: 40 },
            alignment: 'center',
            textColor: '#666666',
            fontSize: 12,
          },
          content: {
            companyName: '{{company_name}}',
            address: '{{company_address}}',
            unsubscribeText: 'Unsubscribe from these emails',
            unsubscribeUrl: '{{unsubscribe_url}}',
          },
        },
      ],
    },
  },
  {
    id: 'newsletter',
    name: 'Newsletter',
    description: 'Clean newsletter layout with multiple content sections',
    category: 'marketing',
    subject: '{{company_name}} Newsletter - {{month}} Update',
    thumbnail: '/templates/newsletter-thumb.png',
    body: {
      version: '1.0',
      settings: {
        backgroundColor: '#f4f4f4',
        contentWidth: 600,
        fontFamily: 'Arial, sans-serif',
        defaultTextColor: '#333333',
      },
      blocks: [
        {
          id: 'header-1',
          type: 'header',
          settings: {
            backgroundColor: '#0C2340',
            padding: { top: 25, right: 20, bottom: 25, left: 20 },
            alignment: 'center',
          },
          content: {
            logoUrl: '{{logo_url}}',
            logoAlt: '{{company_name}}',
            logoWidth: 140,
            showNav: false,
          },
        },
        {
          id: 'text-1',
          type: 'text',
          settings: {
            backgroundColor: '#ffffff',
            padding: { top: 30, right: 40, bottom: 10, left: 40 },
            alignment: 'left',
          },
          content: {
            html: '<h1 style="margin: 0; font-size: 24px; color: #0C2340;">Monthly Update</h1>',
          },
        },
        {
          id: 'text-2',
          type: 'text',
          settings: {
            backgroundColor: '#ffffff',
            padding: { top: 10, right: 40, bottom: 20, left: 40 },
            alignment: 'left',
          },
          content: {
            html: '<p style="margin: 0; font-size: 16px; line-height: 1.6;">Hi {{firstName}},</p><p style="margin: 15px 0 0 0; font-size: 16px; line-height: 1.6;">Here\'s what\'s new this month...</p>',
          },
        },
        {
          id: 'divider-1',
          type: 'divider',
          settings: {
            backgroundColor: '#ffffff',
            padding: { top: 15, right: 40, bottom: 15, left: 40 },
          },
          content: {
            lineColor: '#eeeeee',
            lineStyle: 'solid',
            lineThickness: 1,
            lineWidth: 100,
          },
        },
        {
          id: 'text-3',
          type: 'text',
          settings: {
            backgroundColor: '#ffffff',
            padding: { top: 15, right: 40, bottom: 10, left: 40 },
            alignment: 'left',
          },
          content: {
            html: '<h2 style="margin: 0; font-size: 20px; color: #333;">Featured Article</h2>',
          },
        },
        {
          id: 'image-1',
          type: 'image',
          settings: {
            backgroundColor: '#ffffff',
            padding: { top: 10, right: 40, bottom: 10, left: 40 },
            alignment: 'center',
          },
          content: {
            src: 'https://via.placeholder.com/520x260',
            alt: 'Featured image',
            width: 'full',
            linkUrl: '',
          },
        },
        {
          id: 'text-4',
          type: 'text',
          settings: {
            backgroundColor: '#ffffff',
            padding: { top: 10, right: 40, bottom: 20, left: 40 },
            alignment: 'left',
          },
          content: {
            html: '<p style="margin: 0; font-size: 16px; line-height: 1.6;">Add your featured article content here. Share insights, tips, or announcements that matter to your audience.</p>',
          },
        },
        {
          id: 'button-1',
          type: 'button',
          settings: {
            backgroundColor: '#ffffff',
            padding: { top: 10, right: 40, bottom: 30, left: 40 },
            alignment: 'left',
          },
          content: {
            text: 'Read More',
            url: '#',
            buttonColor: '#F57C00',
            textColor: '#ffffff',
            borderRadius: 4,
            fullWidth: false,
          },
        },
        {
          id: 'social-1',
          type: 'social',
          settings: {
            backgroundColor: '#f8f8f8',
            padding: { top: 25, right: 40, bottom: 15, left: 40 },
            alignment: 'center',
            iconSize: 'medium',
          },
          content: {
            links: [
              { platform: 'facebook', url: '#' },
              { platform: 'twitter', url: '#' },
              { platform: 'instagram', url: '#' },
              { platform: 'linkedin', url: '#' },
            ],
          },
        },
        {
          id: 'footer-1',
          type: 'footer',
          settings: {
            backgroundColor: '#f8f8f8',
            padding: { top: 15, right: 40, bottom: 30, left: 40 },
            alignment: 'center',
            textColor: '#666666',
            fontSize: 12,
          },
          content: {
            companyName: '{{company_name}}',
            address: '{{company_address}}',
            unsubscribeText: 'Unsubscribe',
            unsubscribeUrl: '{{unsubscribe_url}}',
          },
        },
      ],
    },
  },
  {
    id: 'promotion',
    name: 'Promotion',
    description: 'Eye-catching promotional email with strong call-to-action',
    category: 'sales',
    subject: '{{discount_percent}}% OFF - Limited Time Offer!',
    thumbnail: '/templates/promotion-thumb.png',
    body: {
      version: '1.0',
      settings: {
        backgroundColor: '#f4f4f4',
        contentWidth: 600,
        fontFamily: 'Arial, sans-serif',
        defaultTextColor: '#333333',
      },
      blocks: [
        {
          id: 'header-1',
          type: 'header',
          settings: {
            backgroundColor: '#BF0A30',
            padding: { top: 20, right: 20, bottom: 20, left: 20 },
            alignment: 'center',
          },
          content: {
            logoUrl: '{{logo_url}}',
            logoAlt: '{{company_name}}',
            logoWidth: 120,
            showNav: false,
          },
        },
        {
          id: 'image-1',
          type: 'image',
          settings: {
            backgroundColor: '#ffffff',
            padding: { top: 0, right: 0, bottom: 0, left: 0 },
            alignment: 'center',
          },
          content: {
            src: 'https://via.placeholder.com/600x300',
            alt: 'Sale banner',
            width: 'full',
            linkUrl: '{{offer_url}}',
          },
        },
        {
          id: 'text-1',
          type: 'text',
          settings: {
            backgroundColor: '#ffffff',
            padding: { top: 30, right: 40, bottom: 10, left: 40 },
            alignment: 'center',
          },
          content: {
            html: '<h1 style="margin: 0; font-size: 36px; color: #BF0A30;">{{discount_percent}}% OFF</h1>',
          },
        },
        {
          id: 'text-2',
          type: 'text',
          settings: {
            backgroundColor: '#ffffff',
            padding: { top: 10, right: 40, bottom: 20, left: 40 },
            alignment: 'center',
          },
          content: {
            html: '<p style="margin: 0; font-size: 18px; line-height: 1.6;">Don\'t miss out on this exclusive offer! Use code <strong>{{promo_code}}</strong> at checkout.</p>',
          },
        },
        {
          id: 'button-1',
          type: 'button',
          settings: {
            backgroundColor: '#ffffff',
            padding: { top: 20, right: 40, bottom: 30, left: 40 },
            alignment: 'center',
          },
          content: {
            text: 'Shop Now',
            url: '{{offer_url}}',
            buttonColor: '#BF0A30',
            textColor: '#ffffff',
            borderRadius: 6,
            fullWidth: false,
          },
        },
        {
          id: 'text-3',
          type: 'text',
          settings: {
            backgroundColor: '#f8f8f8',
            padding: { top: 20, right: 40, bottom: 20, left: 40 },
            alignment: 'center',
          },
          content: {
            html: '<p style="margin: 0; font-size: 14px; color: #666;">Offer expires {{expiry_date}}. Terms and conditions apply.</p>',
          },
        },
        {
          id: 'footer-1',
          type: 'footer',
          settings: {
            backgroundColor: '#333333',
            padding: { top: 25, right: 40, bottom: 25, left: 40 },
            alignment: 'center',
            textColor: '#aaaaaa',
            fontSize: 12,
          },
          content: {
            companyName: '{{company_name}}',
            unsubscribeText: 'Unsubscribe',
            unsubscribeUrl: '{{unsubscribe_url}}',
          },
        },
      ],
    },
  },
  {
    id: 'event-invitation',
    name: 'Event Invitation',
    description: 'Professional event invitation with RSVP button',
    category: 'events',
    subject: 'You\'re Invited: {{event_name}}',
    thumbnail: '/templates/event-thumb.png',
    body: {
      version: '1.0',
      settings: {
        backgroundColor: '#f4f4f4',
        contentWidth: 600,
        fontFamily: 'Arial, sans-serif',
        defaultTextColor: '#333333',
      },
      blocks: [
        {
          id: 'header-1',
          type: 'header',
          settings: {
            backgroundColor: '#0C2340',
            padding: { top: 25, right: 20, bottom: 25, left: 20 },
            alignment: 'center',
          },
          content: {
            logoUrl: '{{logo_url}}',
            logoAlt: '{{company_name}}',
            logoWidth: 140,
            showNav: false,
          },
        },
        {
          id: 'text-1',
          type: 'text',
          settings: {
            backgroundColor: '#ffffff',
            padding: { top: 30, right: 40, bottom: 10, left: 40 },
            alignment: 'center',
          },
          content: {
            html: '<p style="margin: 0; font-size: 14px; text-transform: uppercase; letter-spacing: 2px; color: #F57C00;">You\'re Invited</p>',
          },
        },
        {
          id: 'text-2',
          type: 'text',
          settings: {
            backgroundColor: '#ffffff',
            padding: { top: 10, right: 40, bottom: 20, left: 40 },
            alignment: 'center',
          },
          content: {
            html: '<h1 style="margin: 0; font-size: 32px; color: #0C2340;">{{event_name}}</h1>',
          },
        },
        {
          id: 'divider-1',
          type: 'divider',
          settings: {
            backgroundColor: '#ffffff',
            padding: { top: 10, right: 100, bottom: 10, left: 100 },
          },
          content: {
            lineColor: '#F57C00',
            lineStyle: 'solid',
            lineThickness: 2,
            lineWidth: 100,
          },
        },
        {
          id: 'text-3',
          type: 'text',
          settings: {
            backgroundColor: '#ffffff',
            padding: { top: 20, right: 40, bottom: 20, left: 40 },
            alignment: 'center',
          },
          content: {
            html: '<p style="margin: 0; font-size: 18px; line-height: 1.8;"><strong>Date:</strong> {{event_date}}<br><strong>Time:</strong> {{event_time}}<br><strong>Location:</strong> {{event_location}}</p>',
          },
        },
        {
          id: 'text-4',
          type: 'text',
          settings: {
            backgroundColor: '#ffffff',
            padding: { top: 10, right: 40, bottom: 20, left: 40 },
            alignment: 'center',
          },
          content: {
            html: '<p style="margin: 0; font-size: 16px; line-height: 1.6;">Join us for an exciting event where you\'ll learn, network, and connect with industry leaders.</p>',
          },
        },
        {
          id: 'button-1',
          type: 'button',
          settings: {
            backgroundColor: '#ffffff',
            padding: { top: 20, right: 40, bottom: 30, left: 40 },
            alignment: 'center',
          },
          content: {
            text: 'RSVP Now',
            url: '{{rsvp_url}}',
            buttonColor: '#F57C00',
            textColor: '#ffffff',
            borderRadius: 6,
            fullWidth: false,
          },
        },
        {
          id: 'footer-1',
          type: 'footer',
          settings: {
            backgroundColor: '#f8f8f8',
            padding: { top: 25, right: 40, bottom: 25, left: 40 },
            alignment: 'center',
            textColor: '#666666',
            fontSize: 12,
          },
          content: {
            companyName: '{{company_name}}',
            address: '{{company_address}}',
            unsubscribeText: 'Unsubscribe',
            unsubscribeUrl: '{{unsubscribe_url}}',
          },
        },
      ],
    },
  },
  {
    id: 'follow-up',
    name: 'Follow-up',
    description: 'Simple follow-up email for post-meeting or post-purchase',
    category: 'sales',
    subject: 'Following up on our conversation',
    thumbnail: '/templates/followup-thumb.png',
    body: {
      version: '1.0',
      settings: {
        backgroundColor: '#f4f4f4',
        contentWidth: 600,
        fontFamily: 'Arial, sans-serif',
        defaultTextColor: '#333333',
      },
      blocks: [
        {
          id: 'header-1',
          type: 'header',
          settings: {
            backgroundColor: '#ffffff',
            padding: { top: 30, right: 40, bottom: 20, left: 40 },
            alignment: 'left',
          },
          content: {
            logoUrl: '{{logo_url}}',
            logoAlt: '{{company_name}}',
            logoWidth: 120,
            showNav: false,
          },
        },
        {
          id: 'text-1',
          type: 'text',
          settings: {
            backgroundColor: '#ffffff',
            padding: { top: 20, right: 40, bottom: 10, left: 40 },
            alignment: 'left',
          },
          content: {
            html: '<p style="margin: 0; font-size: 16px; line-height: 1.6;">Hi {{firstName}},</p>',
          },
        },
        {
          id: 'text-2',
          type: 'text',
          settings: {
            backgroundColor: '#ffffff',
            padding: { top: 10, right: 40, bottom: 10, left: 40 },
            alignment: 'left',
          },
          content: {
            html: '<p style="margin: 0; font-size: 16px; line-height: 1.6;">Thank you for taking the time to speak with me. I enjoyed learning more about your goals and discussing how we can help.</p>',
          },
        },
        {
          id: 'text-3',
          type: 'text',
          settings: {
            backgroundColor: '#ffffff',
            padding: { top: 10, right: 40, bottom: 20, left: 40 },
            alignment: 'left',
          },
          content: {
            html: '<p style="margin: 0; font-size: 16px; line-height: 1.6;">As discussed, here are the next steps:</p><ul style="margin: 10px 0; padding-left: 20px; font-size: 16px; line-height: 1.8;"><li>Action item 1</li><li>Action item 2</li><li>Action item 3</li></ul>',
          },
        },
        {
          id: 'button-1',
          type: 'button',
          settings: {
            backgroundColor: '#ffffff',
            padding: { top: 10, right: 40, bottom: 20, left: 40 },
            alignment: 'left',
          },
          content: {
            text: 'Schedule a Call',
            url: '{{calendar_url}}',
            buttonColor: '#F57C00',
            textColor: '#ffffff',
            borderRadius: 4,
            fullWidth: false,
          },
        },
        {
          id: 'text-4',
          type: 'text',
          settings: {
            backgroundColor: '#ffffff',
            padding: { top: 10, right: 40, bottom: 30, left: 40 },
            alignment: 'left',
          },
          content: {
            html: '<p style="margin: 0; font-size: 16px; line-height: 1.6;">Looking forward to hearing from you!</p><p style="margin: 20px 0 0 0; font-size: 16px; line-height: 1.6;">Best regards,<br>{{sender_name}}<br>{{sender_title}}</p>',
          },
        },
        {
          id: 'footer-1',
          type: 'footer',
          settings: {
            backgroundColor: '#f8f8f8',
            padding: { top: 25, right: 40, bottom: 25, left: 40 },
            alignment: 'center',
            textColor: '#666666',
            fontSize: 12,
          },
          content: {
            companyName: '{{company_name}}',
            unsubscribeText: 'Unsubscribe',
            unsubscribeUrl: '{{unsubscribe_url}}',
          },
        },
      ],
    },
  },
];
