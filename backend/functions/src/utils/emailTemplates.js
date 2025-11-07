// src/utils/emailTemplates/verificationTemplate.js

const BRAND = {
  company: "Leo-Edge Consulting",
  accent: "#0E7CFF",
  text: "#0B1220",
  muted: "#5A6572",
  bg: "#F5F7FB",
  card: "#FFFFFF",
  border: "#E6EAF0",
};

export const emailTemplate = (user, verifyURL) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1.0" />
  <title>Email Verification — ${BRAND.company}</title>
</head>
<body style="margin:0;padding:0;background:${
  BRAND.bg
};font-family:Arial,sans-serif;color:${BRAND.text};">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:${
    BRAND.bg
  };">
    <tr>
      <td align="center" style="padding:32px 12px;">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:${
          BRAND.card
        };border-radius:10px;overflow:hidden;border:1px solid ${BRAND.border};">
          <tr>
            <td style="padding:24px;text-align:center;">
              <h2 style="margin:0 0 8px;font-size:22px;color:${
                BRAND.text
              };">Welcome, ${user.name || "User"} 👋</h2>
              <p style="margin:0 0 18px;font-size:15px;line-height:1.6;color:${
                BRAND.muted
              };">
                Thanks for signing up with <strong>${
                  BRAND.company
                }</strong>.<br/>
                Please confirm your email address by clicking the button below:
              </p>

              <a href="${verifyURL}"
                style="display:inline-block;margin:20px 0;padding:14px 28px;background:${
                  BRAND.accent
                };color:#fff;text-decoration:none;font-weight:bold;border-radius:6px;">
                Verify Email
              </a>
            </td>
          </tr>
          <tr>
            <td style="background:${
              BRAND.bg
            };padding:18px;text-align:center;font-size:12px;color:${
  BRAND.muted
};">
              © ${new Date().getFullYear()} ${
  BRAND.company
}. All rights reserved.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

export const salaryPaidTemplate = ({
  name,
  monthLabel,
  amount,
  cycleStart,
  cycleEnd,
}) => `
        <!DOCTYPE html>
                       <html lang="en">
                     <head>
   <meta charset="UTF-8" />
   <meta name="viewport" content="width=device-width,initial-scale=1.0" />
  <title>Salary Paid — ${BRAND.company}</title>
  </head>
    <body style="margin:0;padding:0;background:${
  BRAND.bg
    };font-family:Arial,sans-serif;color:${BRAND.text};">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:${
    BRAND.bg
  };">
    <tr>
      <td align="center" style="padding:32px 12px;">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:${
          BRAND.card
        };border-radius:10px;overflow:hidden;border:1px solid ${BRAND.border};">
          <tr>
            <td style="padding:24px;">
              <h2 style="margin:0 0 12px;color:${
                BRAND.text
              };">Salary Credited</h2>
              <p style="margin:0 0 8px;">Hello <strong>${name}</strong>,</p>
              <p style="margin:0 0 16px;">Your salary for <strong>${monthLabel}</strong> has been marked <span style="color:green;font-weight:bold;">PAID</span>.</p>

              <table cellpadding="6" cellspacing="0" style="font-size:14px;margin-bottom:16px;">
                <tr><td><strong>Pay Period:</strong></td><td>${cycleStart} – ${cycleEnd}</td></tr>
                <tr><td><strong>Amount:</strong></td><td>PKR ${Number(
                  amount || 0
                ).toLocaleString()}</td></tr>
                <tr><td><strong>Status:</strong></td><td>Paid</td></tr>
              </table>

              <p style="margin:12px 0 0;color:${BRAND.muted};font-size:13px;">
                If you have any questions, reply to this email.
              </p>

              <p style="margin:24px 0 0;color:${BRAND.muted};font-size:13px;">
                — HR & Payroll · ${BRAND.company}
              </p>
            </td>
          </tr>
          <tr>
            <td style="background:${
              BRAND.bg
            };padding:18px;text-align:center;font-size:12px;color:${
               BRAND.muted
            };">
              © ${new Date().getFullYear()} ${
                BRAND.company
              }. All rights reserved.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

export const thirdMonthReferralTemplate = ({
  employeeName,
  referredBy,
  monthLabel,
}) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1.0" />
  <title>Referral Bonus — ${BRAND.company}</title>
</head>
<body style="margin:0;padding:0;background:${
  BRAND.bg
};font-family:Arial,sans-serif;color:${BRAND.text};">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:${
    BRAND.bg
  };">
    <tr>
      <td align="center" style="padding:32px 12px;">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:${
          BRAND.card
        };border-radius:10px;overflow:hidden;border:1px solid ${BRAND.border};">
          <tr>
            <td style="padding:24px;">
              <h2 style="margin:0 0 12px;">Referral Bonus Due</h2>
              <p style="margin:0 0 8px;">Employee <strong>${employeeName}</strong> has completed 3 months as of <strong>${monthLabel}</strong>.</p>
              <p style="margin:0 0 8px;">They were referred by <strong>${referredBy}</strong>. Please process the following bonuses:</p>
              <ul style="margin:12px 0;padding-left:18px;">
                <li>PKR <strong>2,500</strong> for <strong>${employeeName}</strong></li>
                <li>PKR <strong>2,500</strong> for <strong>${referredBy}</strong></li>
              </ul>
              <p style="margin:12px 0 0;font-size:13px;color:${
                BRAND.muted
              };">— Payroll Automation · ${BRAND.company}</p>
            </td>
          </tr>
          <tr>
            <td style="background:${
              BRAND.bg
            };padding:18px;text-align:center;font-size:12px;color:${
  BRAND.muted
};">
              © ${new Date().getFullYear()} ${
  BRAND.company
}. All rights reserved.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
