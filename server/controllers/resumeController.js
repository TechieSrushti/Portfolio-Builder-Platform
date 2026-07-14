import Resume from '../models/Resume.js';
import PDFDocument from 'pdfkit';

// @desc    Get user resume
// @route   GET /api/resumes
// @access  Private
export const getResume = async (req, res, next) => {
  try {
    let resume = await Resume.findOne({ user: req.user._id });

    if (!resume) {
      // Create a default initial empty resume structure
      resume = await Resume.create({
        user: req.user._id,
        personalDetails: {
          fullName: req.user.name,
          email: req.user.email,
          phone: '',
          website: '',
          location: '',
          summary: 'Ambitious developer looking for new opportunities.',
          github: '',
          linkedin: '',
          twitter: '',
        },
        workExperience: [],
        education: [],
        skills: ['JavaScript', 'React', 'Node.js'],
        projects: [],
      });
    }

    res.json({ success: true, resume });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user resume
// @route   PUT /api/resumes
// @access  Private
export const updateResume = async (req, res, next) => {
  const { title, templateType, personalDetails, workExperience, education, skills, projects, certifications } = req.body;

  try {
    let resume = await Resume.findOne({ user: req.user._id });

    if (!resume) {
      return res.status(404).json({ success: false, message: 'Resume not found' });
    }

    resume.title = title || resume.title;
    resume.templateType = templateType || resume.templateType;
    resume.personalDetails = personalDetails || resume.personalDetails;
    resume.workExperience = workExperience || resume.workExperience;
    resume.education = education || resume.education;
    resume.skills = skills || resume.skills;
    resume.projects = projects || resume.projects;
    resume.certifications = certifications || resume.certifications;

    await resume.save();
    res.json({ success: true, message: 'Resume updated successfully', resume });
  } catch (error) {
    next(error);
  }
};

// @desc    Download Resume PDF
// @route   GET /api/resumes/pdf
// @access  Private
export const downloadResumePdf = async (req, res, next) => {
  try {
    const resume = await Resume.findOne({ user: req.user._id });

    if (!resume) {
      return res.status(404).json({ success: false, message: 'No resume found. Create one first.' });
    }

    // Set up PDF doc response header
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=Resume-${resume.personalDetails.fullName.replace(/\s+/g, '-')}.pdf`);

    const doc = new PDFDocument({ margin: 50, size: 'A4' });

    // Pipe the PDF directly to Express response
    doc.pipe(res);

    const { fullName, email, phone, website, location, summary, github, linkedin } = resume.personalDetails;

    // Header styling
    doc.fillColor('#1e3a8a').fontSize(26).text(fullName || 'My Name', { align: 'center' });
    doc.moveDown(0.2);

    doc.fillColor('#4b5563').fontSize(10);
    const contactInfo = [email, phone, location, website].filter(Boolean).join('  |  ');
    doc.text(contactInfo, { align: 'center' });

    const socialInfo = [github, linkedin].filter(Boolean).join('  |  ');
    if (socialInfo) {
      doc.moveDown(0.1);
      doc.text(socialInfo, { align: 'center' });
    }

    doc.moveDown(0.5);
    doc.strokeColor('#e5e7eb').lineWidth(1).moveTo(50, doc.y).lineTo(545, doc.y).stroke();
    doc.moveDown(0.5);

    // Profile summary section
    if (summary) {
      doc.fillColor('#1e3a8a').fontSize(14).text('PROFESSIONAL SUMMARY', { underline: false });
      doc.moveDown(0.2);
      doc.fillColor('#1f2937').fontSize(11).text(summary, { align: 'justify', lineGap: 3 });
      doc.moveDown(0.8);
    }

    // Experience section
    if (resume.workExperience && resume.workExperience.length > 0) {
      doc.fillColor('#1e3a8a').fontSize(14).text('WORK EXPERIENCE');
      doc.moveDown(0.3);

      resume.workExperience.forEach((job) => {
        doc.fillColor('#111827').fontSize(12).text(`${job.position} - ${job.company}`, { bold: true });
        doc.fillColor('#6b7280').fontSize(10).text(`${job.startDate} to ${job.current ? 'Present' : job.endDate}`, { align: 'right' });
        doc.moveUp(1);
        doc.text(`   `); // spacing fix
        doc.moveDown(0.2);
        doc.fillColor('#374151').fontSize(10).text(job.description, { lineGap: 2 });
        doc.moveDown(0.6);
      });
      doc.moveDown(0.5);
    }

    // Education section
    if (resume.education && resume.education.length > 0) {
      doc.fillColor('#1e3a8a').fontSize(14).text('EDUCATION');
      doc.moveDown(0.3);

      resume.education.forEach((edu) => {
        doc.fillColor('#111827').fontSize(12).text(`${edu.degree} in ${edu.fieldOfStudy}`, { bold: true });
        doc.fillColor('#6b7280').fontSize(10).text(`${edu.startDate} - ${edu.endDate}`, { align: 'right' });
        doc.moveUp(1);
        doc.text(`   `); // spacing fix
        doc.moveDown(0.2);
        doc.fillColor('#374151').fontSize(10).text(edu.institution);
        if (edu.description) {
          doc.fillColor('#4b5563').fontSize(9).text(edu.description);
        }
        doc.moveDown(0.6);
      });
      doc.moveDown(0.5);
    }

    // Skills section
    if (resume.skills && resume.skills.length > 0) {
      doc.fillColor('#1e3a8a').fontSize(14).text('TECHNICAL SKILLS');
      doc.moveDown(0.3);
      doc.fillColor('#1f2937').fontSize(11).text(resume.skills.join(', '), { lineGap: 3 });
      doc.moveDown(0.8);
    }

    // Certifications section
    if (resume.certifications && resume.certifications.length > 0) {
      doc.fillColor('#1e3a8a').fontSize(14).text('CERTIFICATIONS');
      doc.moveDown(0.3);

      resume.certifications.forEach((cert) => {
        doc.fillColor('#111827').fontSize(11).text(`${cert.name} - ${cert.issuer} (${cert.date})`);
      });
    }

    doc.end();
  } catch (error) {
    next(error);
  }
};
