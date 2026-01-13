require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(
    session({
        secret: process.env.SESSION_SECRET || 'secret-key',
        resave: false,
        saveUninitialized: false,
        cookie: { secure: false }, // set true jika pakai HTTPS
    })
);

// Static files
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware untuk simulasi user login (sementara)
app.use((req, res, next) => {
    if (!req.session.user) {
        // Default user untuk testing
        req.session.user = {
            id: 1,
            name: 'Diki Putra',
            role: 'staff', // role yang tersedia: 'staff', 'kasi', 'kasubdit', 'direktur'
            department: 'Kerjasama',
        };
    }
    res.locals.user = req.session.user;
    next();
});

// Middleware untuk notifikasi
app.use((req, res, next) => {
    const user = req.session.user;
    const notifications = [];

    // Generate notifikasi berdasarkan role dan status dokumen
    documents.forEach((doc) => {
        if (user.role === 'staff') {
            // Notif untuk staff: dokumen disetujui atau perlu revisi
            if (doc.currentStatus === 'approved' && doc.createdBy === user.name) {
                notifications.push({
                    id: `approved-${doc.id}`,
                    type: 'approved',
                    title: 'Dokumen Disetujui',
                    message: `"${doc.title}" telah disetujui semua pihak`,
                    time: 'Baru saja',
                    documentId: doc.id,
                    read: false,
                });
            }
            if (doc.currentStatus === 'rejected' && doc.createdBy === user.name) {
                let revisor = '';
                if (doc.workflow.direktur.status === 'rejected') revisor = reviewers[2].name;
                else if (doc.workflow.kasubdit.status === 'rejected') revisor = reviewers[1].name;
                else if (doc.workflow.kasi.status === 'rejected') revisor = reviewers[0].name;

                notifications.push({
                    id: `revision-${doc.id}`,
                    type: 'revision',
                    title: 'Perlu Revisi',
                    message: `"${doc.title}" memerlukan revisi dari ${revisor}`,
                    time: 'Baru saja',
                    documentId: doc.id,
                    read: false,
                });
            }
        } else {
            // Notif untuk reviewer: dokumen yang perlu direview
            const currentReviewerId = user.role === 'staff' ? null : user.role === 'kasi' ? 'kasi' : user.role === 'kasubdit' ? 'kasubdit' : 'direktur';

            if (currentReviewerId && doc.workflow[currentReviewerId]?.status === 'reviewing') {
                notifications.push({
                    id: `review-${doc.id}`,
                    type: 'reviewing',
                    title: 'Dokumen Perlu Direview',
                    message: `"${doc.title}" menunggu review Anda`,
                    time: doc.createdAt,
                    documentId: doc.id,
                    read: doc.workflow[currentReviewerId].viewed || false,
                });
            }
        }
    });

    res.locals.notifications = notifications;
    next();
});

// Daftar pejabat/reviewer - Alur Tetap: Kasi → Kasubdit → Direktur
const reviewers = [
    { id: 'kasi', name: 'Frengki, ST., MM', position: 'Kepala Seksi Penjajakan, Penelaahan & Monev Kerja Sama', level: 1 },
    { id: 'kasubdit', name: 'Arpentius, ST., MM', position: 'Kepala Subdit Kerja Sama', level: 2 },
    { id: 'direktur', name: 'Dr. Eng Muhammad Makky, STP., M.Si', position: 'Direktur Kerja Sama dan Hilirisasi Riset', level: 3 },
];

// Data dokumen MoU - Workflow Tetap: Staff → Kasi → Kasubdit → Direktur
const documents = [
    // Status: Sedang direview di Kasi
    {
        id: 1,
        title: 'MoU Kerjasama Riset dengan Universitas Indonesia',
        description: 'Kerjasama penelitian bidang teknologi informasi dan artificial intelligence dengan Fakultas Ilmu Komputer UI',
        documentLink: 'https://docs.google.com/document/d/1NTqsV_qr9A8chX9W3eHf1eHRgG-IoVDXoouQpAA4rOU/edit?usp=sharing',
        createdBy: 'Diki Putra, S.T',
        createdAt: '2026-01-12',
        currentStatus: 'in_review',
        workflow: {
            kasi: { status: 'reviewing', date: null, viewed: false, notes: null },
            kasubdit: { status: 'pending', date: null, viewed: false, notes: null },
            direktur: { status: 'pending', date: null, viewed: false, notes: null },
        },
    },

    // Status: Sedang direview di Kasubdit
    {
        id: 2,
        title: 'MoU Program Pelatihan dan Sertifikasi Profesional',
        description: 'Kerjasama dengan lembaga pelatihan untuk program sertifikasi profesional bagi mahasiswa',
        documentLink: 'https://docs.google.com/document/d/1NTqsV_qr9A8chX9W3eHf1eHRgG-IoVDXoouQpAA4rOU/edit?usp=sharing',
        createdBy: 'Jusriani, SH',
        createdAt: '2026-01-10',
        currentStatus: 'in_review',
        workflow: {
            kasi: { status: 'approved', date: '2026-01-11', viewed: true, notes: null },
            kasubdit: { status: 'reviewing', date: null, viewed: true, notes: null },
            direktur: { status: 'pending', date: null, viewed: false, notes: null },
        },
    },

    // Status: Sedang direview di Direktur
    {
        id: 3,
        title: 'MoU Kerjasama Penelitian dengan Institut Teknologi Nasional',
        description: 'Kerjasama penelitian bersama dalam bidang teknologi terapan dan inovasi industri',
        documentLink: 'https://docs.google.com/document/d/1NTqsV_qr9A8chX9W3eHf1eHRgG-IoVDXoouQpAA4rOU/edit?usp=sharing',
        createdBy: 'Ardillah Anggraini Sirtin, S.TP',
        createdAt: '2026-01-08',
        currentStatus: 'in_review',
        workflow: {
            kasi: { status: 'approved', date: '2026-01-09', viewed: true, notes: null },
            kasubdit: { status: 'approved', date: '2026-01-11', viewed: true, notes: null },
            direktur: { status: 'reviewing', date: null, viewed: true, notes: null },
        },
    },

    // Status: Sudah approved semua
    {
        id: 4,
        title: 'MoU International Collaboration - National University of Singapore',
        description: 'Student exchange program dan joint research dalam sustainable development',
        documentLink: 'https://docs.google.com/document/d/1NTqsV_qr9A8chX9W3eHf1eHRgG-IoVDXoouQpAA4rOU/edit?usp=sharing',
        createdBy: 'Irham Gunadi, S.T',
        createdAt: '2026-01-05',
        currentStatus: 'approved',
        workflow: {
            kasi: { status: 'approved', date: '2026-01-06', viewed: true, notes: null },
            kasubdit: { status: 'approved', date: '2026-01-08', viewed: true, notes: null },
            direktur: { status: 'approved', date: '2026-01-10', viewed: true, notes: null },
        },
    },

    // Status: Sedang di Kasi (belum dilihat)
    {
        id: 5,
        title: 'MoU Pengembangan Sistem Informasi Akademik Terpadu',
        description: 'Kerjasama pengembangan platform sistem informasi terintegrasi dengan vendor teknologi',
        documentLink: 'https://docs.google.com/document/d/1NTqsV_qr9A8chX9W3eHf1eHRgG-IoVDXoouQpAA4rOU/edit?usp=sharing',
        createdBy: 'Reka Permata Zalen, S.TP',
        createdAt: '2026-01-12',
        currentStatus: 'in_review',
        workflow: {
            kasi: { status: 'reviewing', date: null, viewed: false, notes: null },
            kasubdit: { status: 'pending', date: null, viewed: false, notes: null },
            direktur: { status: 'pending', date: null, viewed: false, notes: null },
        },
    },

    // Status: Sudah approved
    {
        id: 6,
        title: 'MoU Kerjasama Magang Industri - PT Telkom Indonesia',
        description: 'Kerjasama program magang mahasiswa dan rekrutmen bersama dengan PT Telkom Indonesia',
        documentLink: 'https://docs.google.com/document/d/1NTqsV_qr9A8chX9W3eHf1eHRgG-IoVDXoouQpAA4rOU/edit?usp=sharing',
        createdBy: 'M Zuhri, SE',
        createdAt: '2025-12-28',
        currentStatus: 'approved',
        workflow: {
            kasi: { status: 'approved', date: '2025-12-30', viewed: true, notes: null },
            kasubdit: { status: 'approved', date: '2026-01-03', viewed: true, notes: null },
            direktur: { status: 'approved', date: '2026-01-06', viewed: true, notes: null },
        },
    },
];

// Routes
app.get('/', (req, res) => {
    const inReviewDocs = documents.filter((d) => d.currentStatus === 'in_review').length;
    const approvedDocs = documents.filter((d) => d.currentStatus === 'approved').length;

    // Calculate workload for each reviewer (fixed workflow)
    const reviewerWorkload = {
        kasi: { ...reviewers[0], count: 0 },
        kasubdit: { ...reviewers[1], count: 0 },
        direktur: { ...reviewers[2], count: 0 },
    };

    // Count documents currently waiting at each level
    documents.forEach((doc) => {
        if (doc.workflow.kasi.status === 'reviewing') reviewerWorkload.kasi.count++;
        if (doc.workflow.kasubdit.status === 'reviewing') reviewerWorkload.kasubdit.count++;
        if (doc.workflow.direktur.status === 'reviewing') reviewerWorkload.direktur.count++;
    });

    const data = {
        title: 'Dashboard',
        documents: documents,
        inReviewDocs: inReviewDocs,
        approvedDocs: approvedDocs,
        reviewers: reviewers,
        reviewerWorkload: reviewerWorkload,
        activePage: 'dashboard',
    };

    res.render('dashboard-stats', data, (err, html) => {
        if (err) return res.status(500).send(err.message);
        res.render('layout', { ...data, body: html });
    });
});

app.get('/documents', (req, res) => {
    const inReviewDocs = documents.filter((d) => d.currentStatus === 'in_review').length;
    const approvedDocs = documents.filter((d) => d.currentStatus === 'approved').length;

    const data = {
        title: 'Daftar Dokumen',
        documents: documents,
        inReviewDocs: inReviewDocs,
        approvedDocs: approvedDocs,
        reviewers: reviewers,
        activePage: 'documents',
    };

    res.render('documents-list', data, (err, html) => {
        if (err) return res.status(500).send(err.message);
        res.render('layout', { ...data, body: html });
    });
});

// Halaman khusus untuk review Kasi
app.get('/review/kasi', (req, res) => {
    // Filter dokumen yang perlu direview oleh Kasi (reviewer level 1)
    const kasiDocs = documents.filter((d) => {
        return d.workflow.kasi.status === 'reviewing' || (d.workflow.kasi.status === 'reviewing' && !d.workflow.kasi.viewed);
    });

    const pendingDocs = kasiDocs.filter((d) => !d.workflow.kasi.viewed);
    const reviewingDocs = kasiDocs.filter((d) => d.workflow.kasi.viewed);

    const data = {
        title: 'Review Kasi',
        documents: kasiDocs,
        pendingDocs: pendingDocs,
        reviewingDocs: reviewingDocs,
        reviewers: reviewers,
        activePage: 'review-kasi',
    };

    res.render('review-kasi', data, (err, html) => {
        if (err) return res.status(500).send(err.message);
        res.render('layout', { ...data, body: html });
    });
});

// Halaman khusus untuk review Kasubdit
app.get('/review/kasubdit', (req, res) => {
    // Filter dokumen yang perlu direview oleh Kasubdit (reviewer level 2)
    const kasubditDocs = documents.filter((d) => {
        return d.workflow.kasubdit.status === 'reviewing' || (d.workflow.kasubdit.status === 'reviewing' && !d.workflow.kasubdit.viewed);
    });

    const pendingDocs = kasubditDocs.filter((d) => !d.workflow.kasubdit.viewed);
    const reviewingDocs = kasubditDocs.filter((d) => d.workflow.kasubdit.viewed);

    const data = {
        title: 'Review Kasubdit',
        documents: kasubditDocs,
        pendingDocs: pendingDocs,
        reviewingDocs: reviewingDocs,
        reviewers: reviewers,
        activePage: 'review-kasubdit',
    };

    res.render('review-kasubdit', data, (err, html) => {
        if (err) return res.status(500).send(err.message);
        res.render('layout', { ...data, body: html });
    });
});

// Halaman khusus untuk review Direktur
app.get('/review/direktur', (req, res) => {
    // Filter dokumen yang perlu direview oleh Direktur (reviewer level 3)
    const direkturDocs = documents.filter((d) => {
        return d.workflow.direktur.status === 'reviewing' || (d.workflow.direktur.status === 'reviewing' && !d.workflow.direktur.viewed);
    });

    const pendingDocs = direkturDocs.filter((d) => !d.workflow.direktur.viewed);
    const reviewingDocs = direkturDocs.filter((d) => d.workflow.direktur.viewed);

    const data = {
        title: 'Review Direktur',
        documents: direkturDocs,
        pendingDocs: pendingDocs,
        reviewingDocs: reviewingDocs,
        reviewers: reviewers,
        activePage: 'review-direktur',
    };

    res.render('review-direktur', data, (err, html) => {
        if (err) return res.status(500).send(err.message);
        res.render('layout', { ...data, body: html });
    });
});

app.get('/documents/new', (req, res) => {
    const data = {
        title: 'Pengajuan Dokumen Baru',
        activePage: 'new-document',
        reviewers: reviewers, // Pass reviewers list to form
    };

    res.render('document-form', data, (err, html) => {
        if (err) return res.status(500).send(err.message);
        res.render('layout', { ...data, body: html });
    });
});

app.get('/documents/:id/review', (req, res) => {
    const doc = documents.find((d) => d.id == req.params.id);
    if (!doc) {
        return res.status(404).send('Dokumen tidak ditemukan');
    }

    const data = {
        title: 'Review Dokumen',
        document: doc,
        reviewers: reviewers, // Pass reviewers list
        activePage: 'dashboard',
    };

    res.render('document-review', data, (err, html) => {
        if (err) return res.status(500).send(err.message);
        res.render('layout', { ...data, body: html });
    });
});

// API endpoints
app.post('/api/documents', (req, res) => {
    try {
        const { title, description, documentLink } = req.body;

        if (!title || !description || !documentLink) {
            return res.status(400).json({ success: false, message: 'Data tidak lengkap' });
        }

        // Create new document with fixed workflow
        const newDoc = {
            id: documents.length + 1,
            title: title,
            description: description,
            documentLink: documentLink,
            createdBy: 'Diki Putra, S.T',
            createdAt: new Date().toISOString().split('T')[0],
            currentStatus: 'in_review',
            workflow: {
                kasi: { status: 'reviewing', date: null, viewed: false, notes: null },
                kasubdit: { status: 'pending', date: null, viewed: false, notes: null },
                direktur: { status: 'pending', date: null, viewed: false, notes: null },
            },
        };

        documents.push(newDoc);

        res.json({ success: true, message: 'Dokumen berhasil diajukan', documentId: newDoc.id });
    } catch (error) {
        console.error('Error creating document:', error);
        res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
    }
});

app.post('/api/documents/:id/approve', (req, res) => {
    res.json({ success: true, message: 'Dokumen disetujui' });
});

app.post('/api/documents/:id/reject', (req, res) => {
    res.json({ success: true, message: 'Dokumen ditolak' });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
    console.log(`User role saat ini: ${app.locals.user?.role || 'staff'}`);
});
