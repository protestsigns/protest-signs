const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://protestsigns.com'

export function wrapEmail(title: string, bodyHtml: string) {
  return `
    <div style="background:#f4f4f4;padding:24px 0;font-family:Arial,Helvetica,sans-serif;">
      <table role="presentation" style="max-width:520px;margin:0 auto;background:#ffffff;border-radius:8px;overflow:hidden;border:1px solid #e5e5e5;">
        <tr>
          <td style="background:#000000;padding:20px 24px;text-align:center;">
            <img src="${SITE_URL}/logo.png" alt="Protest Signs" height="40" style="height:40px;width:auto;display:inline-block;" />
          </td>
        </tr>
        <tr>
          <td style="padding:32px 24px;color:#000000;">
            ${bodyHtml}
          </td>
        </tr>
        <tr>
          <td style="background:#000000;padding:16px 24px;text-align:center;">
            <p style="margin:0;color:#ffffff;font-size:12px;">Protest Signs &middot; ${SITE_URL.replace(/^https?:\/\//, '')}</p>
          </td>
        </tr>
      </table>
    </div>
  `
}
