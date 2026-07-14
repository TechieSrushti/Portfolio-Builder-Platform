import Invoice from '../models/Invoice.js';
import PDFDocument from 'pdfkit';

// Helper to calculate invoice numbers
const calculateTotals = (items, taxRate = 0, discount = 0) => {
  const subtotal = items.reduce((acc, item) => acc + item.quantity * item.rate, 0);
  const discountAmount = subtotal * (discount / 100);
  const taxAmount = (subtotal - discountAmount) * (taxRate / 100);
  const totalAmount = subtotal - discountAmount + taxAmount;

  return {
    subtotal,
    discountAmount,
    taxAmount,
    totalAmount,
  };
};

// @desc    Create a new invoice
// @route   POST /api/invoices
// @access  Private
export const createInvoice = async (req, res, next) => {
  const { clientName, clientEmail, clientAddress, dueDate, items, taxRate, discount, status, notes } = req.body;

  try {
    const totalInvoices = await Invoice.countDocuments({ user: req.user._id });
    const invoiceNumber = `INV-${new Date().getFullYear()}-${String(totalInvoices + 1).padStart(4, '0')}`;

    const itemsList = items || [];
    const totals = calculateTotals(itemsList, taxRate || 0, discount || 0);

    const invoice = await Invoice.create({
      user: req.user._id,
      invoiceNumber,
      clientName,
      clientEmail,
      clientAddress,
      dueDate,
      items: itemsList,
      taxRate: taxRate || 0,
      discount: discount || 0,
      status: status || 'draft',
      notes,
      ...totals,
    });

    res.status(201).json({ success: true, invoice });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all user invoices
// @route   GET /api/invoices
// @access  Private
export const getInvoices = async (req, res, next) => {
  try {
    const invoices = await Invoice.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, count: invoices.length, invoices });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single invoice by ID
// @route   GET /api/invoices/:id
// @access  Private
export const getInvoiceById = async (req, res, next) => {
  try {
    const invoice = await Invoice.findById(req.params.id);

    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }

    if (invoice.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    res.json({ success: true, invoice });
  } catch (error) {
    next(error);
  }
};

// @desc    Update invoice details
// @route   PUT /api/invoices/:id
// @access  Private
export const updateInvoice = async (req, res, next) => {
  const { clientName, clientEmail, clientAddress, dueDate, items, taxRate, discount, status, notes } = req.body;

  try {
    let invoice = await Invoice.findById(req.params.id);

    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }

    if (invoice.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    const itemsList = items || invoice.items;
    const currentTaxRate = taxRate !== undefined ? taxRate : invoice.taxRate;
    const currentDiscount = discount !== undefined ? discount : invoice.discount;

    const totals = calculateTotals(itemsList, currentTaxRate, currentDiscount);

    invoice.clientName = clientName || invoice.clientName;
    invoice.clientEmail = clientEmail || invoice.clientEmail;
    invoice.clientAddress = clientAddress || invoice.clientAddress;
    invoice.dueDate = dueDate || invoice.dueDate;
    invoice.items = itemsList;
    invoice.taxRate = currentTaxRate;
    invoice.discount = currentDiscount;
    invoice.status = status || invoice.status;
    invoice.notes = notes || invoice.notes;

    // Apply calculated totals
    invoice.subtotal = totals.subtotal;
    invoice.taxAmount = totals.taxAmount;
    invoice.discountAmount = totals.discountAmount;
    invoice.totalAmount = totals.totalAmount;

    await invoice.save();
    res.json({ success: true, message: 'Invoice updated successfully', invoice });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete invoice
// @route   DELETE /api/invoices/:id
// @access  Private
export const deleteInvoice = async (req, res, next) => {
  try {
    const invoice = await Invoice.findById(req.params.id);

    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }

    if (invoice.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    await invoice.deleteOne();
    res.json({ success: true, message: 'Invoice deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Download Invoice PDF
// @route   GET /api/invoices/:id/pdf
// @access  Private
export const downloadInvoicePdf = async (req, res, next) => {
  try {
    const invoice = await Invoice.findById(req.params.id).populate('user', 'name email');

    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }

    if (invoice.user._id.toString() !== req.user._id.toString()) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=Invoice-${invoice.invoiceNumber}.pdf`);

    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    doc.pipe(res);

    // Modern styled header layout
    doc.fillColor('#2563eb').fontSize(24).text('INVOICE', { align: 'right' });
    doc.moveDown(0.2);

    doc.fillColor('#1f2937').fontSize(10);
    doc.text(`Invoice No: ${invoice.invoiceNumber}`, { align: 'right' });
    doc.text(`Date: ${new Date(invoice.invoiceDate).toLocaleDateString()}`, { align: 'right' });
    if (invoice.dueDate) {
      doc.text(`Due Date: ${new Date(invoice.dueDate).toLocaleDateString()}`, { align: 'right' });
    }

    // Issuer Details
    doc.moveUp(3);
    doc.fillColor('#111827').fontSize(12).text(invoice.user.name, { align: 'left' });
    doc.fillColor('#4b5563').fontSize(10).text(invoice.user.email, { align: 'left' });
    doc.moveDown(1.5);

    // Divider Line
    doc.strokeColor('#e5e7eb').lineWidth(1).moveTo(50, doc.y).lineTo(545, doc.y).stroke();
    doc.moveDown(1);

    // Client Details
    doc.fillColor('#1e3a8a').fontSize(11).text('BILL TO:');
    doc.fillColor('#1f2937').fontSize(12).text(invoice.clientName);
    doc.fillColor('#4b5563').fontSize(10).text(invoice.clientEmail);
    if (invoice.clientAddress) {
      doc.text(invoice.clientAddress);
    }
    doc.moveDown(1.5);

    // Table Header
    const yStartTable = doc.y;
    doc.fillColor('#1e3a8a').fontSize(10);
    doc.text('Description', 50, yStartTable, { width: 250 });
    doc.text('Quantity', 300, yStartTable, { width: 60, align: 'right' });
    doc.text('Rate', 370, yStartTable, { width: 80, align: 'right' });
    doc.text('Amount', 460, yStartTable, { width: 85, align: 'right' });

    doc.moveDown(0.5);
    doc.strokeColor('#d1d5db').lineWidth(0.5).moveTo(50, doc.y).lineTo(545, doc.y).stroke();
    doc.moveDown(0.5);

    // Items list
    doc.fillColor('#374151').fontSize(10);
    invoice.items.forEach((item) => {
      const currentY = doc.y;
      doc.text(item.description, 50, currentY, { width: 250 });
      doc.text(String(item.quantity), 300, currentY, { width: 60, align: 'right' });
      doc.text(`$${item.rate.toFixed(2)}`, 370, currentY, { width: 80, align: 'right' });
      doc.text(`$${(item.quantity * item.rate).toFixed(2)}`, 460, currentY, { width: 85, align: 'right' });
      doc.moveDown(1);
    });

    doc.strokeColor('#d1d5db').lineWidth(0.5).moveTo(50, doc.y).lineTo(545, doc.y).stroke();
    doc.moveDown(1);

    // Totals grid
    const totalY = doc.y;
    doc.fillColor('#4b5563').fontSize(10);
    doc.text('Subtotal:', 350, totalY, { width: 100, align: 'right' });
    doc.fillColor('#1f2937').text(`$${invoice.subtotal.toFixed(2)}`, 460, totalY, { width: 85, align: 'right' });

    if (invoice.discountAmount > 0) {
      doc.moveDown(0.5);
      const discountY = doc.y;
      doc.fillColor('#4b5563').text(`Discount (${invoice.discount}%):`, 350, discountY, { width: 100, align: 'right' });
      doc.fillColor('#10b981').text(`-$${invoice.discountAmount.toFixed(2)}`, 460, discountY, { width: 85, align: 'right' });
    }

    if (invoice.taxAmount > 0) {
      doc.moveDown(0.5);
      const taxY = doc.y;
      doc.fillColor('#4b5563').text(`Tax (${invoice.taxRate}%):`, 350, taxY, { width: 100, align: 'right' });
      doc.fillColor('#1f2937').text(`+$${invoice.taxAmount.toFixed(2)}`, 460, taxY, { width: 85, align: 'right' });
    }

    doc.moveDown(0.8);
    const grandTotalY = doc.y;
    doc.strokeColor('#e5e7eb').lineWidth(1).moveTo(350, grandTotalY - 4).lineTo(545, grandTotalY - 4).stroke();
    doc.fillColor('#1e3a8a').fontSize(12).text('Total Due:', 350, grandTotalY, { width: 100, align: 'right' });
    doc.text(`$${invoice.totalAmount.toFixed(2)}`, 460, grandTotalY, { width: 85, align: 'right' });

    // Notes
    if (invoice.notes) {
      doc.moveDown(3);
      doc.fillColor('#1e3a8a').fontSize(10).text('NOTES & TERMS:');
      doc.fillColor('#6b7280').fontSize(9).text(invoice.notes);
    }

    doc.end();
  } catch (error) {
    next(error);
  }
};
