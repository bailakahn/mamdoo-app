/** @jsx jsx */
import { ThemeProvider, jsx, Container, Box, Heading, Text } from "theme-ui";
import theme from "theme";
import SEO from "components/seo";
import Layout from "components/layout";
import { useTranslations } from "next-intl";

export default function PolicyPage() {
  const t = useTranslations();

  return (
    <ThemeProvider theme={theme}>
      <Layout hideHeader={true}>
        <SEO
          description="Collection of free top of the line startup landing templates built using react/ next js. Free to download, simply edit and deploy! Updated weekly!"
          title="Mamdoo"
        />
        <section sx={styles.banner} id="home">
          <Container sx={styles.banner.container}>
            <Box sx={styles.banner.contentBox}>
              <Heading
                // style={{ margin: "0 auto" }}
                as="h1"
                variant="heroPrimary"
              >
                {t("PrivacyPolicy.1-title")}
              </Heading>
              <Text as="h4" variant="heroSecondary">
                {t("PrivacyPolicy.lastUpadated")}
              </Text>
              <Text as="p" variant="heroSecondary">
                {t("PrivacyPolicy.1-1-paragraph")}
              </Text>
              <Text as="p" variant="heroSecondary">
                {t("PrivacyPolicy.1-2-paragraph")}
              </Text>
              <Box>
                <ol>
                  <li>
                    {t("PrivacyPolicy.2-title")}
                    <ol>
                      <li>{t("PrivacyPolicy.2-1-title")}</li>
                      <p>{t("PrivacyPolicy.2-1-paragraph")}</p>
                      <li>{t("PrivacyPolicy.2-2-title")}</li>
                      <p>{t("PrivacyPolicy.2-2-1-paragraph")}</p>
                      <p>{t("PrivacyPolicy.2-2-2-paragraph")}</p>
                      <p>{t("PrivacyPolicy.2-2-3-paragraph")}</p>
                      <p>{t("PrivacyPolicy.2-2-4-paragraph")}</p>
                      <p>{t("PrivacyPolicy.2-2-5-paragraph")}</p>
                      <p>{t("PrivacyPolicy.2-2-6-paragraph")}</p>
                      <p>{t("PrivacyPolicy.2-2-7-paragraph")}</p>
                      <p>{t("PrivacyPolicy.2-2-8-paragraph")}</p>
                      <p>{t("PrivacyPolicy.2-2-9-paragraph")}</p>
                      <p>{t("PrivacyPolicy.2-2-10-paragraph")}</p>
                      <p>{t("PrivacyPolicy.2-2-11-paragraph")}</p>
                      <p>{t("PrivacyPolicy.2-2-12-paragraph")}</p>
                    </ol>
                  </li>
                  <li>
                    {t("PrivacyPolicy.3-title")}
                    <ol>
                      <li>
                        {t("PrivacyPolicy.3-1-title")}
                        <ol>
                          <li>
                            {t("PrivacyPolicy.3-1-1-title")}
                            <p>{t("PrivacyPolicy.3-1-1-1-paragraph")}</p>
                            <ul>
                              <li>{t("PrivacyPolicy.3-1-1-1-list")}</li>
                              <li>{t("PrivacyPolicy.3-1-1-2-list")}</li>
                              <li>{t("PrivacyPolicy.3-1-1-3-list")}</li>
                            </ul>
                          </li>
                          <li>
                            {t("PrivacyPolicy.3-1-2-title")}
                            <p>{t("PrivacyPolicy.3-1-2-1-paragraph")}</p>
                            <p>{t("PrivacyPolicy.3-1-2-2-paragraph")}</p>
                          </li>
                          <li>
                            {t("PrivacyPolicy.3-1-3-title")}
                            <p>{t("PrivacyPolicy.3-1-3-1-paragraph")}</p>
                            <p>{t("PrivacyPolicy.3-1-3-2-paragraph")}</p>
                            <p>{t("PrivacyPolicy.3-1-3-3-paragraph")}</p>
                            <p>{t("PrivacyPolicy.3-1-3-4-paragraph")}</p>
                          </li>
                          <li>
                            {t("PrivacyPolicy.3-1-4-title")}
                            <p>{t("PrivacyPolicy.3-1-4-1-paragraph")}</p>
                            <ul>
                              <li>{t("PrivacyPolicy.3-1-4-1-list")}</li>
                              <li>{t("PrivacyPolicy.3-1-4-2-list")}</li>
                              <li>{t("PrivacyPolicy.3-1-4-3-list")}</li>
                              <li>{t("PrivacyPolicy.3-1-4-4-list")}</li>
                              <li>{t("PrivacyPolicy.3-1-4-5-list")}</li>
                              <li>{t("PrivacyPolicy.3-1-4-6-list")}</li>
                              <li>{t("PrivacyPolicy.3-1-4-7-list")}</li>
                              <li>{t("PrivacyPolicy.3-1-4-8-list")}</li>
                              <li>{t("PrivacyPolicy.3-1-4-9-list")}</li>
                              <li>{t("PrivacyPolicy.3-1-4-10-list")}</li>
                              <li>{t("PrivacyPolicy.3-1-4-11-list")}</li>
                              <li>{t("PrivacyPolicy.3-1-4-12-list")}</li>
                              <li>{t("PrivacyPolicy.3-1-4-13-list")}</li>
                              <li>{t("PrivacyPolicy.3-1-4-14-list")}</li>
                            </ul>
                          </li>
                          <li>
                            {t("PrivacyPolicy.3-1-5-title")}
                            <p>{t("PrivacyPolicy.3-1-5-1-paragraph")}</p>
                            <p>{t("PrivacyPolicy.3-1-5-2-paragraph")}</p>
                          </li>
                          <li>
                            {t("PrivacyPolicy.3-1-6-title")}
                            <p>{t("PrivacyPolicy.3-1-6-1-paragraph")}</p>
                            <p>{t("PrivacyPolicy.3-1-6-2-paragraph")}</p>
                            <p>{t("PrivacyPolicy.3-1-6-3-paragraph")}</p>
                          </li>
                        </ol>
                      </li>
                    </ol>
                  </li>
                  <li>
                    {t("PrivacyPolicy.4-title")}
                    <ol>
                      <li>
                        {t("PrivacyPolicy.4-1-title")}
                        <p>{t("PrivacyPolicy.4-1-1-paragraph")}</p>
                      </li>
                      <li>
                        {t("PrivacyPolicy.4-2-title")}
                        <p>{t("PrivacyPolicy.4-2-1-paragraph")}</p>
                      </li>
                      <li>
                        {t("PrivacyPolicy.4-3-title")}
                        <p>{t("PrivacyPolicy.4-3-1-paragraph")}</p>
                        <ul>
                          <li>{t("PrivacyPolicy.4-3-1-list")}</li>
                          <li>{t("PrivacyPolicy.4-3-2-list")}</li>
                          <li>{t("PrivacyPolicy.4-3-3-list")}</li>
                          <li>{t("PrivacyPolicy.4-3-4-list")}</li>
                          <li>{t("PrivacyPolicy.4-3-5-list")}</li>
                        </ul>
                      </li>
                      <li>
                        {t("PrivacyPolicy.4-4-title")}
                        <p>{t("PrivacyPolicy.4-4-1-paragraph")}</p>
                      </li>
                    </ol>
                  </li>
                  <li>
                    {t("PrivacyPolicy.5-title")}
                    <p>{t("PrivacyPolicy.5-1-paragraph")}</p>
                    <ol>
                      <li>
                        {t("PrivacyPolicy.5-1-title")}
                        <p>{t("PrivacyPolicy.5-1-1-paragraph")}</p>
                        <ul>
                          <li>{t("PrivacyPolicy.5-1-1-list")}</li>
                        </ul>
                        <p>
                          {t("PrivacyPolicy.5-1-2-paragraph")}{" "}
                          <a href={t("PrivacyPolicy.5-1-1-link")}>
                            {t("PrivacyPolicy.5-1-1-link")}
                          </a>
                        </p>
                      </li>
                      <li>
                        {t("PrivacyPolicy.5-2-title")}
                        <p>{t("PrivacyPolicy.5-2-1-paragraph")}</p>
                        <p>{t("PrivacyPolicy.5-2-2-paragraph")}</p>
                      </li>
                    </ol>
                  </li>
                  <li>
                    {t("PrivacyPolicy.6-title")}
                    <p>{t("PrivacyPolicy.6-1-paragraph")}</p>
                  </li>
                  <li>
                    {t("PrivacyPolicy.7-title")}
                    <p>{t("PrivacyPolicy.7-1-paragraph")}</p>
                    <p>{t("PrivacyPolicy.7-2-paragraph")}</p>
                    <p>{t("PrivacyPolicy.7-3-paragraph")}</p>
                  </li>
                  <li>
                    {t("PrivacyPolicy.8-title")}
                    <p>{t("PrivacyPolicy.8-1-paragraph")}</p>
                    <p>
                      {t("PrivacyPolicy.8-2-paragraph")}
                      <a href={"mailto:" + t("PrivacyPolicy.8-contact")}>
                        {t("PrivacyPolicy.8-contact")}
                      </a>
                    </p>
                    <p>
                      {t("PrivacyPolicy.8-3-paragraph")}
                      <a href={t("PrivacyPolicy.8-2-link")}>
                        {t("PrivacyPolicy.8-2-link")}
                      </a>
                    </p>
                  </li>
                </ol>
              </Box>
            </Box>
          </Container>
        </section>
      </Layout>
    </ThemeProvider>
  );
}

export function getStaticProps({ locale }) {
  return {
    props: {
      messages: require(`../locales/${locale}.json`),
    },
  };
}

const styles = {
  banner: {
    overflow: ["hidden", "initial", null, null, "hidden"],
    pt: ["150px", "145px"],
    pb: [0, null, null, null, 2],
    container: {
      display: "flex",
      flexDirection: ["column", null, null, null, "row"],
    },
    title: {
      margin: "0 auto",
    },
    contentBox: {
      // width: ["100%", 430, 550, "75%", "50%", "45%"],
      width: ["100%", 430, 550, "75%"],
      display: "flex",
      flexDirection: "column",
      alignItems: "flex-start",
      flexShrink: 0,
      pt: [0, null, null, null, null, 6, 7, "70px"],
      mb: ["60px", null, null, null, 0],
      mx: [0, "auto"],
      textAlign: ["center", null, null, null, "left"],
      ".subscribe__area": {
        width: "100%",
        pr: [0, null, null, null, 6, "65px"],
        mb: ["35px", null, "45px"],
      },
    },
  },
};
