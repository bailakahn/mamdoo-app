/** @jsx jsx */
import { useMemo, useRef } from "react";
import { jsx, Container, Flex, Button } from "theme-ui";
import { useTranslations } from "next-intl";
import { useRouter } from "next/router";
import { keyframes } from "@emotion/core";
import { Link as ReloadLink } from "components/link";
import { Link } from "react-scroll";
import Logo from "components/logo";
import { DrawerProvider } from "contexts/drawer/drawer.provider";
import MobileDrawer from "./mobile-drawer";
import headerData from "./header.data";
import theme from "theme";
import LogoDark from "assets/logo-dark.svg";
import MamdooLogo from "assets/logo-3.png";
import Divider from "assets/divider.svg";

export default function Header({ className, hideHeader }) {
  const t = useTranslations();
  const { locale } = useRouter();
  const menuItems = useMemo(() => headerData(t), [t]);

  return (
    <DrawerProvider>
      <header sx={styles.header} className={className} id="header">
        <Container sx={styles.container}>
          <Logo src={MamdooLogo} sx={{ width: 300, marginLeft: "-85px" }} />

          {!hideHeader && (
            <Flex as="nav" sx={styles.nav}>
              {menuItems.map(({ path, label }, i) => (
                <Link
                  activeClass="active"
                  to={path}
                  spy={true}
                  smooth={true}
                  offset={-70}
                  duration={500}
                  key={i}
                >
                  {label}
                </Link>
              ))}
              <ReloadLink
                style={{
                  // color: theme.colors.primary,
                  border: `1px solid ${theme.colors.primary}`,
                  borderRadius: 5,
                }}
                path={locale.includes("fr") ? "/en" : "/fr"}
                label={locale.includes("fr") ? "Anglais" : "French"}
              />
            </Flex>
          )}
          {/* <Button
            className="donate__btn"
            variant="secondary"
            aria-label="Get Started"
          >
            Get Started
          </Button> */}

          <MobileDrawer />
        </Container>
      </header>
    </DrawerProvider>
  );
}

const positionAnim = keyframes`
  from {
    position: fixed;
    opacity: 1;
  }

  to {
    position: absolute;
    opacity: 1;
    transition: all 0.4s ease;
  }
`;

const styles = {
  header: {
    py: [4, null, 5],
    width: "100%",
    position: "absolute",
    top: 0,
    left: 0,
    backgroundColor: "transparent",
    transition: "all 0.4s ease",
    animation: `${positionAnim} 0.4s ease`,
    ".donate__btn": {
      flexShrink: 0,
      mr: [15, 20, null, null, 0],
      ml: ["auto", null, null, null, 0],
      backgroundImage: ["none", null, null, null, `url(${Divider})`],
      backgroundRepeat: "no-repeat",
      backgroundPosition: "center bottom",
      backgroundSize: "contain",
      backgroundColor: ["#FEEDEF", null, null, null, "transparent"],
      color: "primary",
      fontWeight: "bold",
      py: ["12px", null, null, null, 2],
      px: [3, null, null, null, 0],
      ":hover": {
        backgroundColor: ["primary", null, null, null, "transparent"],
        color: ["white", null, null, null, "primary"],
      },
    },
    "&.sticky": {
      position: "fixed",
      backgroundColor: "background",
      color: "heading",
      boxShadow: "0 1px 2px rgba(0, 0, 0, 0.06)",
      py: "20px",
      "nev > a": {
        color: "heading",
      },
      ".donate__btn": {
        border: "0px solid",
      },
    },
  },
  container: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    height: 45,
  },
  nav: {
    ml: "auto",
    mr: 6,
    display: "none",
    "@media screen and (min-width: 1024px)": {
      display: "block",
    },
    a: {
      fontSize: "16px",
      fontWeight: "heading",
      px: 20,
      cursor: "pointer",
      lineHeight: "1.2",
      transition: "all 0.15s",
      color: "heading",
      "&.active": {
        color: "primary",
      },
    },
  },
};
