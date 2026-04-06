const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const auth = require('../middleware/auth');
const User = require('../models/User');
const fs = require('fs');

const publicDir = path.join(__dirname, '../../../modules/MMM-Face-Recognition-SMAI/public/');
if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
}

// Configure Multer for face image uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, publicDir);
    },
    filename: function (req, file, cb) {
        cb(null, 'face.png'); // Overwrite image so python script picks it up
    }
});

const upload = multer({ storage: storage });

// POST /api/face/upload
router.post('/upload', auth, upload.single('faceImage'), async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        const idPath = path.join(publicDir, `${user.username}-id.png`);
        
        // Write an empty file so python picks up the username dynamically
        fs.closeSync(fs.openSync(idPath, 'w'));

        res.json({ msg: "Face gracefully forwarded to smart mirror Python process!" });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// GET /api/face/status
router.get('/status', async (req, res) => {
    try {
        const samplePath = path.join(__dirname, '../../../modules/MMM-Face-Recognition-SMAI/sample.txt');
        if (fs.existsSync(samplePath)) {
            const currentUser = fs.readFileSync(samplePath, 'utf8');
            res.json({ user: currentUser });
        } else {
            res.json({ user: "Guest" });
        }
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

module.exports = router;
