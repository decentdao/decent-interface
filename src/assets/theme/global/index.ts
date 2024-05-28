import inputStyles from "./input"
import scrollStyles from "./scroll"
import toastStyles from "./toast"

export default {
  global: (props: any) => ({
    body: {
      background: "neutral-1",
      backgroundRepeat: "no-repeat",
      fontFamily: "body",
      // @todo
      color: "white",
      height: "100%",
    },
    html: {
      background: "neutral-1",
      backgroundAttachment: "fixed",
      backgroundRepeat: "no-repeat",
      scrollBehavior: "smooth",
      height: "100%",
    },
    ...toastStyles(props),
    ...scrollStyles,
    ...inputStyles,
  }),
}
