/** @jsx jsx */
import { useMemo } from "react";
import { jsx } from "theme-ui";
import { Container, Grid } from "theme-ui";
import { useTranslations } from "next-intl";
import SectionHeader from "components/section-header";
import FeatureCard from "components/feature-card.js";
import Marketplace from "assets/feature/marketplace.svg";
import Gift from "assets/feature/gift.svg";
import Award from "assets/feature/award.svg";

export default function Feature() {
  const t = useTranslations();

  const data = useMemo(
    () => [
      {
        id: 1,
        imgSrc: Marketplace,
        altText: "Marketplace",
        title: t("Home.why_choose_us_1"),
        text: t("Home.why_choose_us_1_description"),
      },
      {
        id: 2,
        imgSrc: Gift,
        altText: "Gift",
        title: t("Home.why_choose_us_2"),
        text: t("Home.why_choose_us_2_description"),
      },
      {
        id: 3,
        imgSrc: Award,
        altText: "Awards",
        title: t("Home.why_choose_us_2"),
        text: t("Home.why_choose_us_2_description"),
      },
    ],
    []
  );

  return (
    <section sx={{ variant: "section.feature" }} id="feature">
      <Container>
        <SectionHeader
          title={t("Home.why_choose_us")}
          description={t("Home.why_choose_us_description")}
        />

        <Grid sx={styles.grid}>
          {data.map((item) => (
            <FeatureCard
              key={item.id}
              src={item.imgSrc}
              alt={item.title}
              title={item.title}
              text={item.text}
            />
          ))}
        </Grid>
      </Container>
    </section>
  );
}

const styles = {
  grid: {
    pt: [0, null, null, null, null, null, null, null, 4],
    pb: [0, null, null, null, null, null, null, null, 6],
    gridGap: [
      "40px",
      "45px",
      "45px 30px",
      null,
      "60px 30px",
      "50px 40px",
      null,
      "75px",
    ],
    gridTemplateColumns: [
      "repeat(1,1fr)",
      null,
      "repeat(2,1fr)",
      null,
      "repeat(3,1fr)",
    ],
  },
};
