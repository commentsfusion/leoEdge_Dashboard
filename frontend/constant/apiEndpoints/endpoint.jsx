const BaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

export const ENDPOINTS = {
  TRANSCENDDATA: {
    DATA: `${BaseUrl}/home-page?populate[heroSection][populate]=*&populate[services][populate][serviceCards][populate][]=thumbnail&populate[services][populate][serviceCards][populate][]=innerServices.image&populate[partners][populate]=partnerImages.image&populate[videoSection][populate]=*&populate[journey][populate]=*&populate[faqs][populate][faqTabs][populate]=faqItems&populate[contentBlock][populate]=*&populate[videoSection2][populate]=*&populate[ctaSection][populate]=*&populate[teamSection][populate]=teamCard.image&populate[headlineCtaSection][populate]=*`,
  },
  FORM: {
    SERVICEFORM: `${BaseUrl}/service-forms`,
    CONTACTFORM: `${BaseUrl}/contact-forms`,
  },
  NAVBAR: {
    DATA: `${BaseUrl}/services`,
  },
  SERVICE: {
    DATA: (slug) =>
      `${BaseUrl}/services?filters[slug][$eq]=${slug}&populate[herosection][populate]=*&populate[aboutsection][populate]=*&populate[features][populate]=serviceCards.thumbnail&populate[videsection][populate]=*&populate[contentBlock][populate]=*&populate[chooseus][populate]=*&populate[themecolor][populate]=*&populate[metas][populate]=*`,
  },
  SETTING: {
    DATA: `${BaseUrl}/setting`
  },
  CONTACT: {
    DATA: `${BaseUrl}/contact?populate[HeroBanner][populate]=*`
  }
};
