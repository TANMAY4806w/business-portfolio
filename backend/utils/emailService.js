const { db } = require('../config/firebase');
const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    try {
        // Create reusable transporter using Gmail
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        // Setup email data
        let mailOptions = {
            from: `"Business Portfolio" <${process.env.EMAIL_USER}>`,
            to: Array.isArray(options.email) ? options.email.join(', ') : options.email,
            subject: options.subject,
            html: options.html,
            attachments: options.attachments || []
        };

        // Send mail
        const info = await transporter.sendMail(mailOptions);
        console.log(`Email sent successfully to: ${options.email} (ID: ${info.messageId})`);
        return true;
    } catch (error) {
        console.error('Email sending error:', error);
        return false;
    }
};

exports.sendNewHireNotification = async (businessUser, clientUser, serviceTitle) => {
    const htmlMsg = `
        <h2>New Hire Request!</h2>
        <p>Hello ${businessUser.name},</p>
        <p>You have received a new hire request from <strong>${clientUser.name}</strong> for your service: <strong>${serviceTitle}</strong>.</p>
        <p>Please log in to your dashboard to review and accept/reject this request.</p>
    `;
    await sendEmail({
        email: businessUser.email,
        subject: `New Hire Request from ${clientUser.name} for ${serviceTitle}`,
        html: htmlMsg,
    });
};

exports.sendSOWAndPaymentLink = async (clientUser, businessUser, service, hireRequestId, sowPdfBuffer) => {
    const paymentUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/hire-requests`;
    
    // Note: PDF buffer might need to be converted to base64 depending on your Email provider (SendGrid/SparkPost)
    // when using the Firebase Extension.
    const attachments = sowPdfBuffer ? [{
        filename: `SOW_${hireRequestId}.pdf`,
        content: sowPdfBuffer.toString('base64'),
        contentType: 'application/pdf',
        encoding: 'base64'
    }] : [];

    const htmlMsg = `
        <h2>Hire Request Accepted</h2>
        <p>Hello ${clientUser.name},</p>
        <p><strong>${businessUser.name}</strong> has accepted your request for the service: <strong>${service.title}</strong>.</p>
        <p>Attached is the Statement of Work (SOW) detailing the scope.</p>
        <p>To proceed, please log in to your dashboard and complete the secure upfront payment via Stripe.</p>
        <a href="${paymentUrl}" style="padding: 10px 20px; background-color: #8b5cf6; color: white; text-decoration: none; border-radius: 5px;">Pay Now</a>
    `;

    await sendEmail({
        email: clientUser.email,
        subject: `Request Accepted Update: Pay Now for ${service.title}`,
        html: htmlMsg,
        attachments
    });
};

exports.sendPaymentReceipt = async (clientUser, businessUser, service, invoicePdfBuffer, hireRequestId) => {
    // Notify Business
    await sendEmail({
        email: businessUser.email,
        subject: `Payment Received! Project Started: ${service.title}`,
        html: `<h2>Payment Secure!</h2><p>The client has paid. You can now begin working on the service: ${service.title}.</p>`,
    });

    const attachments = invoicePdfBuffer ? [{
        filename: `Invoice_${hireRequestId}.pdf`,
        content: invoicePdfBuffer.toString('base64'),
        contentType: 'application/pdf',
        encoding: 'base64'
    }] : [];

    // Notify Client with Invoice
    await sendEmail({
        email: clientUser.email,
        subject: `Payment Receipt & Invoice for ${service.title}`,
        html: `<h2>Payment Successful</h2><p>Thanks for your payment. Attached is your official invoice. The business will now begin the work.</p>`,
        attachments
    });
};
