const { db } = require('../config/firebase');
const { sendNewHireNotification, sendSOWAndPaymentLink } = require('../utils/emailService');
const { generateSOWPdf, generateInvoicePdf } = require('../utils/pdfGenerator');

// Helper function to populate hire request for PDF and Email
const populateHireRequest = async (hireDocId, hireData) => {
    let populated = { _id: hireDocId, ...hireData };
    
    // Populate Service
    const serviceDoc = await db.collection('services').doc(hireData.serviceId).get();
    if (serviceDoc.exists) populated.serviceId = { _id: serviceDoc.id, ...serviceDoc.data() };
    
    // Populate Client
    const clientDoc = await db.collection('users').doc(hireData.clientId).get();
    if (clientDoc.exists) populated.clientId = { _id: clientDoc.id, ...clientDoc.data() };
    
    // Populate Business
    const businessDoc = await db.collection('users').doc(hireData.businessId).get();
    if (businessDoc.exists) populated.businessId = { _id: businessDoc.id, ...businessDoc.data() };
    
    return populated;
};

// @desc    Create hire request
// @route   POST /api/hire
exports.createHireRequest = async (req, res) => {
    try {
        const { serviceId } = req.body;
        const clientId = req.user.uid;

        const serviceDoc = await db.collection('services').doc(serviceId).get();
        if (!serviceDoc.exists) {
            return res.status(404).json({ message: 'Service not found' });
        }
        
        const serviceData = serviceDoc.data();

        if (serviceData.businessId === clientId) {
            return res.status(400).json({ message: 'You cannot hire your own service' });
        }

        // Check active hire requests
        const existingSnap = await db.collection('hireRequests')
            .where('clientId', '==', clientId)
            .where('serviceId', '==', serviceId)
            .where('status', 'in', ['pending', 'accepted'])
            .get();

        if (!existingSnap.empty) {
            return res.status(400).json({ message: 'You already have an active hire request for this service' });
        }

        const hireData = {
            clientId,
            businessId: serviceData.businessId,
            serviceId,
            status: 'pending',
            paymentStatus: 'pending',
            createdAt: new Date().toISOString()
        };

        const newRef = db.collection('hireRequests').doc();
        await newRef.set(hireData);

        const populated = await populateHireRequest(newRef.id, hireData);

        // PHASE 2: Send email (This will be updated to write to Firebase 'mail' collection)
        await sendNewHireNotification(populated.businessId, populated.clientId, populated.serviceId.title);

        res.status(201).json(populated);
    } catch (error) {
        console.error('Create Hire Error:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update hire request status
// @route   PUT /api/hire/:id
exports.updateHireStatus = async (req, res) => {
    try {
        const { status, customSowText } = req.body;

        if (!['accepted', 'rejected', 'completed'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const hireRef = db.collection('hireRequests').doc(req.params.id);
        const hireDoc = await hireRef.get();

        if (!hireDoc.exists) {
            return res.status(404).json({ message: 'Hire request not found' });
        }
        
        const hireData = hireDoc.data();

        if (hireData.businessId !== req.user.uid) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const updateData = { status };
        if (customSowText) updateData.customSowText = customSowText;
        await hireRef.update(updateData);
        hireData.status = status;
        if (customSowText) hireData.customSowText = customSowText;

        const populated = await populateHireRequest(hireRef.id, hireData);

        // PHASE 2: SOW & Payment (Will use Firebase email trigger instead of SendGrid manually)
        if (status === 'accepted') {
            try {
                const sowBuffer = await generateSOWPdf(populated);
                await sendSOWAndPaymentLink(
                    populated.clientId,
                    populated.businessId,
                    populated.serviceId,
                    populated._id,
                    sowBuffer
                );
            } catch (err) {
                console.error('Failed to generate SOW or send email:', err);
            }
        }

        res.json(populated);
    } catch (error) {
        console.error('Update Status Error:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get my hire requests
// @route   GET /api/hire
exports.getMyHireRequests = async (req, res) => {
    try {
        const userField = req.user.role === 'client' ? 'clientId' : 'businessId';
        
        const snapshot = await db.collection('hireRequests')
            .where(userField, '==', req.user.uid)
            .get();

        let hireRequests = [];
        for (const doc of snapshot.docs) {
            hireRequests.push(await populateHireRequest(doc.id, doc.data()));
        }

        hireRequests.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        res.json(hireRequests);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single hire request
// @route   GET /api/hire/:id
exports.getHireRequest = async (req, res) => {
    try {
        const hireDoc = await db.collection('hireRequests').doc(req.params.id).get();

        if (!hireDoc.exists) {
            return res.status(404).json({ message: 'Hire request not found' });
        }
        
        const hireData = hireDoc.data();
        const userId = req.user.uid;

        if (hireData.clientId !== userId && hireData.businessId !== userId) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const populated = await populateHireRequest(hireDoc.id, hireData);
        res.json(populated);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Download SOW PDF
// @route   GET /api/hire/:id/sow
exports.downloadSOW = async (req, res) => {
    try {
        const hireDoc = await db.collection('hireRequests').doc(req.params.id).get();
        if (!hireDoc.exists) return res.status(404).json({ message: 'Not found' });
        
        const populated = await populateHireRequest(hireDoc.id, hireDoc.data());
        const buffer = await generateSOWPdf(populated);
        
        res.set({
            'Content-Type': 'application/pdf',
            'Content-Length': buffer.length,
            'Content-Disposition': `inline; filename="SOW_${populated._id}.pdf"`,
        });
        res.send(buffer);
    } catch (error) {
        res.status(500).json({ message: 'PDF Generation failed' });
    }
};

// @desc    Download Invoice PDF
// @route   GET /api/hire/:id/invoice
exports.downloadInvoice = async (req, res) => {
    try {
        const hireDoc = await db.collection('hireRequests').doc(req.params.id).get();
        if (!hireDoc.exists || hireDoc.data().paymentStatus !== 'paid') {
            return res.status(404).json({ message: 'Valid paid invoice not found' });
        }
        
        const populated = await populateHireRequest(hireDoc.id, hireDoc.data());
        const buffer = await generateInvoicePdf(populated);
        
        res.set({
            'Content-Type': 'application/pdf',
            'Content-Length': buffer.length,
            'Content-Disposition': `inline; filename="Invoice_${populated._id}.pdf"`,
        });
        res.send(buffer);
    } catch (error) {
        res.status(500).json({ message: 'PDF Generation failed' });
    }
};
