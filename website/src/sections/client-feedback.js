/** @jsx jsx */
import { jsx } from "theme-ui";
import { useTranslations } from "next-intl";
import { Container, Box } from "theme-ui";
import SectionHeader from "components/section-header";
import Image from "components/image";

import Client from "assets/images/client-thumb.png";

export default function ClientFeedback() {
  const t = useTranslations();

  return (
    <section sx={{ variant: "section.feedback" }} id="feedback">
      <Container>
        <SectionHeader
          title={t("Home.connected_clients_and_drivers")}
          description={t("Home.connected_clients_and_drivers_description")}
        />

        <Box sx={styles.thumbWrapper}>
          <Image
            src={Client}
            alt="Clients Thumbnail"
            width="891"
            height="297"
          />
        </Box>
      </Container>
    </section>
  );
}

const styles = {
  thumbWrapper: {
    display: "flex",
    justifyContent: "center",
    px: 4,
    pb: [0, null, null, null, null, null, null, null, 6],
    img: {
      height: [100, "auto"],
    },
  },
};
