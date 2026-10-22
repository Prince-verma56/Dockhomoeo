import { Metadata } from "next";
import { LegalPageLayout, LegalSection } from "@/components/shared/LegalPageLayout";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "DocHomoeo's privacy policy — how we collect, use, and protect your personal information.",
};

const SECTIONS: LegalSection[] = [
  {
    id: "collection",
    label: "Collection of Information",
    title: "Collection of Personally Identifiable Information and Other Information",
    content: (
      <>
        <p>
          We store and process Your Information including any sensitive financial
          information collected (as defined under the Information Technology Act,
          2000), if any, on computers that may be protected by physical as well as
          reasonable technological security measures and procedures in accordance
          with Information Technology Act 2000 and Rules there under. If you
          object to Your Information being transferred or used in this way please
          do not use the Website.
        </p>
        <p>
          We collect and store your personal information which is provided by you
          from time to time. Our primary goal in doing so is to provide you a
          safe, efficient, smooth and customized experience. We use this
          information to do internal research on our users&apos; demographics,
          interests, and behavior to better understand, protect and serve our
          users. We may share personal information with our other corporate
          entities and affiliates. These entities and affiliates may market to you
          as a result of such sharing unless you explicitly opt-out.
        </p>
      </>
    ),
  },
  {
    id: "cookies",
    label: "Cookies",
    content: (
      <>
        <p>
          We use data collection devices such as &ldquo;cookies&rdquo; on certain
          pages of the Website to help analyze our web page flow, measure
          promotional effectiveness, and promote trust and safety.
          &ldquo;Cookies&rdquo; are small files placed on your hard drive that
          assist us in providing our services. We offer certain features that are
          only available through the use of a &ldquo;cookie&rdquo;.
        </p>
        <p>
          We also use cookies to allow you to enter your password less frequently
          during a session. Cookies can also help us provide information that is
          targeted to your interests. Most cookies are &ldquo;session
          cookies,&rdquo; meaning that they are automatically deleted from your
          hard drive at the end of a session. You are always free to decline our
          cookies if your browser permits, although in that case you may not be
          able to use certain features on the Website and you may be required to
          re-enter your password more frequently during a session.
        </p>
        <p>
          Additionally, you may encounter &ldquo;cookies&rdquo; or other similar
          devices on certain pages of the Website that are placed by third
          parties. We do not control the use of cookies by third parties.
        </p>
      </>
    ),
  },
  {
    id: "disclosure",
    label: "Disclosure of Information",
    title: "Disclosure of Personal Information",
    content: (
      <>
        <p>
          We may disclose personal information to third parties. This disclosure
          may be required for us to provide you access to our Services, to comply
          with our legal obligations, to enforce our User Agreement, to facilitate
          our marketing and advertising activities, or to prevent, detect,
          mitigate, and investigate fraudulent or illegal activities related to our
          Services. We do not disclose your personal information to third parties
          for their marketing and advertising purposes without your explicit
          consent.
        </p>
        <p>
          We may disclose personal information if required to do so by law or in
          the good faith belief that such disclosure is reasonably necessary to
          respond to subpoenas, court orders, or other legal process. We may
          disclose personal information to law enforcement offices, third party
          rights owners, or others in the good faith belief that such disclosure
          is reasonably necessary to: enforce our Terms or Privacy Policy; respond
          to claims that an advertisement, posting or other content violates the
          rights of a third party; or protect the rights, property or personal
          safety of our users or the general public.
        </p>
        <p>
          We and our affiliates will share / sell some or all of your personal
          information with another business entity should we (or our assets) plan
          to merge with, or be acquired by that business entity, or
          re-organization, amalgamation, restructuring of business.
        </p>
      </>
    ),
  },
  {
    id: "disclaimer",
    label: "Disclaimer of Warranties",
    title: "Disclaimer of Warranties and Liability",
    content: (
      <>
        <p>
          This Website, all the materials and products (including but not limited
          to software) and services, included on or otherwise made available to
          you through this site are provided on &ldquo;as is&rdquo; and &ldquo;as
          available&rdquo; basis without any representation or warranties, express
          or implied except otherwise specified in writing. Without prejudice to
          the foregoing paragraph, DocHomoeo does not warrant that:
        </p>
        <ul className="list-disc pl-5 space-y-1.5 my-3">
          <li>
            This Website will be constantly available, or available at all; or
          </li>
          <li>
            The information on this Website is complete, true, accurate or
            non-misleading.
          </li>
        </ul>
        <p>
          DocHomoeo will not be liable to you in any way or in relation to the
          Contents of, or use of, or otherwise in connection with, the Website.
          DocHomoeo does not warrant that this site; information, Content,
          materials, product (including software) or services included on or
          otherwise made available to You through the Website; their servers; or
          electronic communication sent from Us are free of viruses or other
          harmful components.
        </p>
        <p>
          Nothing on Website constitutes, or is meant to constitute, advice of any
          kind. All the Products sold on Website are governed by different state
          laws and if Seller is unable to deliver such Products due to
          implications of different state laws, Seller will return or will give
          credit for the amount (if any) received in advance by Seller from the
          sale of such Product that could not be delivered to You.
        </p>
        <p>
          You will be required to enter a valid phone number while placing an
          order on the Website. By registering your phone number with us, you
          consent to be contacted by us via phone calls, SMS notifications, mobile
          applications and/or any other electronic mode of communication in case
          of any order or shipment or delivery related updates. We may use your
          personal information to initiate any promotional phone calls or SMS.
        </p>
      </>
    ),
  },
  {
    id: "payment",
    label: "Payment Terms",
    title: "Payment",
    content: (
      <>
        <p>
          While availing any of the payment method/s available on the Website, we
          will not be responsible or assume any liability, whatsoever in respect of
          any loss or damage arising directly or indirectly to you due to:
        </p>
        <ul className="list-disc pl-5 space-y-1.5 my-3">
          <li>Lack of authorization for any transaction/s, or</li>
          <li>Any payment issues arising out of the transaction, or</li>
          <li>Decline of transaction for any other reason(s)</li>
        </ul>
        <p>
          All payments made against the purchases/services on Website by you shall
          be compulsorily in Indian Rupees acceptable in the Republic of India.
          Website will not facilitate transaction with respect to any other form of
          currency with respect to the purchases made on Website.
        </p>
        <p>
          All Valid Credit / Debit / Cash Card / and other payment instruments are
          processed using a Credit Card payment gateway or appropriate payment
          system infrastructure and the same will also be governed by the terms and
          conditions agreed to between the Buyer and the respective Issuing Bank
          and payment instrument issuing company.
        </p>
        <p>
          All Online Bank Transfers from Valid Bank Accounts are processed using
          the gateway provided by the respective Issuing Bank which support
          Payment Facility to provide these services to the Users. All such Online
          Bank Transfers on Payment Facility are also governed by the terms and
          conditions agreed to between Buyer and the respective Issuing Bank.
        </p>
        <p>
          DocHomoeo reserves the right to refuse to process Transactions by Buyers
          with a prior history of questionable charges including without
          limitation breach of any agreements by Buyer with DocHomoeo or
          breach/violation of any law or any charges imposed by Issuing Bank or
          breach of any policy.
        </p>
        <p>
          DocHomoeo may do such checks as it deems fit before approving the
          receipt of Buyers commitment to pay (for Cash On Delivery transactions)
          Transaction Price from the Buyer for security or other reasons at the
          discretion of DocHomoeo. As a result of such check if DocHomoeo is not
          satisfied with the creditability of the Buyer or genuineness of the
          Transaction or other reasons at its sole discretion, DocHomoeo shall
          have the right to reject the receipt of Buyers commitment to pay
          Transaction Price. For avoidance of doubt, it is hereby clarified that
          the Cash on Delivery feature for payment, may be disabled for certain
          account users, at the sole discretion of DocHomoeo.
        </p>
        <p>
          DocHomoeo may delay notifying the payment confirmation i.e. informing
          Seller to Dispatch, if DocHomoeo deems suspicious or for Buyers
          conducting high transaction volumes to ensure safety of the Transaction
          and Transaction Price. In addition, DocHomoeo may hold Transaction Price
          and DocHomoeo may not inform Seller to Dispatch or remit Transaction
          Price to law enforcement officials (instead of refunding the same to
          Buyer) at the request of law enforcement officials or in the event the
          Buyer is engaged in any form of illegal activity.
        </p>
      </>
    ),
  },
  {
    id: "replacement",
    label: "Replacement Guarantee",
    content: (
      <>
        <p>
          DocHomoeo&apos;s Replacement Guarantee seeks to assist Buyers. The
          return policy period depends on the product category. If at the time of
          delivery and/or within the applicable return policy period, if any
          defect is found, then the buyer of the product(s) can ask for
          replacement of the product(s) from DocHomoeo subject to the
          following terms and conditions:
        </p>
        <ul className="list-disc pl-5 space-y-1.5 my-3">
          <li>
            Notify DocHomoeo of any defects in the product(s) at the time of
            delivery of the product/s and/or within the applicable return policy
            period and the same product(s) will be replaced in return of the
            defective product(s).
          </li>
        </ul>
        <p>
          If DocHomoeo has any suspicion or knowledge that any of its buyers are
          involved in any activity that is intended to provide claims or
          information that is false or not genuine, DocHomoeo may also, while
          reserving its rights to initiate civil and/or criminal proceedings
          against such member buyers, at its sole discretion, suspend, block,
          restrict, cancel the Display Name of such buyers and/or disqualify that
          user and any related users from availing protection through this
          program. Customers who have been blocked for any suspicious or
          fraudulent activity on DocHomoeo will not be allowed to return their
          products.
        </p>
        <p>
          Any person who, knowingly and with intent to injure, defraud or deceive,
          files a Fraudulent Complaint containing false, incomplete, or misleading
          information may be guilty of a criminal offence and will be prosecuted
          to the fullest extent of the law.
        </p>
      </>
    ),
  },
  {
    id: "profanity",
    label: "Profanity Policy",
    content: (
      <>
        <p>
          This policy extends to text within listings, on Seller pages and all
          other areas of the site that another User may view. If the profane words
          are part of a title for the item being sold, we allow Sellers to
          &ldquo;blur&rdquo; out the bulk of the offending word with asterisks.
        </p>
        <p>
          Please report any violations of this policy to the correct area for
          review. If a feedback comment, or any communication made between Users
          on the Website, or email communication between Users in relation to
          transactions conducted on Website contain profanity, please review Our
          feedback removal policy and submit a request for action/removal.
        </p>
        <p>
          DocHomoeo will consider the circumstances of an alleged policy violation
          and the user&apos;s trading records before taking action.
        </p>
      </>
    ),
  },
  {
    id: "indemnity",
    label: "Indemnity",
    content: (
      <p>
        You shall indemnify and hold harmless DocHomoeo, its owner, licensee,
        affiliates, subsidiaries, group companies (as applicable) and their
        respective officers, directors, agents, and employees, from any claim or
        demand, or actions including reasonable attorneys&apos; fees, made by any
        third party or penalty imposed due to or arising out of Your breach of
        this Terms of Use, privacy Policy and other Policies, or Your violation
        of any law, rules or regulations or the rights (including infringement
        of intellectual property rights) of a third party.
      </p>
    ),
  },
  {
    id: "jurisdiction",
    label: "Applicable Law",
    content: (
      <>
        <p>
          Privacy Policy shall be governed by and interpreted and construed in
          accordance with the laws of India. The place of jurisdiction shall be
          exclusively in New Delhi.
        </p>
        <p>
          Unless otherwise specified, the material on the Website is presented
          solely for the purpose of sale in India. DocHomoeo make no
          representation that materials in the Website are appropriate or available
          for use in other locations/Countries other than India. Those who choose
          to access this site from other locations/Countries other than India do
          so on their own initiative and DocHomoeo is not responsible for supply of
          products/refund for the products ordered from other
          locations/Countries other than India, compliance with local laws, if and
          to the extent local laws are applicable.
        </p>
      </>
    ),
  },
  {
    id: "intellectual-property",
    label: "Intellectual Property",
    content: (
      <p>
        This site is controlled and operated by DocHomoeo powered by Jyoti
        Homoeo Centre and products are sold by respective DocHomoeo. All
        material on this site, including images, illustrations, audio clips, and
        video clips, are protected by copyrights, trademarks, and other
        intellectual property rights. Material on Website is solely for your
        personal, non-commercial use. You must not copy, reproduce, republish,
        upload, post, transmit or distribute such material in any way, including
        by email or other electronic means and whether directly or indirectly
        and you must not assist any other person to do so. Without the prior
        written consent of the owner, modification of the materials, use of the
        materials on any other website or networked computer environment or use
        of the materials for any purpose other than personal, non-commercial use
        is a violation of the copyrights, trademarks and other proprietary
        rights, and is prohibited.
      </p>
    ),
  },
  {
    id: "product-description",
    label: "Product Description",
    content: (
      <p>
        At DocHomoeo, we do not warrant that Product description or other
        content of this Website is accurate, complete, reliable, current, or
        error-free and assume no liability in this regard.
      </p>
    ),
  },
  {
    id: "limitation",
    label: "Limitation of Liability",
    content: (
      <p className="font-semibold text-ink">
        IN NO EVENT SHALL DOCHOMOEO BE LIABLE FOR ANY SPECIAL, INCIDENTAL,
        INDIRECT OR CONSEQUENTIAL DAMAGES OF ANY KIND IN CONNECTION WITH THIS
        PRIVACY POLICY, EVEN IF USER HAS BEEN INFORMED IN ADVANCE OF THE
        POSSIBILITY OF SUCH DAMAGES.
      </p>
    ),
  },
  {
    id: "unsubscribe",
    label: "Unsubscribe",
    content: (
      <p>
        If you want to remove your contact information from all our lists and
        newsletters, please email our support team at{" "}
        <a
          href="mailto:contact.dochomoeo@gmail.com"
          className="text-forest-deep underline hover:text-forest-deep/80 font-medium"
        >
          contact.dochomoeo@gmail.com
        </a>{" "}
        with the subject &ldquo;Unsubscribe Request&rdquo;.
      </p>
    ),
  },
  {
    id: "contact",
    label: "Grievance Officer",
    content: (
      <>
        <p>
          In accordance with Information Technology Act 2000 and rules made there
          under, the name and contact details of the Grievance Officer are
          provided below:
        </p>
        <p>
          For any questions or comments (including all inquiries unrelated to
          copyright infringement) regarding this Website, please contact us at{" "}
          <a
            href="mailto:contact.dochomoeo@gmail.com"
            className="text-forest-deep underline hover:text-forest-deep/80 font-medium"
          >
            contact.dochomoeo@gmail.com
          </a>
          .
        </p>
      </>
    ),
  },
];

export default function PrivacyPolicyPage() {
  return (
    <LegalPageLayout
      title="Privacy Policy"
      intro="We view protection of your privacy as a very important principle. We understand clearly that You and Your Personal Information is one of our most important assets and we value the trust you place in us."
      sections={SECTIONS}
      callout={
        <div className="rounded-xl bg-sage-wash/70 p-4 border border-line-soft">
          <p className="text-xs text-muted-ink">
            <strong className="text-ink">Note:</strong> Our privacy policy is
            subject to change at any time without notice. To make sure you are
            aware of any changes, please review this policy periodically. By
            visiting this Website you agree to be bound by the terms and
            conditions of this Privacy Policy.
          </p>
        </div>
      }
    />
  );
}
