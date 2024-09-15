import { Helmet } from "react-helmet-async";

function SEO({
  title = "",
  description = "",
  image = "",
  url = "",
  type = "website",
  twitterUsername = "",
}) {
  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{title}</title>
      <link rel="canonical" href={window.location.href} />
      <meta name="description" content={description} />

      {/* Open Graph / Facebook Meta Tags */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={title} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={image} />
      <meta property="og:description" content={description} />

      {/* Twitter Meta Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      {twitterUsername && (
        <meta name="twitter:site" content={`@${twitterUsername}`} />
      )}
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
    </Helmet>
  );
}

export default SEO;
