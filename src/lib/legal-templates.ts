// Starting templates for the Privacy Policy and Terms and Conditions, written for a US vehicle
// service contract (extended auto warranty) website. Tokens in {braces} are filled in from the
// business and privacy settings when the page is shown. An attorney must review both documents
// before relying on them (Admin → Legal & privacy has a "Reviewed by our attorney" checkbox).

export const DEFAULT_PRIVACY_HTML = `
<p>At {legal_name} (“{company}”, “we”, “us”), accessible from {site_url}, one of our main priorities is the privacy of our visitors and customers. This Privacy Policy explains what information we collect, how we use and share it, how we protect it, and the choices and rights you have, including how to opt out of the sale or sharing of your personal information.</p>

<h2>Information we collect</h2>
<h3>Information you give us</h3>
<ul>
<li><strong>Contact details:</strong> name, email address, phone number, ZIP code and state (for example when you request a quote, file a claim or contact us by phone, email or our website forms).</li>
<li><strong>Vehicle details:</strong> year, make, model, mileage, ownership and whether the factory warranty is still active.</li>
<li><strong>Service-related information:</strong> details about the plan you are interested in, your contract, claims and service requests.</li>
<li><strong>Messages:</strong> anything you tell us by phone, email, text or our forms.</li>
</ul>
<h3>Information collected automatically</h3>
<ul>
<li>Your IP address, browser and device type, pages visited, the page that referred you, and advertising campaign details (such as UTM codes and click IDs).</li>
<li>A record of your consent to be contacted, including the exact wording shown, the date and time, your IP address and the page you were on. We may use a third-party service to keep a certificate of this record.</li>
<li>Information from cookies and similar technologies. See <a href="#cookies-analytics-and-advertising">Cookies, analytics and advertising</a>.</li>
</ul>
<h3>Information from others</h3>
<p>Vehicle service contract providers and administrators may send us information about plans you apply for, buy or claim under. We may also use data providers to verify or complete contact and vehicle details.</p>

<h2>How we use your information</h2>
<ul>
<li>To prepare your quote and contact you with vehicle service contract plans and prices for your car.</li>
<li>To provide and manage our services, including processing your contract, claims and reimbursement requests.</li>
<li>To respond to your inquiries and provide customer support.</li>
<li>To contact you by phone, text message and email about your request, with your consent.</li>
<li>To run, secure and improve our website, prevent fraud and fix problems.</li>
<li>To measure and improve our advertising.</li>
<li>To communicate service status, contract updates and promotional offers (promotional messages only if you have opted in).</li>
<li>To meet legal and regulatory obligations.</li>
</ul>

<h2>How we share your information</h2>
<p>We do not sell, rent or share your personal information with third parties except as described here:</p>
<ul>
<li><strong>Vehicle service contract providers and administrators</strong> that issue and service the plans we offer, so they can price your plan, issue your contract and handle claims.</li>
<li><strong>Service providers</strong> that work for us, such as hosting, email, phone, payment, analytics and consent-recording companies. They may use your information only to provide services to us.</li>
<li><strong>Marketing partners</strong> who offer vehicle protection or related products, only where permitted. When we receive payment for this, it may be a “sale” of personal information under some state laws. You can <a href="/do-not-sell">opt out at any time</a>.</li>
<li><strong>Legal and safety reasons:</strong> to comply with law, respond to lawful requests, protect our rights, or in connection with a merger or sale of our business.</li>
</ul>

<h2>Calls, texts and emails</h2>
<p>When you submit a quote request and agree to be contacted, we and the companies named in our consent notice may call or text you at the number you provided, including with automated technology or prerecorded messages. Your consent is not a condition of any purchase. Message and data rates may apply.</p>
<p>You can stop texts at any time by replying <strong>STOP</strong>, ask any caller to stop calling you, use the unsubscribe link in our emails, or <a href="/do-not-sell">make a request online</a>. We keep an internal do-not-contact list and honor these requests.</p>

<h2>Cookies, analytics and advertising</h2>
<p>We use cookies and similar tools to keep the website working, understand how it is used (for example, Google Analytics) and measure our advertising (for example, the Meta Pixel). Some advertising tools may be considered “sharing” of personal information for cross-context behavioral advertising under some state laws.</p>
<p>You can block or delete cookies in your browser settings, though this may affect parts of the site. If you <a href="/do-not-sell">opt out of sale and sharing</a>, or your browser sends a <strong>Global Privacy Control</strong> signal, we turn off advertising tracking for your browser and treat the signal as a request to opt out.</p>

<h2>Data security</h2>
<p>We implement a variety of security measures to maintain the safety of your personal information, including encryption in transit, access controls, two-factor sign-in for staff and secure server infrastructure, to protect your data from unauthorized access, alteration, disclosure or destruction. No method of transmission or storage is completely secure, so we cannot guarantee absolute security.</p>

<h2>Your privacy rights</h2>
<p>Depending on where you live (for example California, Colorado, Connecticut, Virginia, Utah, Texas, Oregon and other states with privacy laws), you may have the right to:</p>
<ul>
<li><strong>Know and access</strong> the personal information we hold about you, and get a copy of it.</li>
<li><strong>Delete</strong> personal information we collected from you, with some legal exceptions.</li>
<li><strong>Correct</strong> inaccurate personal information.</li>
<li><strong>Opt out</strong> of the sale or sharing of your personal information, and of targeted advertising.</li>
<li><strong>Not be discriminated against</strong> for using your rights.</li>
</ul>
<p>To use these rights, visit <a href="/do-not-sell">Do Not Sell or Share My Personal Information</a>, email <a href="mailto:{privacy_email}">{privacy_email}</a> or call {privacy_phone}. We will verify your request by matching the details you provide with the information we hold, and respond within {response_days} days (we may extend this once where the law allows). An authorized agent may make a request for you; we may ask for proof of authorization. If we deny a request, you may appeal by replying to our response.</p>
<p>We do not sell or share the personal information of people we know to be under 16.</p>

<h2>Data retention</h2>
<p>We keep personal information for as long as needed for the purposes above, including to keep records of consent, contracts and claims, to resolve disputes and to meet legal obligations, and then delete or de-identify it.</p>

<h2>Third-party websites</h2>
<p>Our website may contain links to third-party websites. We are not responsible for the privacy practices or content of those sites and encourage you to review their privacy policies.</p>

<h2>Children's privacy</h2>
<p>{company} does not knowingly collect or solicit personal information from children under the age of 13. If we learn that we have collected such information, we will delete it as soon as possible.</p>

<h2>Changes to this Privacy Policy</h2>
<p>We may update this Privacy Policy from time to time to reflect changes in our practices, services or legal requirements. We will post updates on this page with a new “last updated” date and provide notice when changes are significant.</p>

<h2>Contact us</h2>
<p>If you have questions about this Privacy Policy or how we handle your information, contact us:</p>
<ul>
<li>Address: {address}</li>
<li>Phone: {privacy_phone}</li>
<li>Email: <a href="mailto:{privacy_email}">{privacy_email}</a></li>
</ul>
`.trim();

export const DEFAULT_TERMS_HTML = `
<p>Welcome to {company}. These Terms and Conditions outline the rules and regulations for the use of our website ({site_url}) and services. By accessing this website or requesting a quote, you agree to comply with these terms. If you do not agree with any part of these terms, please do not use our website or services.</p>

<h2>Acceptance of terms</h2>
<p>By using {legal_name}'s website and services, you accept and agree to be bound by these Terms and Conditions and our <a href="/privacy">Privacy Policy</a>. If you do not agree to these terms, you must stop using our services immediately.</p>

<h2>Use of our website and services</h2>
<p>Our website provides information about vehicle service contracts and lets you request quotes, file claims and contact us. You agree to use our services only for lawful purposes and in accordance with these Terms. You may not misuse the website, interfere with its proper functioning, submit false information, or use automated tools to access it without our permission.</p>

<h2>Services provided</h2>
<p>{company} offers vehicle service contracts, often called extended auto warranties, including plans for mechanical breakdown repairs, roadside assistance and prepaid maintenance. By purchasing a plan, you agree to the terms of the specific contract you select. Detailed coverage descriptions, limitations, exclusions, deductibles and claim procedures are provided in the contract itself, which controls in the event of any difference from this website.</p>
<p><strong>A vehicle service contract is not insurance.</strong> It is an optional contract that pays for repairs to the parts it lists, subject to its terms. Each contract is backed and administered by the provider named in it.</p>

<h2>Quotes and information</h2>
<p>Quotes and prices shown or quoted by our team are estimates based on the information you give us and are not binding until a contract is issued. We work to keep the information on this website accurate, but we do not guarantee that it is complete, current or error-free. Website content is for general information and is not legal, financial or mechanical advice.</p>

<h2>Consent to be contacted</h2>
<p>When you submit a quote request and tick the consent box, you authorize {company} and the companies named in the consent notice to contact you as described there. You may withdraw consent at any time (see our <a href="/privacy">Privacy Policy</a>). Consent is not a condition of purchase.</p>

<h2>Account responsibility</h2>
<p>If you are given an account, you are responsible for maintaining the confidentiality of your credentials and for all activity under your account. Notify us immediately of any unauthorized use.</p>

<h2>Payment and billing</h2>
<p>All payments for plans are due as stated at the time of purchase, in full or under the payment plan you choose. We reserve the right to change pricing or billing methods with notice to you. You are responsible for paying all charges associated with your plan. Our 30-day money-back guarantee lets you cancel within 30 days of purchase for a full refund, provided no claim has been paid; later cancellations are refunded pro rata under the terms of your contract.</p>

<h2>Claims and reimbursement</h2>
<p>Claims must be filed as described in your contract and on our <a href="/claims">Claims</a> page. Maintenance reimbursements require an itemized invoice with proof of payment submitted within 45 days of service and, once approved, are issued as a virtual prepaid card; please allow 2–3 weeks for processing and delivery.</p>

<h2>Termination and suspension</h2>
<p>{company} reserves the right to suspend or terminate your access to the website and services if we determine that you have violated these Terms or engaged in fraudulent or illegal activity. Contract cancellation rights are governed by your contract.</p>

<h2>Intellectual property</h2>
<p>All content on this website, including text, graphics, logos and software, belongs to {legal_name} or its licensors and is protected by copyright and trademark law. You may not copy, reproduce or distribute it without our written permission, except for personal, non-commercial use.</p>

<h2>Limitation of liability</h2>
<p>To the fullest extent permitted by law, {legal_name} will not be liable for any indirect, incidental, special or consequential damages arising from the use of, or inability to use, our website or services. Our total liability shall be limited to the amount paid for the specific plan purchased. Nothing in these Terms limits rights you have under your contract or applicable consumer protection law.</p>

<h2>Governing law</h2>
<p>These Terms are governed by the laws of the State of {governing_state}, USA, without regard to its conflict-of-law rules. Any dispute related to these Terms will be subject to the jurisdiction of the courts located in {governing_state}, unless your contract provides otherwise.</p>

<h2>Changes to these terms</h2>
<p>{company} may update or modify these Terms at any time. Changes will be posted on this page with a new “last updated” date, and it is your responsibility to review these Terms periodically. Continued use of the website after changes means you accept them.</p>

<h2>Contact us</h2>
<p>If you have questions about these Terms or any aspect of our services, contact us:</p>
<ul>
<li>Address: {address}</li>
<li>Phone: {phone}</li>
<li>Email: <a href="mailto:{email}">{email}</a></li>
</ul>
`.trim();
