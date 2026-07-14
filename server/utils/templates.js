export const getInitialSections = (templateType, name = 'Professional') => {
  const commonHero = {
    id: 'hero-1',
    type: 'Hero',
    title: 'Hero Section',
    visible: true,
    content: {
      headline: `Hi, I am ${name}`,
      subheadline: 'Crafting digital experiences that matter.',
      description: 'I design and build premium web applications and visual identities with absolute precision.',
      primaryBtnText: 'Get in Touch',
      primaryBtnLink: '#contact-1',
      secondaryBtnText: 'View Work',
      secondaryBtnLink: '#projects-1',
      backgroundImage: '',
      avatarImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=500&q=80',
    },
    settings: {
      align: 'left',
      paddingY: '80px',
    },
  };

  const commonAbout = {
    id: 'about-1',
    type: 'About Me',
    title: 'About Me',
    visible: true,
    content: {
      title: 'My Story',
      description: 'I am a passionate creator dedicated to developing elegant, functional solutions. Over the past few years, I have worked with start-ups, scale-ups, and established brands to build user-centric products and aesthetics.',
      stats: [
        { label: 'Years Experience', value: '5+' },
        { label: 'Completed Projects', value: '50+' },
        { label: 'Happy Clients', value: '30+' }
      ],
    },
    settings: {
      backgroundColor: '#f3f4f6',
    },
  };

  const commonSkills = {
    id: 'skills-1',
    type: 'Skills',
    title: 'My Expertise',
    visible: true,
    content: {
      skillsList: [
        { name: 'User Experience (UX)', level: 90 },
        { name: 'React / Next.js', level: 95 },
        { name: 'CSS Grid & Flexbox', level: 90 },
        { name: 'Node.js Backend', level: 85 },
        { name: 'Product Strategy', level: 80 }
      ],
    },
    settings: {},
  };

  const commonProjects = {
    id: 'projects-1',
    type: 'Projects',
    title: 'Featured Projects',
    visible: true,
    content: {
      projectsList: [
        {
          title: 'Premium SaaS Platform',
          description: 'A complete SaaS platform featuring subscription invoicing and real-time dashboard analytics.',
          image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80',
          githubLink: 'https://github.com',
          liveLink: 'https://example.com',
          tech: ['React', 'Node.js', 'MongoDB', 'Stripe'],
        },
        {
          title: 'Design System Library',
          description: 'A component library focusing on premium glassmorphism styles and micro-animations.',
          image: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=800&q=80',
          githubLink: 'https://github.com',
          liveLink: 'https://example.com',
          tech: ['Framer Motion', 'React', 'CSS3'],
        }
      ],
    },
    settings: {},
  };

  const commonExperience = {
    id: 'experience-1',
    type: 'Experience',
    title: 'Work History',
    visible: true,
    content: {
      jobs: [
        {
          company: 'Tech Solutions Inc.',
          position: 'Lead Web Engineer',
          period: '2023 - Present',
          description: 'Led a front-end engineering team to build premium administrative panels and public builders.',
        },
        {
          company: 'Creative Media Studio',
          position: 'Senior UI Developer',
          period: '2021 - 2023',
          description: 'Designed and deployed responsive portfolio portals and photography display layers.',
        }
      ],
    },
    settings: {},
  };

  const commonTestimonials = {
    id: 'testimonials-1',
    type: 'Testimonials',
    title: 'Client Praise',
    visible: true,
    content: {
      reviews: [
        {
          clientName: 'Sarah Jenkins',
          company: 'Co-Founder, Spark Ltd',
          text: 'The portfolio builder was a game changer for my consulting. I set it up in minutes, and received double the client inquires within the first week!',
          avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80',
        },
        {
          clientName: 'David Chen',
          company: 'Freelance Designer',
          text: 'Superb templates. Clean, modern, responsive, and incredibly easy to edit. Highly recommend.',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
        }
      ],
    },
    settings: {},
  };

  const commonContact = {
    id: 'contact-1',
    type: 'Contact',
    title: 'Let\'s Work Together',
    visible: true,
    content: {
      email: 'hello@example.com',
      whatsapp: '+1234567890',
      socials: {
        github: 'https://github.com',
        linkedin: 'https://linkedin.com',
        twitter: 'https://twitter.com',
      },
    },
    settings: {},
  };

  const commonFooter = {
    id: 'footer-1',
    type: 'Footer',
    title: 'Footer',
    visible: true,
    content: {
      copyrightText: `© ${new Date().getFullYear()} ${name}. All Rights Reserved.`,
    },
    settings: {},
  };

  switch (templateType) {
    case 'developer':
      return [
        {
          ...commonHero,
          content: {
            ...commonHero.content,
            headline: 'Hi, I am a Developer',
            subheadline: 'Turning complex problems into clean, testable code.',
            description: 'Full-stack software engineer specializing in scalable APIs, React single-page systems, and robust database layers.',
          },
        },
        commonAbout,
        {
          ...commonSkills,
          content: {
            skillsList: [
              { name: 'JavaScript / TypeScript', level: 95 },
              { name: 'React / Next.js', level: 90 },
              { name: 'Node.js & Express', level: 90 },
              { name: 'MongoDB / Postgres', level: 85 },
              { name: 'System Architecture', level: 80 }
            ],
          },
        },
        commonProjects,
        commonExperience,
        commonContact,
        commonFooter,
      ];

    case 'photographer':
      return [
        {
          ...commonHero,
          content: {
            ...commonHero.content,
            headline: 'Capturing Moments',
            subheadline: 'Professional Portrait & Landscape Photographer.',
            description: 'Telling visual stories through lens, composition, and authentic natural lighting setups.',
            primaryBtnText: 'Book a Shoot',
            avatarImage: 'https://images.unsplash.com/photo-1492633423870-43d1cd2775eb?auto=format&fit=crop&w=500&q=80',
          },
        },
        {
          id: 'gallery-1',
          type: 'Gallery',
          title: 'My Portfolio Shots',
          visible: true,
          content: {
            images: [
              { url: 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?auto=format&fit=crop&w=600&q=80', caption: 'Chasing Sunsets' },
              { url: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=600&q=80', caption: 'Urban Landscapes' },
              { url: 'https://images.unsplash.com/photo-1452784444945-3f422708fe5e?auto=format&fit=crop&w=600&q=80', caption: 'Studio Portraits' },
              { url: 'https://images.unsplash.com/photo-1500485035595-cbe6f645feb1?auto=format&fit=crop&w=600&q=80', caption: 'Nature Details' }
            ],
          },
          settings: {},
        },
        {
          ...commonAbout,
          content: {
            title: 'My Vision',
            description: 'For over a decade, I have been traveling the world to freeze beautiful frames. I work on commercial assignments, editorial stories, and fine-art exhibitions.',
            stats: [
              { label: 'Shoots Completed', value: '200+' },
              { label: 'Awards Won', value: '12' },
              { label: 'Exhibitions Held', value: '5' }
            ],
          },
        },
        commonTestimonials,
        commonContact,
        commonFooter,
      ];

    case 'designer':
    default:
      return [
        commonHero,
        commonAbout,
        commonSkills,
        commonProjects,
        commonTestimonials,
        commonContact,
        commonFooter,
      ];
  }
};

export const getTemplateColors = (templateType) => {
  switch (templateType) {
    case 'dark':
      return {
        primary: '#3b82f6',
        secondary: '#10b981',
        background: '#111827',
        text: '#f9fafb',
      };
    case 'minimal':
      return {
        primary: '#111827',
        secondary: '#6b7280',
        background: '#fafafa',
        text: '#111827',
      };
    case 'creative':
      return {
        primary: '#ec4899',
        secondary: '#8b5cf6',
        background: '#ffffff',
        text: '#1f2937',
      };
    case 'photographer':
      return {
        primary: '#d97706',
        secondary: '#4b5563',
        background: '#ffffff',
        text: '#111827',
      };
    default: // developer / classic
      return {
        primary: '#2563eb',
        secondary: '#3b82f6',
        background: '#ffffff',
        text: '#1f2937',
      };
  }
};
