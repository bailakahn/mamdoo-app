/** @jsx jsx */
import { useMemo } from "react";
import { jsx, Container, Box } from "theme-ui";
import { useTranslations } from "next-intl";
import TextFeature from "components/text-feature";
import Image from "components/image";
import { IoIosCheckmarkCircle } from "react-icons/io";

import MapAmico from "assets/images/map-amico.svg";
import DrawingArrow from "assets/drawing-arrow.svg";

export default function BusinessProfit() {
  const t = useTranslations();

  const data = useMemo(
    () => ({
      title: t("Home.get_a_ride_in_minutes"),
      description: t("Home.get_a_ride_in_minutes_description"),
      btnName: "Explore Details",
      btnURL: "#",
      points: [
        {
          icon: <IoIosCheckmarkCircle />,
          text: t("Home.advantage_1"),
        },
        {
          icon: <IoIosCheckmarkCircle />,
          text: t("Home.advantage_2"),
        },
      ],
    }),
    []
  );

  return (
    <section sx={{ variant: "section.profit" }}>
      <Container sx={styles.containerBox}>
        <Box sx={styles.thumbnail}>
          <Image src={MapAmico} alt="Thumbnail" width="700" height="565" />
        </Box>
        <Box sx={styles.contentBox}>
          <TextFeature
            title={data.title}
            description={data.description}
            // btnName={data.btnName}
            // btnURL={data.btnURL}
            points={data.points}
          />
        </Box>
      </Container>
      <Box sx={styles.bottomArrow}>
        <Image src={DrawingArrow} alt="Arrow" />
      </Box>
    </section>
  );
}

const styles = {
  containerBox: {
    display: "flex",
    alignItems: "center",
    justifyContent: ["flex-Start", null, null, "space-between"],
    flexWrap: ["wrap", null, null, "nowrap"],
    pb: [0, null, null, null, null, null, null, 8],
  },
  thumbnail: {
    pr: [2, null, 7, 4, 7, 8, null, 10],
    pl: [0, null, 7, 0],
    display: "flex",
    order: [2, null, null, 0],
    mx: ["auto", 0],
    img: {
      ml: [0, null, null, -3],
      height: [265, "auto"],
    },
  },
  contentBox: {
    flexShrink: 0,
    textAlign: ["center", null, null, "left"],
    width: ["100%", null, null, 350, 400, "470px"],
    pb: [7, null, null, 0],
    ".btn__link": {
      mt: [4, null, 5],
    },
  },
  bottomArrow: {
    position: "absolute",
    bottom: -185,
    left: "33%",
    display: ["none", null, null, null, null, null, null, "block"],
  },
};
