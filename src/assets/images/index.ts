import placeholderPoster from './placeholder/placeholder-poster.svg';

const imageRoot = '/images';

const images = {
  avatars: {
    OnePiece01: `${imageRoot}/avatars/onepiece-user-00.jpeg`,
    OnePiece02: `${imageRoot}/avatars/onepiece-user-01.jpeg`,
    OnePiece03: `${imageRoot}/avatars/onepiece-user-02.jpeg`,
    OnePiece04: `${imageRoot}/avatars/onepiece-user-03.jpeg`,
    OnePiece05: `${imageRoot}/avatars/onepiece-user-04.jpeg`,
    OnePiece06: `${imageRoot}/avatars/onepiece-user-05.jpeg`,
    OnePiece07: `${imageRoot}/avatars/onepiece-user-06.jpeg`,
    OnePiece08: `${imageRoot}/avatars/onepiece-user-07.jpeg`,
    OnePiece09: `${imageRoot}/avatars/onepiece-user-08.jpeg`,
    OnePiece010: `${imageRoot}/avatars/onepiece-user-09.jpeg`,
    DragonBall01: `${imageRoot}/avatars/dragonball-user-00.jpeg`,
    DragonBall02: `${imageRoot}/avatars/dragonball-user-01.jpeg`,
    DragonBall03: `${imageRoot}/avatars/dragonball-user-02.jpeg`,
    DragonBall04: `${imageRoot}/avatars/dragonball-user-03.jpeg`,
    DragonBall05: `${imageRoot}/avatars/dragonball-user-04.jpeg`,
    DragonBall06: `${imageRoot}/avatars/dragonball-user-05.jpeg`,
  },
  imgLoadingVertical: placeholderPoster,
  instagramIcon: `${imageRoot}/ins-normal.png`,
  facebookIcon: `${imageRoot}/fb-normal.png`,
  twitterIcon: `${imageRoot}/tw-normal.png`,
  searchIcon: `${imageRoot}/icons/search.png`,
  downArrow: `${imageRoot}/down_arrow.png`,
  bgOpacity: `${imageRoot}/bg-opacity.png`,
  logo: `${imageRoot}/icons/logo.png`,
  lang: `${imageRoot}/lang.png`,
} as const;

export default images;
