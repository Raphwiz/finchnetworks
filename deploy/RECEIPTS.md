# Admin receipts

Open Admin > Receipts > New receipt. Start with a quotation/order or enter standalone customer and item details. Record the current payment and any earlier payments separately. VAT is a manually entered amount, not an assumed rate. Preview before confirming and issuing.

Issued records receive a database-generated FN-RCP number. Their contents and business contact details are frozen. Repeated submissions of the same client ID return the original receipt. Voiding requires a reason and retains the original record, date and staff identity. PDFs of voided receipts are marked VOID. Preview PDFs do not consume receipt numbers.

Receipts are staff-only, including PDFs. Issuing a receipt does not update an order or quotation payment status or send an email. Use the existing payment/status workflow separately. There is no public receipt URL.

The PDF follows the supplied Finch Word receipt layout. Logo and stamp assets extracted from that template live in seed/, which the production Docker image copies. No handwritten signature is reproduced. Existing quotation-payment receipts remain unchanged.

Migration 0014 adds issued_receipts without changing existing customer, order or quotation records. The normal database backup includes receipts. Run `node node_modules/tsx/dist/cli.mjs tests/receipts.test.ts` for isolated database/access/calculation/retry/void tests and PDF sample generation under work/.
