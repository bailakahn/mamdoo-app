import { useEffect } from "react";
import Router from "next/router";
import { initGA, logPageView } from "analytics";
import { NextIntlProvider } from "next-intl";

// Load Typeface Fonts
import "typeface-dm-sans";
import "typeface-bree-serif";
import "typeface-roboto-slab";

// Load other package css file
import "rc-drawer/assets/index.css";
import "theme/styles.css";

export default function CustomApp({ Component, pageProps }) {
  useEffect(() => {
    initGA();
    logPageView();
    Router.events.on("routeChangeComplete", logPageView);
  }, []);

  return (
    <NextIntlProvider messages={pageProps.messages}>
      <Component {...pageProps} />
    </NextIntlProvider>
  );
}
