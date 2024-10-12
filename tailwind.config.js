/** @type {import('tailwindcss').Config} */
const plugin = require("tailwindcss/plugin");

export default {
  content: ["./index.php", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    screens: {
      "3xl": { min: "1600px" },
      "2xl": { min: "1280px", max: "1599px" },
      xl: { min: "1024px", max: "1279px" },

      "2xls": { max: "1599px" },
      "2xlm": { max: "1400px" }, 
      xlm: { max: "1279px" },
      slm: { max: "1199px" },
      clm: { max: "1023px" },
      lgm: { max: "992px" },
      mdm: { max: "768px" },
      ssm: { max: "535px" },
      ccm: { max: "479px" },
      kdm: { max: "400px" },
      xsm: { max: "320px" },
    },
    colors: {
      primary: "var(--primary-color)",
      secondary: "var(--secondary-color)",
      items: "var(--items-color)",
      thirty: "var(--thirty-color)",
      hover: "var(--hover-color)",
      title: "var(--title-color)",
      dark: "var(--dark-color)",
    },
    backgroundImage: {
      "bg-content-area-color": "var(--bg-content-area-color)",
      "bg-linear-to-right": "var(--bg-linear-to-right)",
      "bg-linear-to-left": "var(--bg-linear-to-left)",
      "bg-bar-controls": "var(--bg-bar-controls)",
      "bg-btn-primary": "var(--bg-btn-primary)",
      "bg-btn-primary": "var(--bg-btn-primary)",
    },
    borderColor: {
      transparent: "transparent",
      "bd-black": "var(--bd-black)",
      "bd-active": "var(--bd-active)",
      "bd-select-menu": "var(--bd-select-menu)",
      "bd-filed-form-color": "var(--bd-filed-form-color)",
      "bd-btn-pagination-color": "var(--bd-btn-pagination-color)",
    },
    backgroundColor: {
      "bg-transparent": "transparent",
      "bg-field": "var(--bg-field)",
      "bg-block": "var(--bg-block)",
      "bg-white": "var(--bg-white)",
      "bg-green": "var(--bg-green)",
      "bg-dimmer": "var(--bg-dimmer)",
      "bg-player": "var(--bg-player)",
      "bg-footer": "var(--bg-footer)",
      "bg-layout": "var(--bg-layout)",
      "bg-sidebar": "var(--bg-sidebar)",
      "bg-disabled": "var(--bg-disabled)",
      "bg-odd-color": "var(--bg-odd-color)",
      "bg-multiport": "var(--bg-multiport)",
      "bg-layer-btn": "var(--bg-layer-btn)",
      "bg-menu-items": "var(--bg-menu-items)",
      "bg-search-btn": "var(--bg-search-btn)",
      "bg-slider-color": "var(--bg-slider-color)",
      "bg-select-color": "var(--bg-select-color)",
      "bg-layout-loading": "var(--bg-layout-loading)",
      "bg-hover-btn-primary": "var(--bg-hover-btn-primary)",
      "bg-btn-hover-pagination": "var(--bg-btn-hover-pagination)",
      "bg-process-slider-color": "var(--bg-process-slider-color)",
      "bg-btn-active-pagination": "var(--bg-btn-active-pagination)",
      "bg-btn-hover-active-pagination": "var(--bg-btn-hover-active-pagination)",
    },
    width: {
      "width-layout-xl": "var(--width-layout-xl)",
      "width-layout-2xl": "var(--width-layout-2xl)",
      "width-layout-3xl": "var(--width-layout-3xl)",
      "width-detail-film-layout-clm": "var(--width-detail-film-layout-clm)",
      "width-detail-film-layout-slm": "var(--width-detail-film-layout-slm)",
      "width-detail-film-layout-2xlm": "var(--width-detail-film-layout-2xlm)",
    },
  },
  plugins: [
    plugin(function ({ addComponents }) {
      addComponents({
        ".bg-search-form": {
          background: "var(--bg-search-form)",
        },
        ".mask-loading": {
          WebkitMask: "-webkit-linear-gradient(top, #000, transparent)",
        },
      });
    }),
  ],
};
   