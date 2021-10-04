/** @jsx jsx */
import { useMemo } from "react";
import { jsx, Container, Box } from "theme-ui";
import { useTranslations } from "next-intl";
import TextFeature from "components/text-feature";
import Image from "components/image";

import HappyImage from "assets/images/happy.svg";

export default function Knowledge() {
  const t = useTranslations();

  const data = useMemo(
    () => ({
      title: t("Home.our_technology"),
      description: t("Home.our_technology_description"),
      btnName: "Explore Details",
      btnURL: "#",
    }),
    []
  );

  return (
    <section sx={{ variant: "section.knowledge" }}>
      <Container sx={styles.containerBox}>
        <Box sx={styles.contentBox}>
          <TextFeature
            title={data.title}
            description={data.description}
            // btnName={data.btnName}
            // btnURL={data.btnURL}
          />
        </Box>
        <Box sx={styles.thumbnail}>
          <Image src={HappyImage} alt="Thumbnail" width="632" height="750" />
        </Box>
      </Container>
    </section>
  );
}

const styles = {
  containerBox: {
    display: "flex",
    alignItems: "center",
    justifyContent: ["flex-Start", null, null, "space-between"],
    flexWrap: ["wrap", null, null, "nowrap"],
  },
  thumbnail: {
    pl: [0, null, null, 4, 7, 8, 9],
    pr: [0, null, null, null, 2, 9, 6],
    display: "flex",
    mx: ["auto", null, null, 0],
    img: {
      height: [400, "auto"],
    },
  },
  contentBox: {
    flexShrink: 0,
    textAlign: ["center", null, null, "left"],
    width: ["100%", null, null, 365, 420, 430, "490px"],
    pb: [7, null, null, 0],
    ".description": {
      pr: [0, null, 7, 5],
    },
    ".btn__link": {
      mt: [5, null, null, 6],
    },
  },
};
