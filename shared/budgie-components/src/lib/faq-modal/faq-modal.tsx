import styles from './faq-modal.module.css';

/* eslint-disable-next-line */
export interface FaqModalProps {
  onClose: () => void;
}

export function FaqModal(props: FaqModalProps) {
  return (
    <>
      <div className="flex flex-col shadow-lg z-10 fixed top-0 right-0 z-10  bg-[var(--block-background)] p-8 h-full" style={{ width: '85vw' }}>
        <div className="pageTitle">
          <span
            className="material-symbols-outlined cursor-pointer"
            style={{ marginRight: '0.5rem', fontSize: '1.5rem' }}
            onClick={props.onClose}
          >
            arrow_back
          </span>
          FAQs
        </div>
        <div className="p-4 bg-gray-100">
          <h1 className="text-2xl font-bold text-green-600 mb-6">
            Frequently Asked Questions
          </h1>
          <div className="space-y-6">
            <div className="p-6 bg-white shadow-lg rounded-lg group">
              <h2 className="text-xl font-semibold text-gray-900">
                How do I use budgie?
              </h2>
              <div className="mt-2 hidden group-hover:block">
                <p className="text-gray-700">
                  <a
                    className=" text-red-600"
                    href="https://docs.google.com/document/d/1wD1tkLlVJexyeik-I8PiA0uGVXaGhgMb/edit?usp=drive_link&ouid=101664320262092732975&rtpof=true&sd=true"
                  >
                    Tutorial
                  </a>
                </p>
              </div>
            </div>
            <div className="p-6 bg-white shadow-lg rounded-lg group">
              <h2 className="text-xl font-semibold text-gray-900">
                What is this Budgie?
              </h2>
              <div className="mt-2 hidden group-hover:block">
                <p className="text-gray-700">
                  This Budget App helps you manage your finances by tracking
                  your income and expenses, and provides insights to help you
                  save money.
                </p>
              </div>
            </div>
            <div className="p-6 bg-white shadow-lg rounded-lg group">
              <h2 className="text-xl font-semibold text-gray-900">
                How do I create a budget?
              </h2>
              <div className="mt-2 hidden group-hover:block">
                <p className="text-gray-700">
                  To create a budget, upload your account statements in the
                  dashboard page. The app will then provide analytics from those
                  statements that will provide you with some guidance on your
                  monthly income and expenses. The analytics will be in the
                  dashboard.
                </p>
              </div>
            </div>
            <div className="p-6 bg-white shadow-lg rounded-lg group">
              <h2 className="text-xl font-semibold text-gray-900">
                How do I delete my account?
              </h2>
              <div className="mt-2 hidden group-hover:block">
                <p className="text-gray-700">
                  Click on the settings in navigation, Account settings, and
                  then click Delete Account.
                </p>
              </div>
            </div>
            <div className="p-6 bg-white shadow-lg rounded-lg group">
              <h2 className="text-xl font-semibold text-gray-900">
                Is there a mobile app available?
              </h2>
              <div className="mt-2 hidden group-hover:block">
                <p className="text-gray-700">
                  No, the Budgie app is still being developed exclusively in a
                  web-based environment.
                </p>
              </div>
            </div>
            <div className="p-6 bg-white shadow-lg rounded-lg group">
              <h2 className="text-xl font-semibold text-gray-900">
                How do I reset my password?
              </h2>
              <div className="mt-2 hidden group-hover:block">
                <p className="text-gray-700">
                  To reset your password, go to the login page and click on the
                  'Forgot Password' link. Follow the instructions sent to your
                  email.
                </p>
              </div>
            </div>

            <div className="p-6 bg-white shadow-lg rounded-lg group">
              <h2 className="text-xl font-semibold text-gray-900">
                What if I have more questions?
              </h2>
              <div className="mt-2 hidden group-hover:block">
                <p className="text-gray-700">
                  If you have more questions, you can contact our support team
                  via email at support@budgie.com or visit our Help Center for
                  more information.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default FaqModal;
