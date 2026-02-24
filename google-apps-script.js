/**
 * ============================================================
 * HIGH PLACES INTAKE — GOOGLE APPS SCRIPT
 * ============================================================
 * 
 * SETUP INSTRUCTIONS:
 * 
 * 1. Go to https://script.google.com
 * 2. Click "New project"
 * 3. Delete any existing code and paste this entire file
 * 4. Click the 💾 Save icon (name the project "High Places Intake")
 * 5. Click "Deploy" → "New deployment"
 * 6. Under "Select type", choose "Web app"
 * 7. Set:
 *    - Description: "High Places Intake Form"
 *    - Execute as: "Me"
 *    - Who has access: "Anyone"
 * 8. Click "Deploy"
 * 9. Authorize the app when prompted (click through warnings)
 * 10. Copy the Web App URL
 * 11. Paste that URL into app.js as the GOOGLE_SCRIPT_URL value
 * 
 * That's it! The form will now write to Google Sheets
 * and send email notifications automatically.
 * ============================================================
 */

// ========== CONFIGURATION ==========
const SPREADSHEET_NAME = 'High Places Intake';
const NOTIFICATION_EMAIL = 'gem.sonia.david@gmail.com';
const EMAIL_SUBJECT_PREFIX = '[High Places] New Student Registration';

// ========== COLUMN HEADERS ==========
const HEADERS = [
    'Timestamp',
    'Full Name',
    'Age',
    'Email',
    'Phone',
    'School',
    'Grade',
    'Zone',
    'Career Interests',
    'Goals',
    'Additional Notes',
    'Parent/Guardian Contact',
    'Submitted At'
];

/**
 * Handles GET requests (for testing the endpoint)
 */
function doGet(e) {
    return ContentService
        .createTextOutput(JSON.stringify({ status: 'ok', message: 'High Places Intake endpoint is active.' }))
        .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Handles POST requests from the intake form
 */
function doPost(e) {
    try {
        const data = JSON.parse(e.postData.contents);

        // Get or create the spreadsheet
        const sheet = getOrCreateSheet();

        // Append the row
        const row = [
            new Date().toISOString(),          // Timestamp (server-side)
            data.fullName || '',
            data.age || '',
            data.email || '',
            data.phone || '',
            data.school || '',
            data.grade || '',
            data.zone || '',
            data.interests || '',
            data.goals || '',
            data.notes || '',
            data.parentContact || '',
            data.submittedAt || ''              // Client-side timestamp
        ];

        sheet.appendRow(row);

        // Send email notification
        sendNotificationEmail(data);

        return ContentService
            .createTextOutput(JSON.stringify({ status: 'success', message: 'Data saved successfully.' }))
            .setMimeType(ContentService.MimeType.JSON);

    } catch (error) {
        console.error('Error in doPost:', error);
        return ContentService
            .createTextOutput(JSON.stringify({ status: 'error', message: error.toString() }))
            .setMimeType(ContentService.MimeType.JSON);
    }
}

/**
 * Gets the existing spreadsheet or creates a new one with headers
 */
function getOrCreateSheet() {
    // Search for existing spreadsheet by name
    const files = DriveApp.getFilesByName(SPREADSHEET_NAME);

    let spreadsheet;
    if (files.hasNext()) {
        const file = files.next();
        spreadsheet = SpreadsheetApp.open(file);
    } else {
        // Create new spreadsheet
        spreadsheet = SpreadsheetApp.create(SPREADSHEET_NAME);
        const sheet = spreadsheet.getActiveSheet();
        sheet.setName('Submissions');

        // Add headers
        sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);

        // Style the header row
        const headerRange = sheet.getRange(1, 1, 1, HEADERS.length);
        headerRange.setFontWeight('bold');
        headerRange.setBackground('#F07222');
        headerRange.setFontColor('#FFFFFF');
        headerRange.setHorizontalAlignment('center');

        // Auto-resize columns
        for (let i = 1; i <= HEADERS.length; i++) {
            sheet.autoResizeColumn(i);
        }

        // Freeze header row
        sheet.setFrozenRows(1);

        console.log('Created new spreadsheet: ' + spreadsheet.getUrl());
    }

    return spreadsheet.getActiveSheet();
}

/**
 * Sends an email notification when a new submission is received
 */
function sendNotificationEmail(data) {
    const interests = data.interests || 'Not specified';
    const studentName = data.fullName || 'Unknown';

    const subject = `${EMAIL_SUBJECT_PREFIX}: ${studentName}`;

    const htmlBody = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #F07222, #d45e14); padding: 24px 32px; border-radius: 12px 12px 0 0;">
        <h1 style="color: #fff; margin: 0; font-size: 22px;">🏔️ High Places — New Registration</h1>
      </div>
      <div style="background: #fff; border: 1px solid #e8e0d8; border-top: none; padding: 28px 32px; border-radius: 0 0 12px 12px;">
        <p style="color: #2c2c3a; font-size: 15px; margin-bottom: 20px;">
          A new student has registered for the High Places Youth Ministry program:
        </p>
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          <tr style="border-bottom: 1px solid #f0ebe6;">
            <td style="padding: 10px 12px; font-weight: 600; color: #6b6b80; width: 160px;">Name</td>
            <td style="padding: 10px 12px; color: #2c2c3a;"><strong>${studentName}</strong></td>
          </tr>
          <tr style="border-bottom: 1px solid #f0ebe6; background: #fdf6f0;">
            <td style="padding: 10px 12px; font-weight: 600; color: #6b6b80;">Age</td>
            <td style="padding: 10px 12px; color: #2c2c3a;">${data.age || '—'}</td>
          </tr>
          <tr style="border-bottom: 1px solid #f0ebe6;">
            <td style="padding: 10px 12px; font-weight: 600; color: #6b6b80;">Email</td>
            <td style="padding: 10px 12px; color: #2c2c3a;">${data.email || '—'}</td>
          </tr>
          <tr style="border-bottom: 1px solid #f0ebe6; background: #fdf6f0;">
            <td style="padding: 10px 12px; font-weight: 600; color: #6b6b80;">Phone</td>
            <td style="padding: 10px 12px; color: #2c2c3a;">${data.phone || '—'}</td>
          </tr>
          <tr style="border-bottom: 1px solid #f0ebe6;">
            <td style="padding: 10px 12px; font-weight: 600; color: #6b6b80;">School</td>
            <td style="padding: 10px 12px; color: #2c2c3a;">${data.school || '—'}</td>
          </tr>
          <tr style="border-bottom: 1px solid #f0ebe6; background: #fdf6f0;">
            <td style="padding: 10px 12px; font-weight: 600; color: #6b6b80;">Grade</td>
            <td style="padding: 10px 12px; color: #2c2c3a;">${data.grade || '—'}</td>
          </tr>
          <tr style="border-bottom: 1px solid #f0ebe6;">
            <td style="padding: 10px 12px; font-weight: 600; color: #6b6b80;">Zone</td>
            <td style="padding: 10px 12px; color: #2c2c3a;">${data.zone || '—'}</td>
          </tr>
          <tr style="border-bottom: 1px solid #f0ebe6; background: #fdf6f0;">
            <td style="padding: 10px 12px; font-weight: 600; color: #6b6b80;">Career Interests</td>
            <td style="padding: 10px 12px; color: #F07222; font-weight: 600;">${interests}</td>
          </tr>
          <tr style="border-bottom: 1px solid #f0ebe6;">
            <td style="padding: 10px 12px; font-weight: 600; color: #6b6b80;">Goals</td>
            <td style="padding: 10px 12px; color: #2c2c3a;">${data.goals || '—'}</td>
          </tr>
          <tr style="border-bottom: 1px solid #f0ebe6; background: #fdf6f0;">
            <td style="padding: 10px 12px; font-weight: 600; color: #6b6b80;">Notes</td>
            <td style="padding: 10px 12px; color: #2c2c3a;">${data.notes || '—'}</td>
          </tr>
          <tr>
            <td style="padding: 10px 12px; font-weight: 600; color: #6b6b80;">Parent Contact</td>
            <td style="padding: 10px 12px; color: #2c2c3a;">${data.parentContact || '—'}</td>
          </tr>
        </table>
        <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #e8e0d8; text-align: center; color: #6b6b80; font-size: 12px;">
          BDS — Breaking D Silence Deliverance &amp; Healing Ministry<br/>
          High Places Youth Ministry
        </div>
      </div>
    </div>
  `;

    const plainBody = `
New Student Registration — High Places Youth Ministry

Name: ${studentName}
Age: ${data.age || '—'}
Email: ${data.email || '—'}
Phone: ${data.phone || '—'}
School: ${data.school || '—'}
Grade: ${data.grade || '—'}
Zone: ${data.zone || '—'}
Career Interests: ${interests}
Goals: ${data.goals || '—'}
Notes: ${data.notes || '—'}
Parent Contact: ${data.parentContact || '—'}
  `;

    GmailApp.sendEmail(NOTIFICATION_EMAIL, subject, plainBody, {
        htmlBody: htmlBody,
        name: 'High Places Youth Ministry'
    });
}

/**
 * Test function — run this manually to verify the spreadsheet is created
 */
function testSetup() {
    const sheet = getOrCreateSheet();
    console.log('Sheet URL: ' + sheet.getParent().getUrl());
    console.log('Setup is working! Headers are in place.');
}
