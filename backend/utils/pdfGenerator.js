const PDFDocument = require('pdfkit');

const PRIMARY_COLOR = '#1E3A8A'; // Navy Blue
const SECONDARY_COLOR = '#D97706'; // Gold/Amber
const TEXT_COLOR = '#333333';
const LIGHT_GRAY = '#F3F4F6';

exports.generateSOWPdf = (hireRequest) => {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({ margin: 50, size: 'A4' });
            const buffers = [];

            doc.on('data', buffers.push.bind(buffers));
            doc.on('end', () => resolve(Buffer.concat(buffers)));

            // Header Banner
            doc.rect(0, 0, doc.page.width, 100).fill(PRIMARY_COLOR);
            doc.fontSize(28).font('Helvetica-Bold').fillColor('#FFFFFF').text('STATEMENT OF WORK', 50, 40);
            
            // Document Meta
            doc.fontSize(10).font('Helvetica').fillColor(TEXT_COLOR)
               .text(`SOW Reference: ${hireRequest._id.toString().toUpperCase()}`, 50, 130)
               .text(`Date Issued: ${new Date().toLocaleDateString()}`);
            
            doc.moveDown(2);

            // Function for Section Headers
            const renderSectionHeader = (title, y) => {
                doc.rect(50, y, doc.page.width - 100, 25).fill(LIGHT_GRAY);
                doc.fontSize(12).font('Helvetica-Bold').fillColor(PRIMARY_COLOR).text(title, 60, y + 7);
                return y + 35;
            };

            // Parties Involved
            let currentY = renderSectionHeader('PARTIES INVOLVED', doc.y);
            
            doc.fontSize(11).font('Helvetica-Bold').fillColor(TEXT_COLOR).text('Client:', 50, currentY);
            doc.font('Helvetica').text(`${hireRequest.clientId?.name || 'Client'} (${hireRequest.clientId?.email || 'N/A'})`, 120, currentY);
            
            currentY += 20;
            doc.font('Helvetica-Bold').text('Business:', 50, currentY);
            doc.font('Helvetica').text(`${hireRequest.businessId?.name || 'Business'} (${hireRequest.businessId?.email || 'N/A'})`, 120, currentY);

            doc.moveDown(2);

            // Scope of Work
            currentY = renderSectionHeader('SCOPE OF WORK', doc.y);
            doc.font('Helvetica-Bold').text('Service Title:', 50, currentY);
            doc.font('Helvetica').text(`${hireRequest.serviceId?.title || 'Service Title'}`, 50, currentY + 15);
            
            currentY += 40;
            doc.font('Helvetica-Bold').text('Description:', 50, currentY);
            doc.font('Helvetica').text(`${hireRequest.serviceId?.description || 'N/A'}`, 50, currentY + 15, { width: doc.page.width - 100 });

            if (hireRequest.customSowText) {
                doc.moveDown();
                doc.font('Helvetica-Bold').text('Custom Terms & Milestones:');
                doc.font('Helvetica').text(hireRequest.customSowText, { width: doc.page.width - 100 });
            }

            doc.moveDown();
            doc.font('Helvetica-Bold').text('Timeline / Delivery:', 50, doc.y);
            doc.font('Helvetica').text(`${hireRequest.serviceId?.deliveryTime || 'TBD'}`, 50, doc.y + 15);

            doc.moveDown(2);

            // Financials
            currentY = renderSectionHeader('FINANCIAL TERMS', doc.y);
            doc.font('Helvetica-Bold').text('Total Investment:', 50, currentY);
            doc.font('Helvetica-Bold').fillColor(SECONDARY_COLOR).text(`$${Number(hireRequest.serviceId?.price || 0).toFixed(2)}`, 160, currentY);
            
            currentY += 20;
            doc.font('Helvetica').fillColor(TEXT_COLOR).text('Payment Schedule: 100% Upfront via Secure Platform Escrow', 50, currentY);

            // Signatures
            doc.moveDown(4);
            currentY = doc.y;
            doc.lineWidth(1).strokeColor('#CCCCCC');
            
            doc.moveTo(50, currentY).lineTo(250, currentY).stroke();
            doc.moveTo(350, currentY).lineTo(550, currentY).stroke();
            
            doc.fontSize(10).font('Helvetica-Oblique').fillColor('#666666')
               .text('Client Digital Signature', 50, currentY + 10)
               .text('Business Digital Signature', 350, currentY + 10);

            // Footer
            doc.fontSize(8).text('Generated automatically by the Business Portfolio System', 50, doc.page.height - 50, { align: 'center', color: '#999999' });

            doc.end();
        } catch (err) {
            reject(err);
        }
    });
};

exports.generateInvoicePdf = (hireRequest) => {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({ margin: 50, size: 'A4' });
            const buffers = [];

            doc.on('data', buffers.push.bind(buffers));
            doc.on('end', () => resolve(Buffer.concat(buffers)));

            // Header Banner
            doc.rect(0, 0, doc.page.width, 100).fill(PRIMARY_COLOR);
            doc.fontSize(28).font('Helvetica-Bold').fillColor('#FFFFFF').text('OFFICIAL INVOICE', 50, 40);
            
            const invoiceNumber = `INV-${hireRequest._id.toString().substring(0, 8).toUpperCase()}`;

            // Invoice Meta
            doc.fontSize(10).font('Helvetica-Bold').fillColor(TEXT_COLOR)
               .text(`Invoice Number:`, 350, 120).font('Helvetica').text(invoiceNumber, 450, 120)
               .font('Helvetica-Bold').text(`Date Issued:`, 350, 135).font('Helvetica').text(new Date().toLocaleDateString(), 450, 135)
               .font('Helvetica-Bold').text(`Payment Status:`, 350, 150).font('Helvetica-Bold').fillColor('#10B981').text(`PAID IN FULL`, 450, 150);

            // Bill To / From
            doc.fillColor(TEXT_COLOR);
            doc.fontSize(12).font('Helvetica-Bold').text('BILLED TO:', 50, 120);
            doc.fontSize(10).font('Helvetica').text(`${hireRequest.clientId?.name || 'Client'}`);
            doc.text(`${hireRequest.clientId?.email || 'N/A'}`);

            doc.moveDown();
            doc.fontSize(12).font('Helvetica-Bold').text('ISSUED BY:', 50, doc.y);
            doc.fontSize(10).font('Helvetica').text(`${hireRequest.businessId?.name || 'Business'}`);
            doc.text(`${hireRequest.businessId?.email || 'N/A'}`);

            doc.moveDown(3);

            // Table Header
            const tableTop = doc.y;
            doc.rect(50, tableTop, doc.page.width - 100, 30).fill(PRIMARY_COLOR);
            doc.fontSize(10).font('Helvetica-Bold').fillColor('#FFFFFF');
            doc.text('DESCRIPTION', 60, tableTop + 10);
            doc.text('QTY', 380, tableTop + 10);
            doc.text('AMOUNT', 480, tableTop + 10);

            // Table Row
            const rowTop = tableTop + 30;
            doc.rect(50, rowTop, doc.page.width - 100, 40).fill(LIGHT_GRAY);
            doc.fillColor(TEXT_COLOR).font('Helvetica');
            doc.text(`${hireRequest.serviceId?.title || 'Service Provided'}`, 60, rowTop + 15);
            doc.text('1', 380, rowTop + 15);
            doc.text(`$${Number(hireRequest.serviceId?.price || 0).toFixed(2)}`, 480, rowTop + 15);

            // Total Box
            const totalTop = rowTop + 50;
            doc.rect(350, totalTop, 195, 40).fill(SECONDARY_COLOR);
            doc.fontSize(14).font('Helvetica-Bold').fillColor('#FFFFFF');
            doc.text('TOTAL PAID:', 360, totalTop + 12);
            doc.text(`$${Number(hireRequest.serviceId?.price || 0).toFixed(2)}`, 460, totalTop + 12);

            // Thank you note
            doc.moveDown(4);
            doc.fontSize(12).font('Helvetica-Oblique').fillColor(TEXT_COLOR).text('Thank you for your business!', 50, doc.y, { align: 'center' });

            // Footer
            doc.fontSize(8).font('Helvetica').text('Generated automatically by the Business Portfolio System', 50, doc.page.height - 50, { align: 'center', color: '#999999' });

            doc.end();
        } catch (err) {
            reject(err);
        }
    });
};
