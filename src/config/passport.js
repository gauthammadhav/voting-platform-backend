const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const { Strategy: JwtStrategy, ExtractJwt } = require("passport-jwt");
const prisma = require("./prisma");
const LinkedInStrategy = require("passport-linkedin-oauth2").Strategy;
require("dotenv").config();

// Require native fetch (Node 18+) for LinkedIn OIDC userinfo fetch
const fetchFn = global.fetch;
if (!fetchFn) {
  throw new Error(
    "global.fetch is unavailable; use Node 18+ or add a fetch polyfill"
  );
}

// Support both LINKEDIN_CLIENT_SECRET and the previously used LINKED_IN_CLIENT_SECRET
const LINKEDIN_CLIENT_SECRET =
  process.env.LINKEDIN_CLIENT_SECRET || process.env.LINKED_IN_CLIENT_SECRET;

// Validate required environment variables
if (!process.env.GOOGLE_CLIENT_ID) {
  throw new Error("GOOGLE_CLIENT_ID is not defined in environment variables");
}
if (!process.env.GOOGLE_CLIENT_SECRET) {
  throw new Error(
    "GOOGLE_CLIENT_SECRET is not defined in environment variables"
  );
}
if (!process.env.GOOGLE_CALLBACK_URL) {
  throw new Error(
    "GOOGLE_CALLBACK_URL is not defined in environment variables"
  );
}

const LINKEDIN_CALLBACK_URL =
  process.env.LINKEDIN_CALLBACK_URL ||
  "http://localhost:3000/auth/linkedin/callback";

// Default to OpenID Connect scopes for "Sign in with LinkedIn using OpenID Connect"
// (openid, profile, email). Allow overriding via LINKEDIN_SCOPE env (comma-separated).
const LINKEDIN_SCOPE = process.env.LINKEDIN_SCOPE
  ? process.env.LINKEDIN_SCOPE.split(",")
      .map((s) => s.trim())
      .filter(Boolean)
  : ["openid", "profile", "email"];

if (!process.env.LINKEDIN_CLIENT_ID) {
  throw new Error("LINKEDIN_CLIENT_ID is not defined in environment variables");
}

if (!LINKEDIN_CLIENT_SECRET) {
  throw new Error(
    "LINKEDIN_CLIENT_SECRET (or LINKED_IN_CLIENT_SECRET) is not defined in environment variables"
  );
}

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const provider = "google";
        const providerUserId = profile.id;
        const name = profile.displayName;
        const email = profile.emails?.[0]?.value || null;

        let user = await prisma.user.findUnique({
          where: {
            provider_providerUserId: {
              provider,
              providerUserId,
            },
          },
        });

        if (!user) {
          user = await prisma.user.create({
            data: {
              provider,
              providerUserId,
              name,
              email,
            },
          });
        }

        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

// JWT strategy: verify Bearer token and attach user to req.user
passport.use(
  new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET,
    },
    async (payload, done) => {
      try {
        const user = await prisma.user.findUnique({
          where: { id: payload.userId },
        });

        if (!user) {
          return done(null, false);
        }

        return done(null, user);
      } catch (error) {
        return done(error, false);
      }
    }
  )
);

const linkedInStrategy = new LinkedInStrategy(
  {
    clientID: process.env.LINKEDIN_CLIENT_ID,
    clientSecret: LINKEDIN_CLIENT_SECRET,
    callbackURL: LINKEDIN_CALLBACK_URL,
    scope: LINKEDIN_SCOPE,
    state: false,
    skipUserProfile: false, // let strategy call our override
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      if (!profile || !profile.id) {
        return done(new Error("LinkedIn profile missing id"), null);
      }

      const provider = "linkedin";
      const providerUserId = profile.id;
      const name = profile.displayName || "";
      const email = profile.emails?.[0]?.value || null;
      const linkedinUrl = profile.profileUrl || null;

      let user = await prisma.user.findUnique({
        where: {
          provider_providerUserId: {
            provider,
            providerUserId,
          },
        },
      });

      if (!user) {
        user = await prisma.user.create({
          data: {
            provider,
            providerUserId,
            email,
            name,
            linkedinUrl,
          },
        });
      }

      return done(null, user);
    } catch (error) {
      return done(error, null);
    }
  }
);

// Override userProfile to fetch via OIDC userinfo endpoint and populate the fields
linkedInStrategy.userProfile = async function userProfile(accessToken, done) {
  try {
    const resp = await fetchFn("https://api.linkedin.com/v2/userinfo", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!resp.ok) {
      return done(new Error(`LinkedIn userinfo failed: ${resp.status}`));
    }

    const info = await resp.json();

    const profile = {
      provider: "linkedin",
      id: info.sub || info.id || info.user_id || null,
      displayName:
        info.name ||
        [info.given_name, info.family_name].filter(Boolean).join(" ") ||
        info.nickname ||
        "",
      emails:
        info.email || info.email_address
          ? [{ value: info.email || info.email_address }]
          : [],
      profileUrl: info.profile || null,
      _json: info,
    };

    if (!profile.id) {
      return done(new Error("LinkedIn userinfo missing id"));
    }

    return done(null, profile);
  } catch (err) {
    return done(err);
  }
};

passport.use(linkedInStrategy);
console.log("LinkedIn client secret exists:", !!LINKEDIN_CLIENT_SECRET);

module.exports = passport;
