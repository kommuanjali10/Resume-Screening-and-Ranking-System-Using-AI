const path = require('path');
const fs = require('fs');

/**
 * @desc    Upload one or multiple resume documents (PDF / DOCX)
 * @route   POST /api/resumes/upload
 * @access  Private
 */
const uploadResumes = async (req, res, next) => {
  try {
    if (!req.files && !req.file) {
      return res.status(400).json({
        success: false,
        message: 'No files were uploaded. Please select PDF or DOCX resume files.',
      });
    }

    const rawFiles = req.files || [req.file];
    const uploadedFiles = rawFiles.map((file) => ({
      originalName: file.originalname,
      filename: file.filename,
      mimetype: file.mimetype,
      size: file.size,
      path: `uploads/${file.filename}`,
      uploadDate: new Date(),
    }));

    res.status(200).json({
      success: true,
      message: `Successfully uploaded ${uploadedFiles.length} resume file(s).`,
      count: uploadedFiles.length,
      files: uploadedFiles,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Download or view an uploaded resume file
 * @route   GET /api/resumes/:filename
 * @access  Private
 */
const getResumeFile = async (req, res, next) => {
  try {
    const filename = req.params.filename;
    // Sanitize to prevent path traversal
    const safeFilename = path.basename(filename);
    const filePath = path.join(__dirname, '..', 'uploads', safeFilename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'Requested resume file not found on server.',
      });
    }

    res.sendFile(filePath);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  uploadResumes,
  getResumeFile,
};
