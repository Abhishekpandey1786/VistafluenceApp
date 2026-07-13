const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const cloudinary = require('../utils/cloudinary');
const multer = require('multer');
const streamifier = require('streamifier');

const Course = require('../models/Course');
const Video = require('../models/Video');
const User = require('../models/User');

const adminOnly = [protect, authorize('admin')];
const upload = multer({ storage: multer.memoryStorage() });

// ── Helper: Buffer se Cloudinary upload ──────────────────────────────────────
const uploadToCloudinary = (buffer, options) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(options, (error, result) => {
      if (error) reject(error);
      else resolve(result);
    });
    streamifier.createReadStream(buffer).pipe(stream);
  });
};

// ── Helper: Academy access check (access + expiry dono) ──────────────────────
const checkAcademyAccess = async (userId) => {
  const user = await User.findById(userId).select('academyAccess academyAccessExpiresAt');
  if (!user) return { allowed: false, reason: 'User not found' };

  if (!user.academyAccess) {
    return { allowed: false, reason: 'Academy access nahi hai. Admin se contact karo.' };
  }

  if (user.academyAccessExpiresAt && new Date() > new Date(user.academyAccessExpiresAt)) {
    await User.findByIdAndUpdate(userId, { academyAccess: false });
    return { allowed: false, reason: 'Academy access expire ho gaya. Admin se renew karao.' };
  }

  return { allowed: true };
};

// ── Influencer: Get published courses (ACCESS GATED) ─────────────────────────
router.get('/courses', protect, async (req, res) => {
  try {
    const { allowed, reason } = await checkAcademyAccess(req.user.id);
    if (!allowed) {
      return res.status(403).json({ success: false, message: reason, accessDenied: true });
    }

    const courses = await Course.find({ published: true })
      .populate('videos')
      .sort({ createdAt: -1 });

    res.json({ success: true, courses });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── Influencer: Get single course (ACCESS GATED) ─────────────────────────────
router.get('/courses/:id', protect, async (req, res) => {
  try {
    const { allowed, reason } = await checkAcademyAccess(req.user.id);
    if (!allowed) {
      return res.status(403).json({ success: false, message: reason, accessDenied: true });
    }

    const course = await Course.findOne({ _id: req.params.id, published: true }).populate('videos');
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });

    res.json({ success: true, course });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── Admin: Get ALL courses ────────────────────────────────────────────────────
router.get('/admin/courses', ...adminOnly, async (req, res) => {
  try {
    const courses = await Course.find()
      .populate('videos')
      .sort({ createdAt: -1 });
    res.json({ success: true, courses });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── Admin: Create course ──────────────────────────────────────────────────────
router.post('/admin/courses', ...adminOnly, async (req, res) => {
  try {
    const { title, description, category, level } = req.body;
    const course = await Course.create({ title, description, category, level });
    res.status(201).json({ success: true, course });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// ── Admin: Delete course ──────────────────────────────────────────────────────
router.delete('/admin/courses/:id', ...adminOnly, async (req, res) => {
  try {
    await Course.findByIdAndDelete(req.params.id);
    await Video.deleteMany({ course: req.params.id });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── Admin: Toggle publish ─────────────────────────────────────────────────────
router.patch('/admin/courses/:id/publish', ...adminOnly, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ success: false, message: 'Not found' });
    course.published = !course.published;
    await course.save();
    res.json({ success: true, published: course.published });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── Admin: Upload video + PDF (FILE UPLOAD) ───────────────────────────────────
router.post(
  '/admin/courses/:id/videos',
  ...adminOnly,
  upload.fields([
    { name: 'video', maxCount: 1 },
    { name: 'pdf',   maxCount: 1 },
    { name: 'content', maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const course = await Course.findById(req.params.id);
      if (!course) return res.status(404).json({ success: false, message: 'Course not found' });

      let videoUrl = '', pdfUrl = '', contentUrl = '';

      if (req.files?.video?.[0]) {
        const f = req.files.video[0];
        const result = await uploadToCloudinary(f.buffer, {
          folder: 'vistafluence_academy/videos',
          resource_type: 'video',
        });
        videoUrl = result.secure_url;
      }

      if (req.files?.pdf?.[0]) {
        const f = req.files.pdf[0];
        const result = await uploadToCloudinary(f.buffer, {
          folder: 'vistafluence_academy/pdfs',
          resource_type: 'raw',
        });
        pdfUrl = result.secure_url;
      }

      if (req.files?.content?.[0]) {
        const f = req.files.content[0];
        const result = await uploadToCloudinary(f.buffer, {
          folder: 'vistafluence_academy/content',
          resource_type: 'auto',
        });
        contentUrl = result.secure_url;
      }

      const video = await Video.create({
        course:       course._id,
        title:        req.body.title,
        description:  req.body.description || '',
        durationMins: Number(req.body.durationMins) || 0,
        isFree:       req.body.isFree === 'true',
        videoUrl,
        pdfUrl,
        contentUrl,
        order:        Number(req.body.order) || 0,
      });

      course.videos.push(video._id);
      await course.save();

      res.status(201).json({ success: true, video });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
);

// ── Admin: Delete video ───────────────────────────────────────────────────────
router.delete('/admin/videos/:id', ...adminOnly, async (req, res) => {
  try {
    const video = await Video.findByIdAndDelete(req.params.id);
    if (video) {
      await Course.findByIdAndUpdate(video.course, { $pull: { videos: video._id } });
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── Admin: Toggle academy access for a user ───────────────────────────────────
router.put('/admin/users/:userId/academy', ...adminOnly, async (req, res) => {
  try {
    const { access } = req.body;

    const updateData = { academyAccess: access };
    if (!access) {
      // Access band karne pe password + expiry dono clear karo
      // Password null = purana password bhi kaam nahi karega
      updateData.academyAccessExpiresAt = null;
      updateData.academyPassword = null;
    }

    const user = await User.findByIdAndUpdate(
      req.params.userId,
      updateData,
      { new: true }
    );
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, academyAccess: user.academyAccess });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── Admin: Generate academy password for a user ───────────────────────────────
router.post('/admin/users/:userId/academy-password', ...adminOnly, async (req, res) => {
  try {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
    let password = 'VF-';
    for (let i = 0; i < 6; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    const user = await User.findByIdAndUpdate(
      req.params.userId,
      {
        academyPassword: password,
        academyPasswordIssuedAt: new Date(),
        // ✅ FIX: Password generate = admin allow kar raha hai, isliye access ON
        academyAccess: true,
      },
      { new: true }
    ).select('-password');

    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    res.json({ success: true, academyPassword: password, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── User: Verify academy password ────────────────────────────────────────────
router.post('/verify-password', protect, async (req, res) => {
  const { password } = req.body;
  const user = await User.findById(req.user.id)
    .select('academyPassword academyAccess academyAccessExpiresAt');

  if (!user) return res.status(404).json({ success: false, message: 'User not found' });

  // ✅ FIX LAYER 1: academyPassword null hai — matlab admin ne explicitly block kiya hai
  // Iska matlab purana ya naya koi bhi password kaam nahi karega
  if (!user.academyPassword) {
    return res.status(403).json({
      success: false,
      message: 'Academy access blocked hai. Admin se contact karo.',
    });
  }

  // ✅ FIX LAYER 2: Password match karo
  if (user.academyPassword !== password) {
    return res.status(401).json({ success: false, message: 'Wrong password' });
  }

  // ✅ FIX LAYER 3: Password sahi hai lekin admin ne access toggle OFF kar rakha hai
  // Ye case tab hoga jab admin ne password generate kiya lekin toggle band kiya
  if (user.academyAccess === false) {
    return res.status(403).json({
      success: false,
      message: 'Access abhi admin ne enable nahi kiya. Admin se contact karo.',
    });
  }

  // Sab theek — 30 din ki window grant karo
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  await User.findByIdAndUpdate(req.user.id, {
    academyAccess: true,
    academyAccessExpiresAt: expiresAt,
  });

  res.json({ success: true, message: 'Access granted!', expiresAt });
});

// ── User: Check my academy access status ─────────────────────────────────────
router.get('/my-access', protect, async (req, res) => {
  try {
    const { allowed, reason } = await checkAcademyAccess(req.user.id);
    const user = await User.findById(req.user.id).select('academyAccessExpiresAt');

    res.json({
      success: true,
      hasAccess: allowed,
      reason: allowed ? null : reason,
      expiresAt: user?.academyAccessExpiresAt || null,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;