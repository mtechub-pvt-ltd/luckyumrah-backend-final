
function emailThankYouBody(companyName, color, announcement_date, link) {

  return `<div style="font-family: Helvetica, Arial, sans-serif; min-width: 1000px; overflow: auto; line-height: 2">
  <div style="margin: 50px auto; width: 70%; padding: 20px 0">
      <div style="border-bottom: 1px solid #eee">
          <a href="" style="font-size: 1.4em; color: ${color}; text-decoration: none; font-weight: 600">${companyName}</a>
      </div>
      <p style="font-size: 1.1em">Form Filled Successfully,</p>
      <p>Thank you for choosing ${companyName}. Thank you for filling out the participant form! 🎉</p>
      <p>Eagerly awaiting our next announcement on ${announcement_date}.</p>
      <p>If you have any questions or need assistance, don't hesitate to reach out. Stay tuned for exciting updates!</p>
      <p>Visit below to get More updates regarding Lucky Draw</p>
      <a href=${link} style="text-decoration: none;">
          <h2 style="background: ${color}; margin: 0 auto; width: max-content; padding: 0 10px; color: #fff; border-radius: 4px;">Explore More!</h2>
      </a>
      <p style="font-size: 0.9em;">Regards,<br />${companyName}</p>
      <hr style="border: none; border-top: 1px solid #eee" />
      <div style="float: right; padding: 8px 0; color: #aaa; font-size: 0.8em; line-height: 1; font-weight: 300">
          <p>${companyName}:</p>
          <p>Address</p>
          <p>Country</p>
      </div>
  </div>
</div>`
}
module.exports = emailThankYouBody