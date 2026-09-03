import "dotenv/config";
import bcrypt from "bcryptjs";
import { db } from "./index";
import {
  users,
  properties,
  propertyImages,
  propertyFeatures,
  paymentPlans,
  constructionProjects,
  projectImages,
  projectFeatures,
  aiKnowledgeBase,
  siteSettings,
} from "./schema";

// Demo imagery is generated locally (see scripts/generate-placeholders.mjs) and
// served from /public/demo — this keeps the seeded demo content fully
// self-contained with no dependency on a third-party image host. Swap any of
// these for real photography via the admin panel at any time.
const IMG = (seed: string) => `/demo/${seed}.jpg`;

async function main() {
  console.log("Seeding database...");

  // ----- Admin user -----
  const adminEmail = process.env.SEED_ADMIN_EMAIL || "admin@hassanestates.pk";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || "ChangeMe!123";
  const passwordHash = await bcrypt.hash(adminPassword, 12);

  await db
    .insert(users)
    .values([
      {
        name: "Super Admin",
        email: adminEmail,
        passwordHash,
        role: "SUPER_ADMIN",
      },
      {
        name: "Editor Demo",
        email: "editor@hassanestates.pk",
        passwordHash: await bcrypt.hash("EditorPass123!", 12),
        role: "EDITOR",
      },
    ])
    .onConflictDoNothing();

  console.log(`Admin login -> ${adminEmail} / ${adminPassword}`);

  // ----- Properties -----
  const demoProperties = [
    {
      title: "10 Marla Residential Plot - Top City-1 Block A",
      slug: "10-marla-residential-plot-top-city-1-block-a",
      description:
        "A prime 10 Marla residential plot located in Block A of Top City-1, Islamabad. Ideal for building your dream home, surrounded by developed infrastructure, wide carpeted roads, and close to the main boulevard.",
      category: "RESIDENTIAL_PLOT" as const,
      status: "FOR_SALE" as const,
      price: "9500000",
      isNegotiable: true,
      area: "10",
      areaUnit: "MARLA" as const,
      location: "Block A, Top City-1",
      city: "Islamabad",
      society: "Top City-1",
      block: "Block A",
      fullAddress: "Plot Block A, Top City-1, Islamabad",
      latitude: "33.5124",
      longitude: "73.1500",
      isFeatured: true,
      featuredImage: IMG("plot-block-a-1"),
      images: [IMG("plot-block-a-1"), IMG("plot-block-a-2"), IMG("plot-block-a-3")],
      features: ["Corner Plot", "Possession Available", "Gas & Electricity Nearby", "Wide Road"],
    },
    {
      title: "1 Kanal Luxury House - Top City-1",
      slug: "1-kanal-luxury-house-top-city-1",
      description:
        "Elegant 1 Kanal double-storey house with modern architecture, 5 bedrooms, spacious lounge, and a beautifully landscaped lawn. Located in a quiet, secure block of Top City-1.",
      category: "HOUSE" as const,
      status: "AVAILABLE" as const,
      price: "45000000",
      isNegotiable: true,
      area: "1",
      areaUnit: "KANAL" as const,
      location: "Block B, Top City-1",
      city: "Islamabad",
      society: "Top City-1",
      block: "Block B",
      fullAddress: "House Block B, Top City-1, Islamabad",
      latitude: "33.5140",
      longitude: "73.1520",
      bedrooms: 5,
      bathrooms: 6,
      parking: 3,
      isFeatured: true,
      featuredImage: IMG("house-block-b-1"),
      images: [IMG("house-block-b-1"), IMG("house-block-b-2"), IMG("house-block-b-3")],
      features: ["Modern Kitchen", "Servant Quarter", "Home Theater", "Solar Panels", "Lawn"],
    },
    {
      title: "5 Marla Commercial Plot - B Block Commercial",
      slug: "5-marla-commercial-plot-b-block-commercial",
      description:
        "High-visibility 5 Marla commercial plot on the main commercial boulevard, B Block, Top City-1. Perfect for retail, offices or a showroom.",
      category: "COMMERCIAL_PLOT" as const,
      status: "BOOKING_OPEN" as const,
      price: "22000000",
      isNegotiable: false,
      area: "5",
      areaUnit: "MARLA" as const,
      location: "B Block Commercial, Top City-1",
      city: "Islamabad",
      society: "Top City-1",
      block: "B Block Commercial",
      fullAddress: "Commercial Plot, B Block Commercial, Top City-1, Islamabad",
      isFeatured: true,
      featuredImage: IMG("commercial-plot-1"),
      images: [IMG("commercial-plot-1"), IMG("commercial-plot-2")],
      features: ["Main Boulevard Facing", "High Footfall", "Corner Option Available"],
    },
    {
      title: "3 Bedroom Apartment - Top City-1 Heights",
      slug: "3-bedroom-apartment-top-city-1-heights",
      description:
        "Comfortable and secure 3-bedroom apartment in a gated community with lift access, ample parking, and 24/7 security in Top City-1.",
      category: "APARTMENT" as const,
      status: "FOR_RENT" as const,
      price: "85000",
      isNegotiable: true,
      area: "1600",
      areaUnit: "SQFT" as const,
      location: "Top City-1 Heights",
      city: "Islamabad",
      society: "Top City-1",
      block: "Heights Tower",
      fullAddress: "Top City-1 Heights, Islamabad",
      bedrooms: 3,
      bathrooms: 3,
      parking: 1,
      featuredImage: IMG("apartment-1"),
      images: [IMG("apartment-1"), IMG("apartment-2")],
      features: ["Lift Access", "24/7 Security", "Gas Backup", "Balcony"],
    },
    {
      title: "2 Kanal Farmhouse - Near Top City-1",
      slug: "2-kanal-farmhouse-near-top-city-1",
      description:
        "Spacious 2 Kanal farmhouse with a private pool, orchard, and guest house — a peaceful retreat just minutes from Top City-1.",
      category: "FARMHOUSE" as const,
      status: "AVAILABLE" as const,
      price: "65000000",
      isNegotiable: true,
      area: "2",
      areaUnit: "KANAL" as const,
      location: "Near Top City-1",
      city: "Islamabad",
      society: "Chak Shahzad Vicinity",
      block: "",
      fullAddress: "Near Top City-1, Islamabad",
      bedrooms: 4,
      bathrooms: 5,
      parking: 6,
      isFeatured: true,
      featuredImage: IMG("farmhouse-1"),
      images: [IMG("farmhouse-1"), IMG("farmhouse-2")],
      features: ["Private Pool", "Orchard", "Guest House", "Barbecue Area"],
    },
    {
      title: "Corner Shop - Top City-1 Commercial Market",
      slug: "corner-shop-top-city-1-commercial-market",
      description: "Ground floor corner shop in the bustling Top City-1 commercial market, ideal for retail business.",
      category: "SHOP" as const,
      status: "FOR_SALE" as const,
      price: "8500000",
      area: "250",
      areaUnit: "SQFT" as const,
      location: "Commercial Market, Top City-1",
      city: "Islamabad",
      society: "Top City-1",
      block: "B Block Commercial",
      fullAddress: "Shop B Block Commercial, Top City-1, Islamabad",
      featuredImage: IMG("shop-1"),
      images: [IMG("shop-1")],
      features: ["Corner Location", "Glass Frontage", "Ready Possession"],
    },
    {
      title: "Furnished Office Space - Top City-1 Business Center",
      slug: "furnished-office-space-top-city-1-business-center",
      description: "Fully furnished, move-in ready office space suitable for startups and corporate teams.",
      category: "OFFICE" as const,
      status: "FOR_RENT" as const,
      price: "120000",
      area: "1200",
      areaUnit: "SQFT" as const,
      location: "Top City-1 Business Center",
      city: "Islamabad",
      society: "Top City-1",
      block: "Business Center",
      fullAddress: "Business Center, Top City-1, Islamabad",
      featuredImage: IMG("office-1"),
      images: [IMG("office-1")],
      features: ["Furnished", "Conference Room", "High Speed Internet Ready"],
    },
    {
      title: "8 Marla Plot File - Top City-1 (Coming Soon)",
      slug: "8-marla-plot-file-top-city-1-coming-soon",
      description: "New development block opening soon in Top City-1. Reserve your file early with flexible installments.",
      category: "RESIDENTIAL_PLOT" as const,
      status: "COMING_SOON" as const,
      price: "6800000",
      area: "8",
      areaUnit: "MARLA" as const,
      location: "New Block, Top City-1",
      city: "Islamabad",
      society: "Top City-1",
      block: "New Block",
      fullAddress: "New Block, Top City-1, Islamabad",
      featuredImage: IMG("plot-file-1"),
      images: [IMG("plot-file-1")],
      features: ["Easy Installments", "Early Bird Discount"],
    },
  ];

  for (const p of demoProperties) {
    const { images, features, ...rest } = p;
    const [inserted] = await db
      .insert(properties)
      .values(rest)
      .onConflictDoNothing({ target: properties.slug })
      .returning({ id: properties.id });

    if (inserted) {
      if (images?.length) {
        await db.insert(propertyImages).values(
          images.map((url, i) => ({ propertyId: inserted.id, url, sortOrder: i, alt: p.title }))
        );
      }
      if (features?.length) {
        await db.insert(propertyFeatures).values(
          features.map((label, i) => ({ propertyId: inserted.id, label, sortOrder: i }))
        );
      }

      // Attach a payment plan to a few properties
      if (["10-marla-residential-plot-top-city-1-block-a", "5-marla-commercial-plot-b-block-commercial", "8-marla-plot-file-top-city-1-coming-soon"].includes(p.slug)) {
        const total = parseFloat(p.price);
        const booking = Math.round(total * 0.1);
        const down = Math.round(total * 0.2);
        const remaining = total - booking - down;
        const months = 36;
        await db.insert(paymentPlans).values({
          title: `${p.title} - Easy Installment Plan`,
          propertyId: inserted.id,
          totalPrice: String(total),
          bookingAmount: String(booking),
          downPayment: String(down),
          remainingAmount: String(remaining),
          monthlyInstallment: String(Math.round(remaining / months)),
          numberOfInstallments: months,
          notes: "Down payment can be split into 2 payments on request.",
        });
      }
    }
  }

  // ----- Construction Projects -----
  const demoProjects = [
    {
      name: "Sandhu Residency - Top City-1",
      slug: "sandhu-residency-top-city-1",
      location: "Block C, Top City-1, Islamabad",
      description:
        "A modern 1 Kanal residential construction project delivered by Sandhu Builders featuring contemporary architecture, premium finishes, and energy-efficient design.",
      projectType: "RESIDENTIAL" as const,
      status: "COMPLETED" as const,
      completionDate: new Date("2025-03-15"),
      isFeatured: true,
      featuredImage: IMG("project-residency-1"),
      images: [
        { url: IMG("project-residency-1"), kind: "GALLERY" },
        { url: IMG("project-residency-2"), kind: "GALLERY" },
        { url: IMG("project-residency-before"), kind: "BEFORE" },
        { url: IMG("project-residency-after"), kind: "AFTER" },
      ],
      features: ["Grey Structure to Finishing", "Imported Fittings", "Earthquake Resistant Design"],
    },
    {
      name: "Top City Commercial Plaza",
      slug: "top-city-commercial-plaza",
      location: "B Block Commercial, Top City-1, Islamabad",
      description:
        "A 4-storey commercial plaza under construction offering modern retail and office spaces with elevator access and ample parking.",
      projectType: "COMMERCIAL" as const,
      status: "UNDER_CONSTRUCTION" as const,
      isFeatured: true,
      featuredImage: IMG("project-plaza-1"),
      images: [
        { url: IMG("project-plaza-1"), kind: "GALLERY" },
        { url: IMG("project-plaza-2"), kind: "GALLERY" },
      ],
      features: ["Elevator Access", "Basement Parking", "Fire Safety Systems"],
    },
    {
      name: "Sandhu Modern Villa - Renovation",
      slug: "sandhu-modern-villa-renovation",
      location: "Bahria Town, Rawalpindi",
      description:
        "Complete renovation and interior remodeling of an existing villa, including facade redesign, kitchen upgrade and smart home wiring.",
      projectType: "RENOVATION" as const,
      status: "COMPLETED" as const,
      completionDate: new Date("2024-11-01"),
      featuredImage: IMG("project-villa-1"),
      images: [
        { url: IMG("project-villa-1"), kind: "GALLERY" },
        { url: IMG("project-villa-before"), kind: "BEFORE" },
        { url: IMG("project-villa-after"), kind: "AFTER" },
      ],
      features: ["Facade Redesign", "Smart Home Wiring", "Modern Kitchen"],
    },
    {
      name: "Green Valley Housing Scheme - Planning",
      slug: "green-valley-housing-scheme-planning",
      location: "Top City-1 Extension, Islamabad",
      description: "A master-planned residential housing scheme currently in the architectural planning and approval stage.",
      projectType: "RESIDENTIAL" as const,
      status: "PLANNING" as const,
      featuredImage: IMG("project-planning-1"),
      images: [{ url: IMG("project-planning-1"), kind: "GALLERY" }],
      features: ["Master Planning", "Approved Layout Pending", "Green Spaces"],
    },
  ];

  for (const proj of demoProjects) {
    const { images, features, ...rest } = proj;
    const [inserted] = await db
      .insert(constructionProjects)
      .values(rest)
      .onConflictDoNothing({ target: constructionProjects.slug })
      .returning({ id: constructionProjects.id });

    if (inserted) {
      if (images?.length) {
        await db.insert(projectImages).values(
          images.map((img, i) => ({ projectId: inserted.id, url: img.url, kind: img.kind, sortOrder: i, alt: proj.name }))
        );
      }
      if (features?.length) {
        await db.insert(projectFeatures).values(
          features.map((label, i) => ({ projectId: inserted.id, label, sortOrder: i }))
        );
      }
    }
  }

  // ----- AI Knowledge Base -----
  const knowledge = [
    {
      category: "COMPANY" as const,
      question: "Where is Hassan Estates with Sandhu Builders located?",
      answer:
        "Our office is located at Top City-1, B Block Commercial, Islamabad, Pakistan. You can call or WhatsApp us at 0331 8987584.",
      keywords: "location,address,office,where,find you",
    },
    {
      category: "COMPANY" as const,
      question: "What areas do you operate in?",
      answer:
        "We primarily operate in Top City-1 Islamabad, Islamabad city, and Rawalpindi and surrounding areas, with plans to expand across Pakistan.",
      keywords: "areas,cities,coverage,operate,serve",
    },
    {
      category: "CONSTRUCTION" as const,
      question: "What construction services does Sandhu Builders offer?",
      answer:
        "Sandhu Builders offers Residential Construction, Commercial Construction, House Construction, Renovation, Interior Work, Architectural Planning, and Project Management.",
      keywords: "construction,builders,services,build house,renovation,interior",
    },
    {
      category: "PAYMENT" as const,
      question: "Do you offer installment plans?",
      answer:
        "Yes, many of our properties and construction projects offer flexible payment plans with a booking amount, down payment, and monthly or quarterly installments. Use our Installment Calculator for an estimate, and check each property's Payment Plans section for exact terms.",
      keywords: "installment,payment plan,easy installments,monthly,down payment",
    },
    {
      category: "FAQ" as const,
      question: "How can I book a property visit?",
      answer:
        "You can request a property visit directly from any property's detail page using the 'Book a Property Visit' form, or contact us on WhatsApp/phone at 0331 8987584. Our team will confirm your visit.",
      keywords: "visit,book a visit,see the property,site visit,schedule",
    },
    {
      category: "POLICIES" as const,
      question: "Are listed prices negotiable?",
      answer:
        "Some listings are marked negotiable and shown on the property detail page. Final pricing is always confirmed directly with our sales team.",
      keywords: "negotiable,price,discount,final price",
    },
  ];
  await db.insert(aiKnowledgeBase).values(knowledge).onConflictDoNothing();

  // ----- Site Settings -----
  await db
    .insert(siteSettings)
    .values([
      { key: "stat_properties_listed", value: "250" },
      { key: "stat_properties_listed_label", value: "Properties Listed" },
      { key: "stat_projects_completed", value: "60" },
      { key: "stat_projects_completed_label", value: "Projects Completed" },
      { key: "stat_satisfied_clients", value: "500" },
      { key: "stat_satisfied_clients_label", value: "Satisfied Clients" },
      { key: "stat_years_experience", value: "12" },
      { key: "stat_years_experience_label", value: "Years of Experience" },
      { key: "office_hours", value: "Mon - Sat: 10:00 AM - 8:00 PM" },
      { key: "facebook_url", value: "" },
      { key: "instagram_url", value: "" },
      { key: "youtube_url", value: "" },
      { key: "custom_social_links", value: "[]" },

      // ----- Editable site branding & content (Admin -> Site Settings) -----
      { key: "site_logo_url", value: "/brand/logo.png" },

      // Website-wide color theme (Admin -> Site Settings -> Appearance).
      // Every dark surface and gold accent across the public site and admin
      // panel derives from these two colors — see src/lib/theme.ts.
      { key: "theme_primary_color", value: "#14161a" },
      { key: "theme_accent_color", value: "#f5a524" },

      { key: "hero_title_main", value: "Find Your" },
      { key: "hero_title_accent", value: "Luxury Dream Home" },
      { key: "hero_subtitle", value: "Discover premium property opportunities and professional construction solutions with Hassan Estates and Sandhu Builders." },
      { key: "hero_image", value: "/homepage/hero-dusk.jpg" },

      { key: "trust_title", value: "A Name You Can Trust in Top City-1" },
      { key: "trust_text", value: "With verified listings, transparent payment plans, and construction backed by Sandhu Builders, we bring together property expertise and building capability under one roof." },
      { key: "trust_image", value: "/homepage/cta-banner.jpg" },

      { key: "cta_title", value: "Ready to find your dream property?" },
      { key: "cta_text", value: "Speak with our team for a free, no-obligation consultation on buying, selling, or building in Top City-1." },
      { key: "cta_image", value: "/homepage/consultant.jpg" },

      { key: "hero_pill_image", value: "/homepage/consultant.jpg" },
      { key: "hero_pill_title", value: "Verified listings, honest pricing" },
      { key: "hero_pill_subtitle", value: "Trusted by 500+ clients across Top City-1" },

      { key: "about_image", value: "/homepage/about-3.jpg" },
      { key: "homepage_collage_1", value: "/homepage/about-1.jpg" },
      { key: "homepage_collage_2", value: "/homepage/about-3.jpg" },
      { key: "homepage_collage_3", value: "/homepage/about-4.jpg" },
      { key: "homepage_collage_4", value: "/homepage/about-2.jpg" },
      {
        key: "about_body",
        value:
          "**Hassan Estates** specializes in connecting buyers, sellers, and investors with the right residential and commercial opportunities in Top City-1 and its surrounding areas — offering verified listings, honest guidance, and end-to-end transaction support.\n\n**Sandhu Builders** complements this with professional construction services — from architectural planning to final finishing — delivering homes and commercial buildings constructed to premium standards.\n\nTogether, we offer a single trusted destination for anyone looking to buy, sell, or build property in the region, with plans to expand our services across Pakistan.",
      },

      { key: "builders_hero_title", value: "Professional Construction Solutions, Built on Trust" },
      { key: "builders_hero_subtitle", value: "From architectural planning to final finishing touches, Sandhu Builders delivers quality construction across Top City-1, Islamabad and Rawalpindi." },
      { key: "builders_hero_image", value: "/demo/builders-hero.jpg" },

      // Page banner backgrounds (Admin -> Site Settings -> Page Banner Backgrounds).
      // Each of these is the photo behind the short title band at the top of its page.
      { key: "properties_hero_image", value: "/demo/hero-banner.jpg" },
      { key: "projects_hero_image", value: "/demo/project-plaza-1.jpg" },
      { key: "payment_plans_hero_image", value: "/demo/house-block-b-2.jpg" },
      { key: "contact_hero_image", value: "/demo/office-1.jpg" },
      { key: "about_mission_image", value: "/demo/about-story.jpg" },

      // Homepage hero — subtle photo behind the title/text panel (left side of the
      // hero card), faded with a white gradient so the card still reads as clean/white.
      { key: "hero_card_image", value: "/demo/trust-section.jpg" },
    ])
    .onConflictDoNothing();

  console.log("Seeding complete.");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
