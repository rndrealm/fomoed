export const sideMenuAnimProps = {
  duration: 0.75,
  delay: 0,
  ease: [0.4, 0.0, 0.2, 1],
};

export const sideMenuVariants = {
  open: {
    opacity: 1,
    transition: {
      duration: 0.75,
      ease: sideMenuAnimProps.ease,
    },
  },
  closed: {
    opacity: 0,
    transition: {
      duration: 0.75,
      ease: sideMenuAnimProps.ease,
    },
  },
};
