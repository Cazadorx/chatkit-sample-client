import React from "react";
import style from "./index.module.css";

export const WelcomeScreen = () => (
  <section>
    <div className={style.component}>
      <span role="img" aria-label="post">
        <svg
          width="27"
          height="29"
          viewBox="0 0 27 29"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M10.6067 0L7.95502 1.52249L13.2584 4.56748L18.5617 1.52249L15.91 0L13.2584 1.52249L10.6067 0Z"
            fill="#FF8473"
          />
          <path
            d="M2.65167 4.56748L5.30335 3.04498L13.2584 7.61246L21.2134 3.04498L23.8651 4.56748L13.2584 10.6574L2.65167 4.56748Z"
            fill="#FF8473"
          />
          <path
            d="M7.95502 16.7474L5.30335 15.2249V18.2699L7.95502 19.7924V16.7474Z"
            fill="#FF8473"
          />
          <path
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M0 6.08997V21.3149L13.2584 28.9274V13.7024L0 6.08997ZM10.6067 15.2249V24.3599L2.65167 19.7924V10.6574L10.6067 15.2249Z"
            fill="#FF8473"
          />
          <path
            d="M15.91 12.1799V15.2249L26.5167 9.13495V6.08997L15.91 12.1799Z"
            fill="#FF8473"
          />
          <path
            d="M15.91 18.2699V21.3149L26.5167 15.2249V12.1799L15.91 18.2699Z"
            fill="#FF8473"
          />
          <path
            d="M15.91 24.3599V27.4049L26.5167 21.3149V18.2699L15.91 24.3599Z"
            fill="#FF8473"
          />
        </svg>
      </span>
      <p>
        Authenticating, subscribing to rooms
        <br />
        and fetching messages.
      </p>
    </div>
  </section>
);
