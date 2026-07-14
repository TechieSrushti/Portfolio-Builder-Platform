import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini if key is provided
let aiModel = null;
if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_api_key') {
  try {
    const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    aiModel = ai.getGenerativeModel({ model: 'gemini-1.5-flash' });
    console.log('Gemini AI initialized successfully!');
  } catch (error) {
    console.error('Error initializing Gemini AI:', error);
  }
} else {
  console.log('Running AI services in template-based fallback mode. Set GEMINI_API_KEY to activate live AI generation.');
}

// Fallback template generators for offline mode
const generateFallbackBio = (name, role, skills, tone = 'professional') => {
  const skillsText = skills ? skills.split(',').map(s => s.trim()).join(' and ') : 'design and technology';
  
  if (tone === 'creative') {
    return `Hi, I am ${name}! I am a visionary ${role} driven by curiosity and design. I specialize in blending artistic perspectives with ${skillsText} to create immersive products that capture imagination and deliver joy.`;
  }
  if (tone === 'startup') {
    return `Hey, I'm ${name}, a fast-paced ${role} who loves building from 0 to 1. Leveraging deep expertise in ${skillsText}, I help high-growth startups build scalable systems, refine product-market fit, and launch user-focused interfaces.`;
  }
  // Professional default
  return `Highly analytical and results-oriented ${role} with a proven track record in ${skillsText}. Dedicated to building premium applications, leading cross-functional collaborations, and engineering optimized client-side interfaces that solve complex real-world challenges.`;
};

const generateFallbackProject = (title, tech, description) => {
  const techList = tech ? tech.split(',').map(t => t.trim()).join(', ') : 'modern stacks';
  return `Successfully built and deployed "${title}", a high-performance web solution engineered using ${techList}. The application resolves critical bottlenecks by introducing ${description || 'scalable user flows'}. Key achievements include reducing transaction times, streamlining styling architectures, and maximizing responsive viewport performance across desktop and mobile screens.`;
};

const suggestFallbackSkills = (role) => {
  const roleLower = (role || '').toLowerCase();
  if (roleLower.includes('developer') || roleLower.includes('engineer') || roleLower.includes('programmer')) {
    return ['JavaScript', 'TypeScript', 'React.js', 'Node.js', 'MongoDB', 'CSS3', 'REST APIs', 'System Architecture', 'Git Version Control'];
  }
  if (roleLower.includes('design') || roleLower.includes('photographer') || roleLower.includes('artist')) {
    return ['User Interface (UI)', 'User Experience (UX)', 'Figma Design', 'Adobe Photoshop', 'Typography', 'Color Theory', 'Wireframing', 'Prototyping', 'Visual Branding'];
  }
  return ['Communication', 'Project Management', 'Problem Solving', 'Creative Thinking', 'Team Collaboration', 'Detail Oriented', 'Leadership', 'Strategic Planning'];
};

const generateFallbackHeadline = (role, industry = 'tech') => {
  return [
    `Crafting Elegant Solutions as a Senior ${role}`,
    `Engineering the Future of ${industry} through Clean Code`,
    `A Creative ${role} Bridging the Gap Between Design and Performance`,
    `Designing Exceptional Experiences in the ${industry} Ecosystem`
  ];
};

// @desc    Generate professional bio
// @route   POST /api/ai/bio
// @access  Private
export const generateBio = async (req, res, next) => {
  const { name, role, skills, tone } = req.body;

  try {
    if (aiModel) {
      const prompt = `Write a short, engaging, and professional bio (maximum 3-4 sentences) for an online portfolio website. Name: ${name || 'User'}. Role: ${role}. Skills: ${skills}. Tone: ${tone || 'professional'}. Make it sound modern, premium, and human-written. Do not include placeholders.`;
      const result = await aiModel.generateContent(prompt);
      const text = result.response.text();
      return res.json({ success: true, text: text.trim() });
    }

    // Fallback response
    const text = generateFallbackBio(name || req.user.name, role || 'Developer', skills, tone);
    res.json({ success: true, text, isFallback: true });
  } catch (error) {
    next(error);
  }
};

// @desc    Generate project description
// @route   POST /api/ai/project-desc
// @access  Private
export const generateProjectDesc = async (req, res, next) => {
  const { title, tech, description } = req.body;

  try {
    if (aiModel) {
      const prompt = `Write a professional, impact-focused project description (maximum 3 sentences) for a developer/designer portfolio. Project Title: ${title}. Tech stack used: ${tech}. Quick notes: ${description || 'scalable system'}. Emphasize the value created, clean code, and technology integration.`;
      const result = await aiModel.generateContent(prompt);
      const text = result.response.text();
      return res.json({ success: true, text: text.trim() });
    }

    // Fallback response
    const text = generateFallbackProject(title || 'My Project', tech, description);
    res.json({ success: true, text, isFallback: true });
  } catch (error) {
    next(error);
  }
};

// @desc    Suggest skills based on role
// @route   POST /api/ai/skills-suggestion
// @access  Private
export const suggestSkills = async (req, res, next) => {
  const { role } = req.body;

  try {
    if (aiModel) {
      const prompt = `Suggest a JSON list of exactly 8-10 technical and design skills relevant to the role: "${role}". Respond only with a raw JSON array of strings, e.g., ["React", "CSS"]. Do not include markdown code block formatting or explanation.`;
      const result = await aiModel.generateContent(prompt);
      const text = result.response.text().trim();
      
      // Attempt to clean JSON formatting
      const cleanJsonStr = text.replace(/```json|```/g, '').trim();
      const skillsArray = JSON.parse(cleanJsonStr);
      return res.json({ success: true, skills: skillsArray });
    }
  } catch (error) {
    console.error('Gemini Skills Parse Error, falling back:', error);
  }

  // Fallback response
  const skills = suggestFallbackSkills(role);
  res.json({ success: true, skills, isFallback: true });
};

// @desc    Generate resume summary
// @route   POST /api/ai/resume-summary
// @access  Private
export const generateResumeSummary = async (req, res, next) => {
  const { role, yearsExp, accomplishments } = req.body;

  try {
    if (aiModel) {
      const prompt = `Write a powerful professional summary statement (maximum 3 sentences) for a CV/Resume. Role: ${role}. Years of Experience: ${yearsExp}. Key Accomplishments/Interests: ${accomplishments || 'scalable design'}. Make it highly executive and results-focused.`;
      const result = await aiModel.generateContent(prompt);
      const text = result.response.text();
      return res.json({ success: true, text: text.trim() });
    }

    // Fallback
    const accomplishmentsText = accomplishments ? `Specializing in ${accomplishments}, I have successfully built` : 'I have built';
    const text = `Accomplished ${role} with over ${yearsExp || '3'} years of industry experience. ${accomplishmentsText} and deployed multiple high-availability frontend systems. Committed to engineering testable web components, optimizing SEO performance, and collaborating in agile teams to drive digital innovation.`;
    res.json({ success: true, text, isFallback: true });
  } catch (error) {
    next(error);
  }
};

// @desc    Generate headline alternatives
// @route   POST /api/ai/headline
// @access  Private
export const generateHeadline = async (req, res, next) => {
  const { role, industry } = req.body;

  try {
    if (aiModel) {
      const prompt = `Generate a JSON array of exactly 4 creative and catchy landing page hero headlines (short, maximum 8 words) for a portfolio website. Role: ${role}. Industry: ${industry || 'technology'}. Respond with raw JSON array of strings only. No markdown formatting.`;
      const result = await aiModel.generateContent(prompt);
      const text = result.response.text().trim();
      const cleanJsonStr = text.replace(/```json|```/g, '').trim();
      const headlinesArray = JSON.parse(cleanJsonStr);
      return res.json({ success: true, headlines: headlinesArray });
    }
  } catch (error) {
    console.error('Gemini Headlines Parse Error, falling back:', error);
  }

  // Fallback
  const headlines = generateFallbackHeadline(role || 'Engineer', industry);
  res.json({ success: true, headlines, isFallback: true });
};
